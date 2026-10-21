// AdMob + RevenueCat wrappers. Both are OPTIONAL: in Expo Go (no native modules) they silently no-op so the app still runs.
import React from 'react';
import { Alert } from 'react-native';
let M = null, RC = null;
try { M = require('react-native-google-mobile-ads'); } catch {}
try { RC = require('react-native-purchases').default; } catch {}
const unit = n => (__DEV__ || !process.env[`EXPO_PUBLIC_ADMOB_${n}`]) ? M.TestIds[n] : process.env[`EXPO_PUBLIC_ADMOB_${n}`];

export function Banner({ premium }) {
  if (!M || premium) return null;
  const { BannerAd, BannerAdSize } = M;
  return <BannerAd unitId={unit('BANNER')} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
}

export const showInterstitial = () => new Promise(res => {
  if (!M) return res();
  try {
    const { InterstitialAd, AdEventType } = M;
    const ad = InterstitialAd.createForAdRequest(unit('INTERSTITIAL'));
    ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
    ad.addAdEventListener(AdEventType.CLOSED, () => res());
    ad.addAdEventListener(AdEventType.ERROR, () => res());
    ad.load(); setTimeout(res, 6000);
  } catch { res(); }
});

// Resolves true if the reward was earned (or if ads aren't available, so the app never gets stuck)
export const showRewarded = () => new Promise(res => {
  if (!M) return res(true);
  try {
    const { RewardedAd, RewardedAdEventType, AdEventType } = M;
    const ad = RewardedAd.createForAdRequest(unit('REWARDED'));
    let earned = false;
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => ad.show());
    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; });
    ad.addAdEventListener(AdEventType.CLOSED, () => res(earned));
    ad.addAdEventListener(AdEventType.ERROR, () => res(true));
    ad.load();
  } catch { res(true); }
});

// One-time $2.99 "Premium Basic" via RevenueCat (entitlement id: "premium")
export async function buyPremium() {
  const key = process.env.EXPO_PUBLIC_RC_KEY;
  if (!RC || !key) { Alert.alert('Premium Basic', 'In-app purchases work in the installed APK/IPA build with a RevenueCat key (see README).'); return false; }
  try {
    RC.configure({ apiKey: key });
    const o = await RC.getOfferings();
    const r = await RC.purchasePackage(o.current.availablePackages[0]);
    return !!r.customerInfo.entitlements.active.premium;
  } catch (e) { if (!e.userCancelled) Alert.alert('Purchase failed', e.message); return false; }
}
export async function restorePremium() {
  try { const key = process.env.EXPO_PUBLIC_RC_KEY; if (!RC || !key) return false; RC.configure({ apiKey: key });
    return !!(await RC.restorePurchases()).entitlements.active.premium; } catch { return false; }
}
