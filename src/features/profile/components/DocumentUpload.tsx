import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { profileApi } from '@/shared/api';

type DocumentType = 'aadhar-front' | 'aadhar-back' | 'pan' | 'gst';

interface DocumentUploadProps {
  label: string;
  documentType: DocumentType;
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  theme: any;
  roleColor: string;
  roleSoft: string;
}

export function DocumentUpload({
  label,
  documentType,
  currentUrl,
  onUploadSuccess,
  theme,
  roleColor,
  roleSoft,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(currentUrl || null);

  const pickDocument = async () => {
    try {
      Alert.alert(
        'Choose Source',
        'Select document source',
        [
          {
            text: 'Camera',
            onPress: () => pickFromCamera(),
          },
          {
            text: 'Gallery',
            onPress: () => pickFromGallery(),
          },
          {
            text: 'Files',
            onPress: () => pickFromFiles(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to upload documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      await uploadDocument(result.assets[0].uri, 'image/jpeg', `${documentType}.jpg`);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow gallery access to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      await uploadDocument(result.assets[0].uri, 'image/jpeg', `${documentType}.jpg`);
    }
  };

  const pickFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      await uploadDocument(file.uri, file.mimeType || 'application/pdf', file.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const uploadDocument = async (uri: string, type: string, name: string) => {
    try {
      setUploading(true);
      const url = await profileApi.uploadDocument({ uri, type, name }, documentType);
      setLocalUri(url);
      onUploadSuccess(url);
      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      const msg = error?.message || 'Unknown error';
      Alert.alert('Upload Failed', `${msg}\n\nPlease check your connection and try again.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <TouchableOpacity
        onPress={pickDocument}
        disabled={uploading}
        activeOpacity={0.8}
        style={[
          styles.uploadBox,
          localUri ? styles.uploadBoxFilled : null,
          { backgroundColor: theme.soft, borderColor: theme.border },
        ]}
      >
        {uploading ? (
          <View style={styles.uploadInner}>
            <ActivityIndicator size="small" color={roleColor} />
            <Text style={[styles.uploadText, { color: theme.textMuted }]}>Uploading...</Text>
          </View>
        ) : localUri ? (
          <View style={styles.previewContainer}>
            {localUri.endsWith('.pdf') ? (
              <View style={[styles.pdfIcon, { backgroundColor: roleSoft }]}>
                <Text style={[styles.pdfText, { color: roleColor }]}>PDF</Text>
              </View>
            ) : (
              <Image source={{ uri: localUri }} style={styles.previewImage} />
            )}
            <Text style={[styles.uploadedText, { color: theme.textPrimary }]}>
              Tap to change
            </Text>
          </View>
        ) : (
          <View style={styles.uploadInner}>
            <View style={[styles.uploadIcon, { backgroundColor: roleSoft }]}>
              <Text style={[styles.uploadIconText, { color: roleColor }]}>📄</Text>
            </View>
            <View style={styles.uploadCopy}>
              <Text style={[styles.uploadTitle, { color: theme.textPrimary }]}>
                Tap to upload
              </Text>
              <Text style={[styles.uploadText, { color: theme.textMuted }]}>
                Choose from camera, gallery, or files
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uploadBox: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxFilled: {
    borderStyle: 'solid',
  },
  uploadInner: {
    alignItems: 'center',
    gap: 12,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconText: {
    fontSize: 24,
  },
  uploadCopy: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 12,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  pdfIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 18,
    fontWeight: '800',
  },
  uploadedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
