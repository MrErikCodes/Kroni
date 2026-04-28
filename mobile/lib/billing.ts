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

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
  } catch {
    return false;
  }
}
