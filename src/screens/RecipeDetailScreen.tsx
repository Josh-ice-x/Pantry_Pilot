import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { Recipe } from '../services/visionService';

export default function RecipeDetailScreen({ route }: any) {
  const recipe: Recipe = route.params.recipe;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.meta}>
        {recipe.minutes} min · serves {recipe.servings} · {recipe.cuisine}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>You'll use</Text>
        <Text style={styles.body}>{recipe.usesOnHand.join(', ')}</Text>
      </View>

      {recipe.missing.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick up</Text>
          <Text style={styles.body}>{recipe.missing.join(', ')}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Steps</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...font.h1, color: colors.text },
  meta: { ...font.small, color: colors.subtext, marginTop: spacing.xs, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...font.h2, color: colors.text, marginBottom: spacing.xs },
  body: { ...font.body, color: colors.text, lineHeight: 21 },
  stepRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-start' },
  stepNumber: {
    ...font.small,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  stepText: { ...font.body, color: colors.text, flex: 1, lineHeight: 21 },
});
