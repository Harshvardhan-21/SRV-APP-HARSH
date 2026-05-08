import { LinearGradient } from 'expo-linear-gradient';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { withWebSafeNativeDriver } from '@/shared/animations/nativeDriver';
import { usePreferenceContext } from '@/shared/preferences';
import { createShadow } from '@/shared/theme/shadows';

const logoImage = require('../../../assets/srv logo white.jpeg');

interface Profile {
  name?: string;
  phone?: string;
  dealer_code?: string;
  electrician_code?: string;
  user_code?: string;
  counterboy_code?: string;
  dealer_name?: string;
  dealer_town?: string;
  dealer_phone?: string;
  town?: string;
  district?: string;
  state?: string;
  address?: string;
}

interface Props {
  profile?: Profile;
  role?: 'dealer' | 'electrician' | 'counterboy' | 'user';
  photoUri?: string | null;
  apiPhotoUri?: string | null;
}

function DownloadIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4.5v9m0 0l-3.5-3.5M12 13.5l3.5-3.5M5 16.5v1a2 2 0 002 2h10a2 2 0 002-2v-1"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LocationIcon({ color = '#FFFFFF', size = 12 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s6-5.33 6-11a6 6 0 10-12 0c0 5.67 6 11 6 11z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getLogoDataUri() {
  try {
    const assetUri = Image.resolveAssetSource(logoImage).uri;
    const base64 = await LegacyFileSystem.readAsStringAsync(assetUri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}
function DetailPill({
  label,
  value,
  compact = false,
  lines,
  icon,
}: {
  label: string;
  value: string;
  compact?: boolean;
  lines?: number;
  icon?: React.ReactNode;
}) {
  const { tx } = usePreferenceContext();
  return (
    <View style={[styles.detailPill, compact && styles.detailPillCompact]}>
      <Text style={styles.detailLabel}>{tx(label)}</Text>
      <View style={styles.detailValueRow}>
        {icon ? <View style={styles.detailIconWrap}>{icon}</View> : null}
        <Text
          style={[styles.detailValue, compact && styles.detailValueCompact]}
          numberOfLines={lines}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileFlipCard({ profile, role = 'electrician', photoUri, apiPhotoUri }: Props) {
  const { darkMode, tx, t } = usePreferenceContext();
  // Use local photo first, then API photo from backend (set by admin)
  const effectivePhotoUri = photoUri ?? apiPhotoUri ?? null;
  const [flipped, setFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const hintPulse = useRef(new Animated.Value(1)).current;

  const initials = (profile?.name || 'U')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isDealer = role === 'dealer';
  const code = isDealer
    ? profile?.dealer_code
    : role === 'user'
    ? profile?.user_code
    : role === 'counterboy'
    ? profile?.counterboy_code
    : profile?.electrician_code;
  const qrValue = code || profile?.phone || 'SRV';
  const qrUrl =
    'https://quickchart.io/qr?text=' +
    encodeURIComponent(qrValue) +
    '&size=220&margin=1&dark=111827&light=FFFFFF';

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: [0, 0, 1, 1],
  });

  const animateTo = useCallback(
    (toBack: boolean) => {
      setFlipped(toBack);
      Animated.spring(
        flipAnim,
        withWebSafeNativeDriver({
          toValue: toBack ? 1 : 0,
          tension: 70,
          friction: 9,
        })
      ).start();
    },
    [flipAnim]
  );

  useEffect(() => {
    const showBack = setTimeout(() => animateTo(true), 4500);
    const showFront = setTimeout(() => animateTo(false), 9000);
    return () => {
      clearTimeout(showBack);
      clearTimeout(showFront);
    };
  }, [animateTo]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(hintPulse, withWebSafeNativeDriver({ toValue: 1.06, duration: 900 })),
        Animated.timing(hintPulse, withWebSafeNativeDriver({ toValue: 1, duration: 900 })),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [hintPulse]);

  const onToggle = () => {
    const next = !flipped;
    animateTo(next);
    if (next) {
      setTimeout(() => animateTo(false), 4500);
    }
  };

  const fallbackText = tx('Not available');
  const dealerName =
    isDealer ? profile?.name || fallbackText : profile?.dealer_name || fallbackText;
  const formatTranslatedLocation = (parts: (string | undefined)[]) =>
    parts
      .filter(Boolean)
      .map((part) => tx(part as string))
      .join(', ');

  const dealerLocation =
    isDealer
      ? formatTranslatedLocation([profile?.town, profile?.state]) || fallbackText
      : formatTranslatedLocation([profile?.dealer_town, profile?.state]) || fallbackText;
  const dealerPhoneValue = isDealer ? profile?.phone : profile?.dealer_phone;
  const dealerPhone = dealerPhoneValue ? '+91 ' + dealerPhoneValue : fallbackText;
  const dealerAddress = profile?.address
    ? profile.address
        .replace(/\bPunjab\b/g, tx('Punjab'))
        .replace(/\bMansa\b/g, tx('Mansa'))
        .replace(/\bIndia\b/g, tx('India'))
    : fallbackText;
  const frontLocation =
    isDealer
      ? dealerLocation
      : formatTranslatedLocation([profile?.town, profile?.state]) || fallbackText;
  const codeLabel = isDealer
    ? tx('Dealer Code')
    : role === 'user'
    ? tx('Customer ID')
    : role === 'counterboy'
    ? tx('Counter Boy ID')
    : tx('Electrician Code');
  const backThirdLabel = isDealer || role === 'user' ? tx('Address') : tx('Phone Number');
  const backThirdValue = isDealer ? dealerAddress : role === 'user' ? dealerAddress : dealerPhone;
  const exportName =
    (profile?.name || dealerName || fallbackText)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'srv-profile-card';

  const buildPdfHtml = (logoDataUri: string | null) => {
    const profileName = escapeHtml(profile?.name || fallbackText);
    const profilePhone = escapeHtml(profile?.phone ? '+91 ' + profile.phone : fallbackText);
    const location = escapeHtml(frontLocation);
    const safeCode = escapeHtml(code || fallbackText);
    const safeDealerName = escapeHtml(dealerName);
    const safeDealerLocation = escapeHtml(dealerLocation);
    const safeDealerPhone = escapeHtml(dealerPhone);
    const safeDealerAddress = escapeHtml(dealerAddress);
    const heading = escapeHtml(tx(role === 'dealer' ? 'Business Details' : 'Connected Dealer'));
    const partnerRole = escapeHtml(
      tx(role === 'dealer' ? 'Dealer Partner' : 'Electrician Partner')
    );
    const safeCodeLabel = escapeHtml(tx('Code'));
    const safeLocationLabel = escapeHtml(tx('Location'));
    const safeNameLabel = escapeHtml(tx('Name'));
    const safeBackThirdLabel = escapeHtml(backThirdLabel);

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; background: #eef4ff; margin: 0; padding: 28px; color: #0f172a; }
            .title { font-size: 22px; font-weight: 800; margin-bottom: 18px; color: #10254a; }
            .card { border-radius: 28px; padding: 22px; margin-bottom: 22px; color: white; overflow: hidden; }
            .front { background: linear-gradient(135deg, #587ac7, #4768b7, #38549b); }
            .back { background: linear-gradient(135deg, #6284c9, #4b6db4, #35518c); }
            .row { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
            .identity { display: flex; gap: 14px; align-items: center; flex: 1; }
            .avatar { width: 66px; height: 66px; border-radius: 22px; background: white; color: #10254a; font-size: 24px; font-weight: 900; display: flex; align-items: center; justify-content: center; }
            .eyebrow { color: #afc0e4; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .name { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
            .phone { font-size: 13px; color: #d8e3f8; }
            .logo { width: 54px; height: 54px; border-radius: 18px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; overflow: hidden; }
            .logo img { width: 100%; height: 100%; object-fit: contain; background: white; }
            .pill-row { display: flex; gap: 12px; margin-top: 20px; }
            .pill { flex: 1; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 12px; }
            .pill-label { color: #96a7c5; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.8px; }
            .pill-value { font-size: 13px; font-weight: 800; line-height: 18px; }
            .back-layout { display: flex; gap: 14px; align-items: stretch; }
            .back-left { flex: 1; }
            .stack { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
            .qr-panel { width: 112px; text-align: center; }
            .qr-frame { background: white; border-radius: 18px; padding: 8px; }
            .qr-frame img { width: 100%; height: 96px; object-fit: contain; }
            .qr-text { color: #afc0e4; font-size: 10px; font-weight: 700; margin-top: 8px; word-break: break-word; }
          </style>
        </head>
        <body>
          <div class="title">${escapeHtml(tx('SRV Profile Card'))}</div>
          <div class="card front">
            <div class="row">
              <div class="identity">
                <div class="avatar">${escapeHtml(initials)}</div>
                <div>
                  <div class="eyebrow">${partnerRole}</div>
                  <div class="name">${profileName}</div>
                  <div class="phone">${profilePhone}</div>
                </div>
              </div>
              <div class="logo">${logoDataUri ? `<img src="${logoDataUri}" />` : 'SRV'}</div>
            </div>
            <div class="pill-row">
              <div class="pill">
                <div class="pill-label">${safeCodeLabel}</div>
                <div class="pill-value">${safeCode}</div>
              </div>
              <div class="pill">
                <div class="pill-label">${safeLocationLabel}</div>
                <div class="pill-value">${location}</div>
              </div>
            </div>
          </div>
          <div class="card back">
            <div class="back-layout">
              <div class="back-left">
                <div class="eyebrow">${heading}</div>
                <div class="stack">
                  <div class="pill"><div class="pill-label">${safeNameLabel}</div><div class="pill-value">${safeDealerName}</div></div>
                  <div class="pill"><div class="pill-label">${safeLocationLabel}</div><div class="pill-value">${safeDealerLocation}</div></div>
                  <div class="pill"><div class="pill-label">${safeBackThirdLabel}</div><div class="pill-value">${role === 'dealer' ? safeDealerAddress : safeDealerPhone}</div></div>
                </div>
              </div>
              <div class="qr-panel">
                <div class="qr-frame"><img src="${qrUrl}" /></div>
                <div class="qr-text">${safeCode}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const logoDataUri = await getLogoDataUri();
      const { uri } = await Print.printToFileAsync({
        html: buildPdfHtml(logoDataUri),
        base64: false,
      });
      const fileName = `${exportName}-srv-card.pdf`;

      if (Platform.OS === 'android') {
        const permission =
          await LegacyFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(tx('Save cancelled'), tx('Folder not selected.'));
          return;
        }

        const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
          encoding: LegacyFileSystem.EncodingType.Base64,
        });
        const targetUri = await LegacyFileSystem.StorageAccessFramework.createFileAsync(
          permission.directoryUri,
          fileName.replace(/\.pdf$/i, ''),
          'application/pdf'
        );
        await LegacyFileSystem.StorageAccessFramework.writeAsStringAsync(targetUri, base64, {
          encoding: LegacyFileSystem.EncodingType.Base64,
        });
        Alert.alert(tx('PDF saved'), tx('Profile card PDF saved to your selected device folder.'));
        return;
      }

      const destination = `${LegacyFileSystem.documentDirectory ?? LegacyFileSystem.cacheDirectory}${fileName}`;
      await LegacyFileSystem.copyAsync({ from: uri, to: destination });
      Alert.alert(tx('PDF saved'), `${tx('Saved in local files:')}\n${destination}`);
    } catch {
      Alert.alert(tx('Download failed'), tx('Unable to create the profile card PDF right now.'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <Pressable onPress={onToggle} style={styles.pressArea}>
          <Animated.View
            style={[
              styles.face,
              { pointerEvents: 'none' },
              { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] },
            ]}
          >
            <LinearGradient
              colors={
                darkMode ? ['#0F172A', '#16233B', '#1E3A5F'] : ['#587AC7', '#4768B7', '#38549B']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientFill}
            >
              <View style={[styles.textureOne, darkMode ? styles.textureOneDark : null]} />
              <View style={[styles.textureTwo, darkMode ? styles.textureTwoDark : null]} />

              <View style={styles.frontTopRow}>
                <View style={styles.identityWrap}>
                  <View style={styles.avatarWrap}>
                    {effectivePhotoUri ? (
                      <Image source={{ uri: effectivePhotoUri }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{initials}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleText, darkMode ? styles.roleTextDark : null]}>
                      {role === 'dealer'
                        ? t('dealerPartner')
                        : role === 'user'
                        ? tx('Customer Account')
                        : role === 'counterboy'
                        ? tx('Counter Boy Account')
                        : t('electricianPartner')}
                    </Text>
                    <Text style={styles.nameText}>{profile?.name || fallbackText}</Text>
                    <Text style={[styles.phoneText, darkMode ? styles.phoneTextDark : null]}>
                      {profile?.phone ? '+91 ' + profile.phone : fallbackText}
                    </Text>
                    <Animated.Text
                      style={[
                        styles.inlineTapHint,
                        darkMode ? styles.inlineTapHintDark : null,
                        { transform: [{ scale: hintPulse }] },
                      ]}
                      numberOfLines={1}
                    >
                      {tx('Tap card to view QR & details')}
                    </Animated.Text>
                  </View>
                </View>
              </View>

              <View style={styles.frontBottomRow}>
                <DetailPill label={codeLabel} value={code || fallbackText} />
                <DetailPill label="Location" value={frontLocation} icon={<LocationIcon />} />
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.face,
              { pointerEvents: 'none' },
              { opacity: backOpacity, transform: [{ rotateY: backRotate }] },
            ]}
          >
            <LinearGradient
              colors={
                darkMode ? ['#111827', '#172033', '#243B53'] : ['#6284C9', '#4B6DB4', '#35518C']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientFill}
            >
              <View style={[styles.backGlowOne, darkMode ? styles.backGlowOneDark : null]} />
              <View style={[styles.backGlowTwo, darkMode ? styles.backGlowTwoDark : null]} />
              <View style={styles.backContent}>
                <View style={styles.backLeft}>
                  <Text style={[styles.backHeading, darkMode ? styles.backHeadingDark : null]}>
                    {tx(role === 'dealer' ? 'Business Details' : role === 'user' ? 'Account Details' : 'Connected Dealer')}
                  </Text>
                  <View style={styles.metaStack}>
                    <DetailPill label="Name" value={dealerName} compact />
                    <DetailPill label="Location" value={dealerLocation} compact lines={2} />
                    <DetailPill
                      label={backThirdLabel}
                      value={backThirdValue}
                      compact
                      lines={role === 'dealer' ? 2 : undefined}
                    />
                  </View>
                </View>

                <View style={styles.qrPanel}>
                  <View style={styles.qrFrame}>
                    <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.qrCodeText} numberOfLines={1}>
                    {qrValue}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <TouchableOpacity
          style={[styles.downloadMiniBtn, darkMode ? styles.downloadMiniBtnDark : null]}
          activeOpacity={0.9}
          onPress={() => void handleDownloadPdf()}
          disabled={isDownloading}
        >
          <DownloadIcon size={15} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 208,
    position: 'relative',
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: 208,
    borderRadius: 28,
    overflow: 'hidden',
    ...createShadow({ color: '#020617', offsetY: 10, blur: 20, opacity: 0.22, elevation: 9 }),
  },
  pressArea: {
    width: '100%',
    height: '100%',
  },
  gradientFill: {
    flex: 1,
    padding: 15,
  },
  textureOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59,130,246,0.16)',
    top: -30,
    right: -40,
  },
  textureOneDark: {
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  textureTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(232,69,60,0.14)',
    bottom: -24,
    left: -18,
  },
  textureTwoDark: {
    backgroundColor: 'rgba(14,165,233,0.1)',
  },
  downloadMiniBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  downloadMiniBtnDark: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderColor: 'rgba(148,163,184,0.28)',
  },
  backGlowOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(56,189,248,0.12)',
    top: -24,
    right: -20,
  },
  backGlowOneDark: {
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  backGlowTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244,114,182,0.12)',
    bottom: -18,
    left: -14,
  },
  frontTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
    paddingRight: 28,
  },
  identityWrap: { flexDirection: 'row', gap: 12, flex: 1 },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backGlowTwoDark: {
    backgroundColor: 'rgba(14,165,233,0.09)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#10254A', fontSize: 24, fontWeight: '900' },
  roleText: {
    color: '#AFC0E4',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  roleTextDark: { color: '#BFDBFE' },
  nameText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', flexShrink: 1 },
  phoneText: { color: '#D8E3F8', fontSize: 12.5, marginTop: 5 },
  phoneTextDark: { color: '#CBD5E1' },
  inlineTapHint: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 7.8,
    marginTop: 10,
    paddingRight: 2,
    flexShrink: 1,
  },
  inlineTapHintDark: { color: 'rgba(226,232,240,0.82)' },

  frontBottomRow: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 15,
    flexDirection: 'row',
    gap: 10,
  },
  detailPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailPillCompact: {
    flex: 0,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
    minHeight: 0,
  },
  detailLabel: {
    color: '#D8E4FF',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailIconWrap: { alignItems: 'center', justifyContent: 'center' },
  detailValue: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', flexShrink: 1, lineHeight: 13 },
  detailValueCompact: { fontSize: 9.5, lineHeight: 12, flex: 1 },
  backContent: { flexDirection: 'row', flex: 1, gap: 10, alignItems: 'stretch' },
  backLeft: { flex: 1, justifyContent: 'flex-start', minWidth: 0 },
  backHeading: {
    color: '#E4EDFF',
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingRight: 34,
  },
  backHeadingDark: { color: '#DBEAFE' },
  metaStack: { gap: 4, marginTop: 8, paddingRight: 1 },
  qrPanel: { width: 92, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  qrFrame: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 5,
  },
  qrImage: { width: '100%', height: '100%' },
  qrCodeText: {
    color: '#C7D5F3',
    fontSize: 7.4,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
    width: '100%',
  },
});
