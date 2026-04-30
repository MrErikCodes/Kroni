import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  INTRO_ELIGIBILITY_STATUS,
  PurchasesPackage,
  PurchasesOffering,
} from 'react-native-purchases';
import { Platform } from 'react-native';

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

export type PurchaseResult =
  | { kind: 'purchased' }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined') {
      return { kind: 'purchased' };
    }
    // Edge case — store reported success but entitlement didn't propagate.
    // Treat as error so caller can prompt a manual restore.
    return { kind: 'error', message: 'Entitlement not granted' };
  } catch (e) {
    const err = e as { code?: string; message?: string } | undefined;
    if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { kind: 'cancelled' };
    }
    return { kind: 'error', message: err?.message ?? 'Unknown error' };
  }
}

export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch {
    // Non-fatal — proceed without identification
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
  } catch {
    // Non-fatal — proceed without identification
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
