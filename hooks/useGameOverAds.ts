import { useCallback, useEffect, useRef } from 'react';
import { useInterstitialAd, useRewardedAd } from 'react-native-google-mobile-ads';

import { AD_UNIT_IDS } from '../lib/ads';

const GAME_OVERS_PER_INTERSTITIAL = 3;

/**
 * Owns the rewarded ("watch ad to continue") and interstitial (shown after
 * every 3rd declined rewarded ad) placements for the game-over flow. All ad
 * SDK calls are wrapped in try/catch so a failed load never blocks play.
 */
export function useGameOverAds() {
  const rewarded = useRewardedAd(AD_UNIT_IDS.rewarded);
  const interstitial = useInterstitialAd(AD_UNIT_IDS.interstitial);
  const declinedCount = useRef(0);
  const onRewardEarnedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      rewarded.load();
    } catch (error) {
      console.warn('[ads] rewarded load failed', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      interstitial.load();
    } catch (error) {
      console.warn('[ads] interstitial load failed', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rewarded.isClosed) {
      try {
        rewarded.load();
      } catch (error) {
        console.warn('[ads] rewarded reload failed', error);
      }
    }
  }, [rewarded.isClosed, rewarded.load]);

  useEffect(() => {
    if (interstitial.isClosed) {
      try {
        interstitial.load();
      } catch (error) {
        console.warn('[ads] interstitial reload failed', error);
      }
    }
  }, [interstitial.isClosed, interstitial.load]);

  useEffect(() => {
    if (rewarded.isEarnedReward && onRewardEarnedRef.current) {
      const callback = onRewardEarnedRef.current;
      onRewardEarnedRef.current = null;
      callback();
    }
  }, [rewarded.isEarnedReward]);

  /** Shows the rewarded ad; calls `onEarned` only if the user actually earns the reward. */
  const watchRewardedAd = useCallback(
    (onEarned: () => void): boolean => {
      try {
        if (!rewarded.isLoaded) return false;
        onRewardEarnedRef.current = onEarned;
        rewarded.show();
        return true;
      } catch (error) {
        console.warn('[ads] failed to show rewarded ad', error);
        return false;
      }
    },
    [rewarded]
  );

  /** Call when the player declines/skips the rewarded option on game over. */
  const registerDecline = useCallback(() => {
    declinedCount.current += 1;
    if (declinedCount.current % GAME_OVERS_PER_INTERSTITIAL !== 0) return;
    try {
      if (interstitial.isLoaded) {
        interstitial.show();
      }
    } catch (error) {
      console.warn('[ads] failed to show interstitial ad', error);
    }
  }, [interstitial]);

  return {
    isRewardedReady: rewarded.isLoaded,
    watchRewardedAd,
    registerDecline,
  };
}
