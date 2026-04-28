import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Platform } from 'react-native';

const ENTITLEMENT_ID = 'Kroni Pro';

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

export async function presentPaywall(): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywall();
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
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
