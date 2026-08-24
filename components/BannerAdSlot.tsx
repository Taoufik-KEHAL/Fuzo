import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { useTheme } from '../hooks/useTheme';
import { AD_UNIT_IDS } from '../lib/ads';

const BANNER_HEIGHT = 50;

/** Persistent bottom banner. Reserves its slot but renders nothing if the ad fails to load. */
export function BannerAdSlot() {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {!failed && (
        <BannerAd
          unitId={AD_UNIT_IDS.banner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(error) => {
            console.warn('[ads] banner failed to load', error);
            setFailed(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: BANNER_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
