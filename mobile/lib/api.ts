// [REVIEW] Norwegian copy — verify with native speaker
import Constants from 'expo-constants';
import { z } from 'zod';
import {
  TodayTaskSchema,
  KidSchema,
  CreateKidSchema,
  UpdateKidSchema,
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  RewardSchema,
  CreateRewardSchema,
  UpdateRewardSchema,
  RewardRedemptionSchema,
  BalanceSummarySchema,
  BalanceEntrySchema,
  BalanceAdjustSchema,
  ParentSchema,
  UpdateParentSchema,
  GeneratePairingCodeResponseSchema,
  PairRequestSchema,
  PairResponseSchema,
  HouseholdSummarySchema,
  HouseholdInviteSchema,
  CreateHouseholdInviteResponseSchema,
  JoinHouseholdResponseSchema,
  LoggableTasksResponseSchema,
  LogTaskCompletionResponseSchema,
} from '@kroni/shared';
import type {
  HouseholdSummary,
  HouseholdInvite,
  CreateHouseholdInviteInput,
  CreateHouseholdInviteResponse,
  JoinHouseholdResponse,
  AvatarKey,
  LoggableTask,
  LogTaskCompletionRequest,
  LogTaskCompletionResponse,
} from '@kroni/shared';
import { getKidToken, setKidToken, clearKidToken } from './auth';
import { getDiagnosticHeaders } from './installInfo';

// ── Config ───────────────────────────────────────────────────────────────────

const API_URL: string =
  (Constants.expoConfig?.extra?.['apiUrl'] as string | undefined) ??
  'http://localhost:3000';

// ── Typed error ───────────────────────────────────────────────────────────────

const ProblemDetailSchema = z.object({
  type: z.string().optional(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail;

  constructor(status: number, problem: ProblemDetail) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

// ── Navigation ref (set by root layout) ──────────────────────────────────────

type NavigateFn = (path: string) => void;
let _navigate: NavigateFn | null = null;

export function registerNavigate(fn: NavigateFn): void {
  _navigate = fn;
}

function navigateToRoot(): void {
  _navigate?.('/');
}

export function navigateTo(path: string): void {
  _navigate?.(path);
}

// ── Core fetch helpers ────────────────────────────────────────────────────────

async function parseErrorBody(res: Response): Promise<ProblemDetail> {
  try {
    const json: unknown = await res.json();
    return ProblemDetailSchema.parse(json);
  } catch {
    return {
      type: 'about:blank',
      title: 'Unknown error',
      status: res.status,
      detail: res.statusText,
    };
  }
}

async function fetchWithAuth(
  path: string,
  token: string,
  role: 'parent' | 'kid',
  init: RequestInit = {},
): Promise<Response> {
  // Only declare Content-Type when we are actually sending a body. Fastify
  // rejects POSTs with 'application/json' + empty body as
  // "Body cannot be empty when content-type is set to 'application/json'".
  const hasBody = init.body !== undefined && init.body !== null;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    // Diagnostic headers — install id + platform + app version + role.
    // Read by the backend auth plugins to tag logs and upsert
    // parent_installs / kid_installs; same value goes into Sentry tags.
    ...getDiagnosticHeaders(role),
  };
  if (hasBody) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers ?? {}),
    },
  });
  return res;
}

async function handleResponse(res: Response): Promise<unknown> {
  if (res.ok) {
    if (res.status === 204) return undefined;
    return res.json();
  }
  const problem = await parseErrorBody(res);
  const err = new ApiError(res.status, problem);
  if (res.status === 401) {
    navigateToRoot();
  }
  throw err;
}

// ── Parent API factory ────────────────────────────────────────────────────────

export type GetToken = () => Promise<string | null>;

// Shape returned from GET /parent/approvals
export interface PendingApprovalItem {
  completionId: string;
  taskId: string;
  kidId: string;
  kidName: string;
  title: string;
  rewardCents: number;
  completedAt: string;
}

export interface PendingRedemptionItem {
  redemptionId: string;
  rewardId: string;
  kidId: string;
  kidName: string;
  title: string;
  icon: string | null;
  costCents: number;
  requestedAt: string;
}

export interface PendingApprovals {
  taskCompletions: PendingApprovalItem[];
  rewardRedemptions: PendingRedemptionItem[];
}

// Shape for billing status
const BillingStatusSchema = z.object({
  tier: z.enum(['free', 'family']),
  expiresAt: z.string().nullable(),
  // Older backends didn't return these; .default keeps existing builds
  // safe during a phased deploy.
  lifetimePaid: z.boolean().optional().default(false),
  isPaid: z.boolean().optional().default(false),
  // Surfaced from RevenueCat via webhook. `null` for no-active-sub or
  // lifetime owners (not periodic). Optional so cached responses from
  // pre-rollout backends still parse — treated as "not trial".
  periodType: z.enum(['TRIAL', 'INTRO', 'NORMAL']).nullable().optional(),
});
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

// Balance entry from GET /kid/history
const BalanceHistoryResponseSchema = z.object({
  entries: z.array(BalanceEntrySchema),
  total: z.number(),
});

// Kid me schema
const KidMeSchema = KidSchema;

export function clientFor(getToken: GetToken) {
  async function request(path: string, init: RequestInit = {}): Promise<unknown> {
    const token = await getToken();
    if (!token) {
      navigateToRoot();
      throw new ApiError(401, {
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'No session token',
      });
    }
    const res = await fetchWithAuth(path, token, 'parent', init);

    // Handle 402 Payment Required — redirect to paywall
    if (res.status === 402) {
      const problem = await parseErrorBody(res);
      navigateTo('/(parent)/paywall');
      throw new ApiError(402, problem);
    }

    return handleResponse(res);
  }

  return {
    // ── Me ──────────────────────────────────────────────────────────────────
    async getMe(): Promise<z.infer<typeof ParentSchema>> {
      const json = await request('/parent/me');
      return ParentSchema.parse(json);
    },

    async updateMe(data: z.infer<typeof UpdateParentSchema>): Promise<z.infer<typeof ParentSchema>> {
      const json = await request('/parent/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return ParentSchema.parse(json);
    },

    // ── Kids ────────────────────────────────────────────────────────────────
    async getKids(): Promise<z.infer<typeof KidSchema>[]> {
      const json = await request('/parent/kids');
      return z.array(KidSchema).parse(json);
    },

    async getKid(id: string): Promise<z.infer<typeof KidSchema>> {
      const json = await request(`/parent/kids/${id}`);
      return KidSchema.parse(json);
    },

    async createKid(data: z.infer<typeof CreateKidSchema>): Promise<z.infer<typeof KidSchema>> {
      const json = await request('/parent/kids', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return KidSchema.parse(json);
    },

    async updateKid(id: string, data: z.infer<typeof UpdateKidSchema>): Promise<z.infer<typeof KidSchema>> {
      const json = await request(`/parent/kids/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return KidSchema.parse(json);
    },

    async deleteKid(id: string): Promise<void> {
      await request(`/parent/kids/${id}`, { method: 'DELETE' });
    },

    // ── Kid balance & history ───────────────────────────────────────────────
    async getKidBalance(id: string): Promise<z.infer<typeof BalanceSummarySchema>> {
      const json = await request(`/parent/kids/${id}/balance`);
      return BalanceSummarySchema.parse(json);
    },

    async getKidHistory(id: string, limit?: number): Promise<z.infer<typeof BalanceEntrySchema>[]> {
      const qs = limit !== undefined ? `?limit=${encodeURIComponent(limit)}` : '';
      const json = await request(`/parent/kids/${id}/history${qs}`);
      return z.array(BalanceEntrySchema).parse(json);
    },

    async adjustKidBalance(
      input: z.infer<typeof BalanceAdjustSchema>,
    ): Promise<{ entryId: string; newBalanceCents: number }> {
      const json = await request('/parent/balance/adjust', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return z
        .object({ entryId: z.string().uuid(), newBalanceCents: z.number().int() })
        .parse(json);
    },

    // ── Pairing ─────────────────────────────────────────────────────────────
    async generatePairingCode(
      kidId: string,
    ): Promise<z.infer<typeof GeneratePairingCodeResponseSchema>> {
      const json = await request('/parent/pairing-code', {
        method: 'POST',
        body: JSON.stringify({ kidId }),
      });
      return GeneratePairingCodeResponseSchema.parse(json);
    },

    // Regenerate (revoke + reissue) the kid's pairing code in place — used by
    // the kid detail screen when the kid loses their device. Backend
    // invalidates any prior un-used code for this kid, then issues a fresh
    // 6-digit one with the standard 15-min TTL.
    async regenerateKidPairingCode(
      kidId: string,
    ): Promise<{ code: string; expiresAt: string }> {
      return this.generatePairingCode(kidId);
    },

    // ── Tasks ───────────────────────────────────────────────────────────────
    async getTasks(): Promise<z.infer<typeof TaskSchema>[]> {
      const json = await request('/parent/tasks');
      return z.array(TaskSchema).parse(json);
    },

    async createTask(data: z.infer<typeof CreateTaskSchema>): Promise<z.infer<typeof TaskSchema>> {
      const json = await request('/parent/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return TaskSchema.parse(json);
    },

    async updateTask(id: string, data: z.infer<typeof UpdateTaskSchema>): Promise<z.infer<typeof TaskSchema>> {
      const json = await request(`/parent/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return TaskSchema.parse(json);
    },

    async deleteTask(id: string): Promise<void> {
      await request(`/parent/tasks/${id}`, { method: 'DELETE' });
    },

    async getLoggableTasks(): Promise<LoggableTask[]> {
      const json = await request('/parent/tasks/loggable');
      return LoggableTasksResponseSchema.parse(json);
    },

    async logTaskCompletion(
      taskId: string,
      body: LogTaskCompletionRequest,
    ): Promise<LogTaskCompletionResponse> {
      const json = await request(`/parent/tasks/${taskId}/log-completion`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return LogTaskCompletionResponseSchema.parse(json);
    },

    // ── Approvals ────────────────────────────────────────────────────────────
    async getApprovals(): Promise<PendingApprovals> {
      const json = await request('/parent/approvals');
      const parsed = z
        .object({
          taskCompletions: z.array(
            z.object({
              completionId: z.string(),
              taskId: z.string(),
              kidId: z.string(),
              kidName: z.string(),
              title: z.string(),
              rewardCents: z.number(),
              completedAt: z.string(),
            }),
          ),
          rewardRedemptions: z
            .array(
              z.object({
                redemptionId: z.string(),
                rewardId: z.string(),
                kidId: z.string(),
                kidName: z.string(),
                title: z.string(),
                icon: z.string().nullable(),
                costCents: z.number(),
                requestedAt: z.string(),
              }),
            )
            // Tolerate older backend that didn't return this field — keeps
            // the kid app installable while a phased deploy is in flight.
            .optional()
            .default([]),
        })
        .parse(json);
      return {
        taskCompletions: parsed.taskCompletions,
        rewardRedemptions: parsed.rewardRedemptions,
      };
    },

    async approveTask(completionId: string): Promise<{ newBalanceCents: number }> {
      const json = await request(
        `/parent/approvals/tasks/${completionId}/approve`,
        { method: 'POST' },
      );
      return z.object({ newBalanceCents: z.number() }).parse(json);
    },

    async rejectTask(completionId: string): Promise<void> {
      await request(`/parent/approvals/tasks/${completionId}/reject`, {
        method: 'POST',
      });
    },

    async approveReward(redemptionId: string): Promise<void> {
      await request(`/parent/approvals/rewards/${redemptionId}/approve`, {
        method: 'POST',
      });
    },

    async rejectReward(redemptionId: string): Promise<void> {
      await request(`/parent/approvals/rewards/${redemptionId}/reject`, {
        method: 'POST',
      });
    },

    // ── Rewards ─────────────────────────────────────────────────────────────
    async getRewards(): Promise<z.infer<typeof RewardSchema>[]> {
      const json = await request('/parent/rewards');
      return z.array(RewardSchema).parse(json);
    },

    async createReward(data: z.infer<typeof CreateRewardSchema>): Promise<z.infer<typeof RewardSchema>> {
      const json = await request('/parent/rewards', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return RewardSchema.parse(json);
    },

    async updateReward(id: string, data: z.infer<typeof UpdateRewardSchema>): Promise<z.infer<typeof RewardSchema>> {
      const json = await request(`/parent/rewards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return RewardSchema.parse(json);
    },

    async deleteReward(id: string): Promise<void> {
      await request(`/parent/rewards/${id}`, { method: 'DELETE' });
    },

    // ── Billing ─────────────────────────────────────────────────────────────
    async getBillingStatus(): Promise<BillingStatus> {
      const json = await request('/parent/billing/status');
      return BillingStatusSchema.parse(json);
    },

    // ── Household ───────────────────────────────────────────────────────────
    async getHousehold(): Promise<HouseholdSummary> {
      const json = await request('/parent/household/me');
      return HouseholdSummarySchema.parse(json);
    },

    async createHouseholdInvite(
      input: CreateHouseholdInviteInput,
    ): Promise<CreateHouseholdInviteResponse> {
      const body =
        input.invitedEmail !== undefined
          ? JSON.stringify({ invitedEmail: input.invitedEmail })
          : JSON.stringify({});
      const json = await request('/parent/household/invites', {
        method: 'POST',
        body,
      });
      return CreateHouseholdInviteResponseSchema.parse(json);
    },

    async listHouseholdInvites(): Promise<HouseholdInvite[]> {
      const json = await request('/parent/household/invites');
      return z.array(HouseholdInviteSchema).parse(json);
    },

    async revokeHouseholdInvite(code: string): Promise<void> {
      await request(`/parent/household/invites/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
    },

    async joinHousehold(code: string): Promise<JoinHouseholdResponse> {
      // Note: requires Clerk Bearer (parent session); reuses the same `request`
      // helper because it threads the parent token via `getToken`.
      const json = await request('/public/household/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      return JoinHouseholdResponseSchema.parse(json);
    },

    // ── Devices (push) ──────────────────────────────────────────────────────
    /** POST /parent/devices */
    async registerParentDevice(
      deviceId: string,
      pushToken: string,
      platform: 'ios' | 'android',
    ): Promise<void> {
      await request('/parent/devices', {
        method: 'POST',
        body: JSON.stringify({ deviceId, pushToken, platform }),
      });
    },
  };
}

export const parentApi = { clientFor };

// ── Kid API ───────────────────────────────────────────────────────────────────

async function kidRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const token = await getKidToken();
  if (!token) {
    navigateToRoot();
    throw new ApiError(401, {
      type: 'about:blank',
      title: 'Unauthorized',
      status: 401,
      detail: 'No kid token',
    });
  }

  const res = await fetchWithAuth(path, token, 'kid', init);

  // Honor x-token-refresh header
  const refreshed = res.headers.get('x-token-refresh');
  if (refreshed) {
    await setKidToken(refreshed);
  }

  if (res.status === 401) {
    await clearKidToken();
    navigateToRoot();
    const problem = await parseErrorBody(res);
    throw new ApiError(401, problem);
  }

  // 402 Payment Required — household subscription has lapsed. Kids can't
  // open the paywall (only the parent owner can manage billing), so we
  // surface a typed error the kid screens render as a friendly banner.
  if (res.status === 402) {
    const problem = await parseErrorBody(res);
    throw new ApiError(402, problem);
  }

  return handleResponse(res);
}

/** True when an unknown error is a typed 402 from the kid client. */
export function isSubscriptionLapsedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 402;
}

export const kidApi = {
  /** GET /kid/me */
  async getMe(): Promise<z.infer<typeof KidMeSchema>> {
    const json = await kidRequest('/kid/me');
    return KidMeSchema.parse(json);
  },

  /** PATCH /kid/me — kid updates their own avatar from the kid app. */
  async updateMyAvatar(avatarKey: AvatarKey): Promise<z.infer<typeof KidMeSchema>> {
    const json = await kidRequest('/kid/me', {
      method: 'PATCH',
      body: JSON.stringify({ avatarKey }),
    });
    return KidMeSchema.parse(json);
  },

  /** GET /kid/today */
  async getTodayTasks(): Promise<z.infer<typeof TodayTaskSchema>[]> {
    const json = await kidRequest('/kid/today');
    return z.array(TodayTaskSchema).parse(json);
  },

  /** POST /kid/tasks/:completionId/complete */
  async completeTask(completionId: string, idempotencyKey: string): Promise<void> {
    await kidRequest(`/kid/tasks/${completionId}/complete`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },

  /** POST /kid/tasks/:completionId/uncomplete — undo a mistaken complete */
  async uncompleteTask(completionId: string): Promise<void> {
    await kidRequest(`/kid/tasks/${completionId}/uncomplete`, {
      method: 'POST',
    });
  },

  /** GET /kid/balance */
  async getBalance(): Promise<z.infer<typeof BalanceSummarySchema>> {
    const json = await kidRequest('/kid/balance');
    return BalanceSummarySchema.parse(json);
  },

  /** GET /kid/history */
  async getHistory(): Promise<z.infer<typeof BalanceEntrySchema>[]> {
    const json = await kidRequest('/kid/history');
    // Backend may return array directly or { entries: [...] }
    if (Array.isArray(json)) {
      return z.array(BalanceEntrySchema).parse(json);
    }
    const parsed = BalanceHistoryResponseSchema.parse(json);
    return parsed.entries;
  },

  /** GET /kid/rewards */
  async getRewards(): Promise<z.infer<typeof RewardSchema>[]> {
    const json = await kidRequest('/kid/rewards');
    return z.array(RewardSchema).parse(json);
  },

  /** POST /kid/rewards/:id/redeem
   *
   * Backend returns the lightweight redemption descriptor — we don't need
   * the full row here, just confirmation that the redemption was accepted
   * and entered the parent's approval queue. Parsing against the larger
   * `RewardRedemptionSchema` would fail (no `id`, no `requestedAt`) and
   * surface as a silent generic error — which is the bug we're fixing.
   */
  async redeemReward(rewardId: string): Promise<{
    redemptionId: string;
    rewardId: string;
    costCents: number;
  }> {
    const json = await kidRequest(`/kid/rewards/${rewardId}/redeem`, {
      method: 'POST',
    });
    return z
      .object({
        redemptionId: z.string().uuid(),
        rewardId: z.string().uuid(),
        costCents: z.number().int().nonnegative(),
      })
      .parse(json);
  },

  /** POST /kid/device */
  async registerDevice(deviceId: string, pushToken: string): Promise<void> {
    await kidRequest('/kid/device', {
      method: 'POST',
      body: JSON.stringify({ deviceId, pushToken }),
    });
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export const publicApi = {
  /** POST /public/pair */
  async pair(data: z.infer<typeof PairRequestSchema>): Promise<z.infer<typeof PairResponseSchema>> {
    const res = await fetch(`${API_URL}/public/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const problem = await parseErrorBody(res);
      throw new ApiError(res.status, problem);
    }
    const json: unknown = await res.json();
    return PairResponseSchema.parse(json);
  },
};
