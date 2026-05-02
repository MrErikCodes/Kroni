import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  INTRO_ELIGIBILITY_STATUS,
  PurchasesPackage,
  PurchasesOffering,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

const ENTITLEMENT_ID = 'kroni_family';

export function configureRevenueCat(): void {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  } else {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
  }
  const iosKey = process.env.EXPO_PUBLIC_RC_IOS_KEY;
  const androidKey = process.env.EXPO_PUBLIC_RC_ANDROID_KEY;
  if (Platform.OS === 'ios' && iosKey) {
    Purchases.configure({ apiKey: iosKey });
  } else if (Platform.OS === 'android' && androidKey) {
    Purchases.configure({ apiKey: androidKey });
  } else {
    // No key for this platform — paywall + identity bridge will silently no-op
    // unless we surface it. Capture so we can see it in the dashboard instead
    // of debugging the symptom (no customer record in RC).
    Sentry.captureMessage('RevenueCat not configured: missing API key', {
      level: 'warning',
      tags: { area: 'billing', platform: Platform.OS },
      extra: { hasIosKey: Boolean(iosKey), hasAndroidKey: Boolean(androidKey) },
    });
  }
}

export async function isProActive(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export type TrialEligibility = 'eligible' | 'ineligible' | 'unknown';

// Android always reports UNKNOWN (Play Billing exposes eligibility only once
// the purchase sheet is opened), so callers should treat 'unknown' as
// "show the badge" — the user will see the actual eligibility on the store
// sheet itself.
export async function checkTrialEligibility(productId: string): Promise<TrialEligibility> {
  try {
    const map = await Purchases.checkTrialOrIntroductoryPriceEligibility([productId]);
    const status = map[productId]?.status;
    if (status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) return 'eligible';
    if (status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE) return 'ineligible';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// Stable error categories the paywall maps to localized copy. The raw
// RevenueCat error message is always English and verbose ("Test Store:
// Purchase failure simulated"), so we deliberately drop it and render
// our own per-locale string instead.
export type PurchaseErrorCode =
  | 'network'
  | 'alreadyPurchased'
  | 'storeProblem'
  | 'notAllowed'
  | 'entitlementNotGranted'
  | 'generic';

export type PurchaseResult =
  | { kind: 'purchased' }
  | { kind: 'cancelled' }
  | { kind: 'error'; code: PurchaseErrorCode };

function mapPurchaseError(code: string | undefined): PurchaseErrorCode {
  switch (code) {
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
    case PURCHASES_ERROR_CODE.API_ENDPOINT_BLOCKED:
      return 'network';
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
    case PURCHASES_ERROR_CODE.RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR:
      return 'alreadyPurchased';
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
    case PURCHASES_ERROR_CODE.UNKNOWN_BACKEND_ERROR:
    case PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR:
    case PURCHASES_ERROR_CODE.INVALID_RECEIPT_ERROR:
    case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
    case PURCHASES_ERROR_CODE.TEST_STORE_SIMULATED_PURCHASE_ERROR:
      return 'storeProblem';
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return 'notAllowed';
    default:
      return 'generic';
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
      return { kind: 'purchased' };
    }
    // Edge case — store reported success but entitlement didn't propagate.
    // Treat as error so caller can prompt a manual restore.
    return { kind: 'error', code: 'entitlementNotGranted' };
  } catch (e) {
    const err = e as { code?: string } | undefined;
    if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { kind: 'cancelled' };
    }
    return { kind: 'error', code: mapPurchaseError(err?.code) };
  }
}

export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    Sentry.captureException(e, {
      tags: { area: 'billing', op: 'identifyUser' },
      extra: { userId },
    });
  }
}

/**
 * Bind a Clerk user id to RevenueCat. Any anonymous purchases made before
 * Clerk login transfer to this app_user_id, so backend webhooks can resolve
 * the entitlement against the parent record keyed on Clerk user id.
 */
export async function loginRevenueCat(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    Sentry.captureException(e, {
      tags: { area: 'billing', op: 'loginRevenueCat' },
      extra: { userId },
    });
  }
}

/**
 * Reset RevenueCat to a fresh anonymous id. Called when the parent signs out
 * so a different parent on the same device doesn't inherit entitlements from
 * the previous session.
 */
export async function logoutRevenueCat(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch {
    // Non-fatal — RC will throw if already anonymous, which is fine.
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}
