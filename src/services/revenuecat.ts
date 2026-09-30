import Purchases, { CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

// From the RevenueCat dashboard — public SDK keys, safe to ship in-app.
const REVENUECAT_API_KEY_IOS = 'appl_YOUR_IOS_KEY';
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY';

export const ENTITLEMENT_ID = 'premium'; // must match the entitlement identifier set up in RevenueCat

export function initPurchases() {
  const key = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  Purchases.configure({ apiKey: key });
}

export async function isPremium(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
  } catch (e) {
    console.warn('RevenueCat getCustomerInfo failed', e);
    return false;
  }
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current; // configure a "default" offering with weekly/monthly/annual packages in the dashboard
}

export async function purchasePackage(pkg: any): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
}
