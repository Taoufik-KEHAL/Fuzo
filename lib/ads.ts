import { TestIds } from 'react-native-google-mobile-ads';

// TEST ad unit IDs only. Swap for real AdMob unit IDs before any production
// release — see README.md.
export const AD_UNIT_IDS = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
};

let initPromise: Promise<void> | null = null;

/** Initializes the Mobile Ads SDK once. Safe to call multiple times. */
export function initializeAds(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { MobileAds } = await import('react-native-google-mobile-ads');
        await MobileAds().initialize();
      } catch (error) {
        console.warn('[ads] failed to initialize Mobile Ads SDK', error);
      }
    })();
  }
  return initPromise;
}
