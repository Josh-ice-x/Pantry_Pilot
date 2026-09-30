import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, font } from '../theme';
import { useApp, FREE_WEEKLY_LIMIT } from '../context/AppContext';
import { identifyIngredients } from '../services/visionService';

export default function HomeScreen({ navigation }: any) {
  const { setIngredients, canGenerate, isPremium, generationsUsedThisWeek } = useApp();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePick(fromCamera: boolean) {
    if (!canGenerate) {
      navigation.navigate('Paywall');
      return;
    }
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'PantryPilot needs access to continue.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setLoading(true);
    try {
      const ingredients = await identifyIngredients(asset.base64 ?? '');
      setIngredients(ingredients);
      navigation.navigate('Results');
    } catch (e) {
      Alert.alert('Hmm, that didn\u2019t work', 'Could not read that photo. Try again with better lighting.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍳 PantryPilot</Text>
      <Text style={styles.subtitle}>Snap your fridge or pantry.{'\n'}We'll tell you what you can cook.</Text>

      <View style={styles.photoBox}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>📷</Text>
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.card} size="large" />
            <Text style={styles.loadingText}>Reading your pantry…</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => handlePick(true)} disabled={loading}>
        <Text style={styles.primaryButtonText}>Take a Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => handlePick(false)} disabled={loading}>
        <Text style={styles.secondaryButtonText}>Choose from Library</Text>
      </TouchableOpacity>

      {!isPremium && (
        <Text style={styles.usageText}>
          {generationsUsedThisWeek}/{FREE_WEEKLY_LIMIT} free generations used this week
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  title: { ...font.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...font.body, color: colors.subtext, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 21 },
  photoBox: {
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { fontSize: 56, opacity: 0.3 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43,33,24,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: colors.card, marginTop: spacing.sm, ...font.small },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: '#fff', ...font.h2 },
  secondaryButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryButtonText: { color: colors.primary, ...font.h2 },
  usageText: { textAlign: 'center', color: colors.subtext, marginTop: spacing.lg, ...font.small },
});
