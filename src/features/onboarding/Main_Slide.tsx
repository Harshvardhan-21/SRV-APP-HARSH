import React from 'react';
import {
  type DimensionValue,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  type ImageStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, Line, Polyline } from 'react-native-svg';
import { hs, isSmallDevice, isTablet, rf, screenWidth, ws } from '@/shared/hooks/useResponsive';

export type UserRole = 'user' | 'dealer' | 'electrician' | 'counter-boy';

interface MainSlideProps {
  onRoleSelect: (role: UserRole) => void;
}

type RoleCardConfig = {
  role: UserRole;
  image: number;
  imageStyle?: ImageStyle;
};

type FeatureBadgeConfig = {
  title: string;
  icon: 'shield' | 'award' | 'check' | 'target';
  accent: string;
};

const LOGO = require('../../../assets/srv-login-logo.png');
const DEALER = require('../../../assets/Dealear_main.png');
const ELECTRICIAN = require('../../../assets/electrician_main.png');
const CUSTOMER = require('../../../assets/Customer_main.png');
const COUNTER_BOY = require('../../../assets/Counter_main.png');

const PAGE_BG = '#F5F2F0';
const DARK_NAVY = '#081A37';
const GOLD = '#C9802A';

const CARD_DATA: RoleCardConfig[] = [
  {
    role: 'dealer',
    image: DEALER,
  },
  {
    role: 'electrician',
    image: ELECTRICIAN,
  },
  {
    role: 'user',
    image: CUSTOMER,
  },
  {
    role: 'counter-boy',
    image: COUNTER_BOY,
  },
];

const FEATURE_BADGES: FeatureBadgeConfig[] = [
  { title: 'BUILT WITH TRUST', icon: 'shield', accent: '#173E80' },
  { title: 'DRIVEN BY QUALITY', icon: 'award', accent: '#C85A2C' },
  { title: 'RELIABLE & DURABLE', icon: 'check', accent: '#188A2D' },
  { title: 'PRECISION PERFORMANCE', icon: 'target', accent: '#C7332F' },
];

function DividerTitle({ label, color = DARK_NAVY }: { label: string; color?: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
      <View style={styles.dividerLabelWrap}>
        <View style={[styles.diamond, { backgroundColor: GOLD }]} />
        <Text style={[styles.dividerLabel, { color }]}>{label}</Text>
        <View style={[styles.diamond, { backgroundColor: GOLD }]} />
      </View>
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
    </View>
  );
}

function FeatureIcon({ icon, accent }: { icon: FeatureBadgeConfig['icon']; accent: string }) {
  if (icon === 'shield') {
    return (
      <Svg width={ws(24)} height={ws(24)} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3L19 6V11.4C19 16 16.1 19.9 12 21C7.9 19.9 5 16 5 11.4V6L12 3Z"
          stroke={accent}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M9.3 11.9L11.1 13.7L14.8 10"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (icon === 'award') {
    return (
      <Svg width={ws(24)} height={ws(24)} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="9" r="5" stroke={accent} strokeWidth="2" />
        <Path
          d="M9 14.5L7 21L12 18.6L17 21L15 14.5"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="9" r="1.6" fill={accent} />
      </Svg>
    );
  }

  if (icon === 'check') {
    return (
      <Svg width={ws(24)} height={ws(24)} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="16" height="16" rx="8" stroke={accent} strokeWidth="2" />
        <Polyline
          points="8.5,12.5 11,15 16,9.8"
          stroke={accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  return (
    <Svg width={ws(24)} height={ws(24)} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="7" stroke={accent} strokeWidth="2" />
      <Circle cx="12" cy="12" r="3" stroke={accent} strokeWidth="2" />
      <Circle cx="12" cy="12" r="1.5" fill={accent} />
      <Line x1="12" y1="2.5" x2="12" y2="5.2" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="12" y1="18.8" x2="12" y2="21.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="2.5" y1="12" x2="5.2" y2="12" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="18.8" y1="12" x2="21.5" y2="12" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function RoleCard({
  item,
  onPress,
  cardWidth,
}: {
  item: RoleCardConfig;
  onPress: () => void;
  cardWidth: DimensionValue;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.role} profile`}
      onPress={onPress}
      style={[styles.roleCardPressable, { width: cardWidth }]}
    >
      <View style={styles.roleCard}>
        <Image
          source={item.image}
          resizeMode="stretch"
          style={[styles.roleImageFull, item.imageStyle]}
        />
      </View>
    </Pressable>
  );
}

export default function MainSlide({ onRoleSelect }: MainSlideProps) {
  const insets = useSafeAreaInsets();
  const compact = isSmallDevice;
  const cardWidth: DimensionValue = isTablet ? '48.9%' : '48.4%';
  const cornerTop = insets.top + hs(6);
  const cornerGlowTop = cornerTop + hs(10);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.content,
          compact ? styles.contentCompact : null,
          { paddingTop: Math.max(insets.top, hs(8)) + hs(14) },
        ]}
      >
        <View style={[styles.cornerTopLeft, { top: cornerTop }]} />
        <View style={[styles.cornerTopRight, { top: cornerTop }]} />
        <View style={[styles.cornerGlowLeft, { top: cornerGlowTop }]} />
        <View style={[styles.cornerGlowRight, { top: cornerGlowTop }]} />

        <View style={styles.heroArt}>
          <Image source={LOGO} resizeMode="contain" style={styles.heroLogo} />
        </View>

        <DividerTitle label="25 YEARS OF TRUST & IMPROVEMENT" color={GOLD} />

        <Text style={[styles.welcomeTitle, compact ? styles.welcomeTitleCompact : null]}>
          SRV WELCOMES YOU
        </Text>
        <Text style={styles.welcomeSubtitle}>
          North India&apos;s Largest Metal Box Manufacturer
        </Text>

        <DividerTitle label="CHOOSE YOUR PROFILE" />

        <View style={styles.grid}>
          {CARD_DATA.map((item) => (
            <RoleCard
              key={item.role}
              item={item}
              cardWidth={cardWidth}
              onPress={() => onRoleSelect(item.role)}
            />
          ))}
        </View>

        <View style={styles.featuresGrid}>
          {FEATURE_BADGES.map((badge) => (
            <View key={badge.title} style={styles.featureCard}>
              <FeatureIcon icon={badge.icon} accent={badge.accent} />
              <Text style={styles.featureText}>{badge.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  content: {
    flex: 1,
    paddingHorizontal: ws(18),
    paddingBottom: hs(12),
    backgroundColor: PAGE_BG,
  },
  contentCompact: {
    paddingHorizontal: ws(14),
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ws(118),
    height: hs(96),
    borderBottomRightRadius: ws(46),
    backgroundColor: DARK_NAVY,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: ws(118),
    height: hs(96),
    borderBottomLeftRadius: ws(46),
    backgroundColor: DARK_NAVY,
  },
  cornerGlowLeft: {
    position: 'absolute',
    top: hs(12),
    left: -ws(10),
    width: ws(130),
    height: hs(62),
    borderBottomRightRadius: ws(46),
    borderWidth: 3,
    borderColor: '#E4AF52',
    opacity: 0.92,
  },
  cornerGlowRight: {
    position: 'absolute',
    top: hs(12),
    right: -ws(10),
    width: ws(130),
    height: hs(62),
    borderBottomLeftRadius: ws(46),
    borderWidth: 3,
    borderColor: '#E4AF52',
    opacity: 0.92,
  },
  heroArt: {
    alignItems: 'center',
    paddingTop: hs(48),
    paddingBottom: hs(6),
  },
  heroLogo: {
    width: ws(198),
    height: hs(70),
    marginBottom: hs(2),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ws(10),
    marginTop: hs(6),
  },
  dividerLine: {
    height: 1.5,
    flex: 1,
    opacity: 0.7,
  },
  dividerLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ws(8),
  },
  diamond: {
    width: ws(8),
    height: ws(8),
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  dividerLabel: {
    fontSize: rf(11, 10, 12),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  welcomeTitle: {
    textAlign: 'center',
    color: DARK_NAVY,
    fontSize: rf(24, 22, 27),
    fontWeight: '900',
    marginTop: hs(14),
  },
  welcomeTitleCompact: {
    fontSize: rf(22, 20, 24),
  },
  welcomeSubtitle: {
    textAlign: 'center',
    color: '#1E2640',
    fontSize: rf(14, 12, 16),
    fontWeight: '500',
    marginTop: hs(8),
    marginBottom: hs(12),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: hs(10),
    marginTop: hs(12),
  },
  roleCardPressable: {
    borderRadius: ws(16),
  },
  roleCard: {
    borderRadius: ws(16),
    height: hs(158),
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(13,29,54,0.08)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  roleImageFull: {
    width: '100%',
    height: '100%',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    marginTop: hs(12),
    gap: ws(6),
  },
  featureCard: {
    flex: 1,
    minHeight: hs(58),
    borderRadius: ws(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1DB',
    paddingHorizontal: ws(8),
    paddingVertical: hs(8),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureText: {
    color: '#1A2237',
    fontSize: rf(8.8, 7.6, 9.5),
    lineHeight: rf(11, 10, 12),
    fontWeight: '800',
    textAlign: 'center',
  },
  featureIconFrame: {
    width: ws(26),
    height: ws(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
