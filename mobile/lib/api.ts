import Constants from 'expo-constants';
import { z } from 'zod';
import {
  TodayTaskSchema,
  KidSchema,
  BalanceSummarySchema,
  RewardSchema,
  RewardRedemptionSchema,
  ProblemDetailSchema,
} from '@kroni/shared';
import { getKidToken, setKidToken, clearKidToken } from './auth';

// ── Config ───────────────────────────────────────────────────────────────────

const API_URL: string =
  (Constants.expoConfig?.extra?.['apiUrl'] as string | undefined) ??
  'http://localhost:3000';

// ── Typed error ───────────────────────────────────────────────────────────────

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
  init: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  return res;
}

async function handleResponse(res: Response): Promise<unknown> {
  if (res.ok) {
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
// Call this inside a component (React tree) where useAuth is available.

export type GetToken = () => Promise<string | null>;

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
    const res = await fetchWithAuth(path, token, init);
    return handleResponse(res);
  }

  return {
    /** GET /api/kid/today — returns TodayTask[] */
    async getTodayTasks(): Promise<z.infer<typeof TodayTaskSchema>[]> {
      const json = await request('/api/kid/today');
      return z.array(TodayTaskSchema).parse(json);
    },

    /** GET /api/parent/kids */
    async getKids(): Promise<z.infer<typeof KidSchema>[]> {
      const json = await request('/api/parent/kids');
      return z.array(KidSchema).parse(json);
    },

    /** GET /api/parent/rewards */
    async getRewards(): Promise<z.infer<typeof RewardSchema>[]> {
      const json = await request('/api/parent/rewards');
      return z.array(RewardSchema).parse(json);
    },

    /** POST /api/parent/pairing-code */
    async generatePairingCode(): Promise<{ code: string; expiresAt: string }> {
      const json = await request('/api/parent/pairing-code', { method: 'POST' });
      return z.object({ code: z.string(), expiresAt: z.string() }).parse(json);
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

  const res = await fetchWithAuth(path, token, init);

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

  return handleResponse(res);
}

export const kidApi = {
  /** GET /api/kid/today */
  async getTodayTasks(): Promise<z.infer<typeof TodayTaskSchema>[]> {
    const json = await kidRequest('/api/kid/today');
    return z.array(TodayTaskSchema).parse(json);
  },

  /** POST /api/kid/tasks/:completionId/complete */
  async completeTask(completionId: string, idempotencyKey: string): Promise<void> {
    await kidRequest(`/api/kid/tasks/${completionId}/complete`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },

  /** GET /api/kid/balance */
  async getBalance(): Promise<z.infer<typeof BalanceSummarySchema>> {
    const json = await kidRequest('/api/kid/balance');
    return BalanceSummarySchema.parse(json);
  },

  /** GET /api/kid/rewards */
  async getRewards(): Promise<z.infer<typeof RewardSchema>[]> {
    const json = await kidRequest('/api/kid/rewards');
    return z.array(RewardSchema).parse(json);
  },

  /** POST /api/kid/rewards/:id/redeem */
  async redeemReward(rewardId: string): Promise<z.infer<typeof RewardRedemptionSchema>> {
    const json = await kidRequest(`/api/kid/rewards/${rewardId}/redeem`, { method: 'POST' });
    return RewardRedemptionSchema.parse(json);
  },
};
