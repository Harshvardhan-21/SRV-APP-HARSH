import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppIcon } from '../components/ProfileShared';
import { DocumentUpload } from '../components/DocumentUpload';
import { usePreferenceValue } from '@/shared/preferences';
import { useAuth } from '@/shared/context/AuthContext';
import { authApi } from '@/shared/api';

interface KYCVerificationScreenProps {
  onBack: () => void;
  currentRole: 'dealer' | 'electrician' | 'user' | 'counterboy';
}

export function KYCVerificationScreen({ onBack, currentRole }: KYCVerificationScreenProps) {
  const { user: authUser, refreshProfile } = useAuth();
  const { theme, tx } = usePreferenceValue({} as any);
  
  const [draftAadhar, setDraftAadhar] = useState<string | null>(null);
  const [draftPan, setDraftPan] = useState<string | null>(null);
  const [draftGst, setDraftGst] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const roleColor = theme.accent;
  const roleSoft = theme.accentSoft;

  const hasAadhar = authUser?.aadharFrontImage || draftAadhar;
  const hasPan = authUser?.panDocument || draftPan;
  const hasGst = authUser?.gstDocument || draftGst;
  const isDealer = currentRole === 'dealer';
  
  // KYC status logic
  const kycComplete = hasAadhar && (isDealer ? (hasPan || hasGst) : true);
  const kycStatus = authUser?.kycStatus || 'not_submitted';

  const handleSubmit = async () => {
    if (!hasAadhar) {
      Alert.alert(tx('Error'), tx('Please upload Aadhar Card'));
      return;
    }

    if (isDealer && !hasPan && !hasGst) {
      Alert.alert(tx('Error'), tx('Please upload either PAN Card or GST Number'));
      return;
    }

    try {
      setIsSaving(true);
      
      const updateData: any = {};
      if (draftAadhar) updateData.aadharFrontImage = draftAadhar;
      if (draftPan) updateData.panDocument = draftPan;
      if (draftGst) updateData.gstDocument = draftGst;

      if (Object.keys(updateData).length > 0) {
        await authApi.updateProfile(updateData);
        await refreshProfile();
      }

      Alert.alert(
        tx('Success'),
        tx('KYC documents submitted successfully. Admin will verify soon.'),
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert(tx('Error'), tx('Failed to submit KYC documents. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = () => {
    switch (kycStatus) {
      case 'verified': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (kycStatus) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Submitted';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <AppIcon name="chevronLeft" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {tx('KYC Verification')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor()}20` }]}>
              <AppIcon 
                name={kycStatus === 'verified' ? 'check' : kycStatus === 'pending' ? 'clock' : 'warning'} 
                size={24} 
                color={getStatusColor()} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>
                {tx('KYC Status')}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          {kycStatus === 'rejected' && authUser?.kycRejectionReason && (
            <View style={[styles.rejectionBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
              <Text style={[styles.rejectionTitle, { color: '#991B1B' }]}>
                {tx('Rejection Reason')}:
              </Text>
              <Text style={[styles.rejectionText, { color: '#DC2626' }]}>
                {authUser.kycRejectionReason}
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: roleSoft, borderColor: roleColor }]}>
          <AppIcon name="info" size={20} color={roleColor} />
          <Text style={[styles.infoText, { color: roleColor }]}>
            {isDealer 
              ? tx('Upload Aadhar Card and either PAN Card or GST Number for verification')
              : tx('Upload Aadhar Card for KYC verification')}
          </Text>
        </View>

        {/* Documents Section */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            📄 {tx('Required Documents')}
          </Text>

          <DocumentUpload
            label="Aadhar Card"
            documentType="aadhar-front"
            currentUrl={authUser?.aadharFrontImage}
            onUploadSuccess={(url) => setDraftAadhar(url)}
            theme={theme}
            roleColor={roleColor}
            roleSoft={roleSoft}
          />

          {isDealer && (
            <>
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                ℹ️ {tx('Choose one from both PAN Card or GST Number')}
              </Text>

              <DocumentUpload
                label="PAN Card (Optional)"
                documentType="pan"
                currentUrl={authUser?.panDocument}
                onUploadSuccess={(url) => setDraftPan(url)}
                theme={theme}
                roleColor={roleColor}
                roleSoft={roleSoft}
              />

              <DocumentUpload
                label="GST Number (Optional)"
                documentType="gst"
                currentUrl={authUser?.gstDocument}
                onUploadSuccess={(url) => setDraftGst(url)}
                theme={theme}
                roleColor={roleColor}
                roleSoft={roleSoft}
              />
            </>
          )}
        </View>

        {/* Progress Indicator */}
        <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>
            {tx('Completion Progress')}
          </Text>
          
          <View style={styles.progressItem}>
            <AppIcon 
              name={hasAadhar ? 'check' : 'circle'} 
              size={20} 
              color={hasAadhar ? '#10B981' : theme.textMuted} 
            />
            <Text style={[styles.progressText, { color: theme.textPrimary }]}>
              {tx('Aadhar Card')}
            </Text>
          </View>

          {isDealer && (
            <View style={styles.progressItem}>
              <AppIcon 
                name={(hasPan || hasGst) ? 'check' : 'circle'} 
                size={20} 
                color={(hasPan || hasGst) ? '#10B981' : theme.textMuted} 
              />
              <Text style={[styles.progressText, { color: theme.textPrimary }]}>
                {tx('PAN Card or GST Number')}
              </Text>
            </View>
          )}

          <View style={[styles.progressBar, { backgroundColor: theme.soft }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: roleColor,
                  width: kycComplete ? '100%' : hasAadhar ? '50%' : '0%'
                }
              ]} 
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      {kycStatus !== 'verified' && (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSaving || !kycComplete}
            style={[
              styles.submitBtn,
              { backgroundColor: roleColor },
              (!kycComplete || isSaving) && { opacity: 0.5 }
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {isSaving ? tx('Submitting...') : tx('Submit for Verification')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '800',
  },
  rejectionBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
