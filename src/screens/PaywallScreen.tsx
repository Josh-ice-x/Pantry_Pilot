import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { getOfferings, purchasePackage, restorePurchases } from '../services/revenuecat';
import { useApp } from '../context/AppContext';

const PERKS = [
  'Unlimited meal generations',
  'Weekly meal planning',
  'Auto-built shopping lists',
  '"Use what I already have" priority mode',
];

export default function PaywallScreen({ navigation }: any) {
  const { refreshPremiumStatus } = useApp();
  const [offering, setOffering] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    getOfferings()
      .then(setOffering)
      .catch(() => Alert.alert('Could not load plans', 'Check your RevenueCat offering configuration.'))
      .finally(() => setLoading(false));
  }, []);

  async function handlePurchase(pkg: any) {
    setPurchasing(true);
    try {
      await purchasePackage(pkg);
      await refreshPremiumStatus();
      navigation.goBack();
    } catch (e: any) {
      if (!e?.userCancelled) Alert.alert('Purchase failed', 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    const restored = await restorePurchases();
    if (restored) {
      await refreshPremiumStatus();
      navigation.goBack();
    } else {
      Alert.alert('Nothing to restore', 'No active subscription found for this account.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cook without limits</Text>
      <View style={styles.perks}>
        {PERKS.map((p) => (
          <Text key={p} style={styles.perk}>✓ {p}</Text>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.lg }} />
      ) : (
        offering?.availablePackages?.map((pkg: any) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={styles.planButton}
            onPress={() => handlePurchase(pkg)}
            disabled={purchasing}
          >
            <Text style={styles.planButtonText}>
              {pkg.product.title} — {pkg.product.priceString}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity onPress={handleRestore} style={{ marginTop: spacing.md }}>
        <Text style={styles.restoreText}>Restore purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  title: { ...font.h1, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  perks: { marginBottom: spacing.xl },
  perk: { ...font.body, color: colors.text, marginBottom: spacing.sm },
  planButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planButtonText: { color: '#fff', ...font.h2 },
  restoreText: { color: colors.subtext, textAlign: 'center', ...font.small },
});
