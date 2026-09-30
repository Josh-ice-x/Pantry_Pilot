import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, radius, font } from '../theme';
import { useApp } from '../context/AppContext';
import { generateRecipes } from '../services/visionService';

const CUISINES = ['any', 'italian', 'mexican', 'asian', 'mediterranean'];
const TIME_OPTIONS = [15, 30, 45, 60];

export default function ResultsScreen({ navigation }: any) {
  const { ingredients, constraints, setConstraints, recipes, setRecipes, canGenerate, recordGeneration } = useApp();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!canGenerate) {
      navigation.navigate('Paywall');
      return;
    }
    setLoading(true);
    try {
      const result = await generateRecipes(ingredients, constraints);
      setRecipes(result);
      recordGeneration();
    } catch (e) {
      Alert.alert('Could not generate recipes', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.header}>What you have</Text>
      <View style={styles.chipsRow}>
        {ingredients.map((ing) => (
          <View key={ing} style={styles.ingredientChip}>
            <Text style={styles.ingredientChipText}>{ing}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.header}>Adjust</Text>
      <FilterRow
        label="People"
        value={String(constraints.people)}
        options={['1', '2', '3', '4+']}
        onSelect={(v) => setConstraints({ ...constraints, people: v === '4+' ? 4 : Number(v) })}
      />
      <FilterRow
        label="Time"
        value={`${constraints.minutes} min`}
        options={TIME_OPTIONS.map((t) => `${t} min`)}
        onSelect={(v) => setConstraints({ ...constraints, minutes: Number(v.split(' ')[0]) })}
      />
      <FilterRow
        label="Cuisine"
        value={constraints.cuisine}
        options={CUISINES}
        onSelect={(v) => setConstraints({ ...constraints, cuisine: v })}
      />
      <FilterRow
        label="Budget"
        value={constraints.budget}
        options={['low', 'medium', 'any']}
        onSelect={(v) => setConstraints({ ...constraints, budget: v as any })}
      />

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateButtonText}>Find Meals I Can Make</Text>}
      </TouchableOpacity>

      {recipes.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.header}>Meals for you</Text>
          {recipes.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.recipeCard}
              onPress={() => navigation.navigate('RecipeDetail', { recipe: r })}
            >
              <Text style={styles.recipeTitle}>{r.title}</Text>
              <Text style={styles.recipeMeta}>
                {r.minutes} min · serves {r.servings} · {r.cuisine}
              </Text>
              {r.missing.length > 0 ? (
                <Text style={styles.missingText}>Missing: {r.missing.join(', ')}</Text>
              ) : (
                <Text style={styles.readyText}>✓ You have everything</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function FilterRow({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={[styles.filterChip, value === opt && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, value === opt && styles.filterChipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { ...font.h2, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  ingredientChip: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  ingredientChipText: { ...font.small, color: colors.text },
  filterLabel: { ...font.small, color: colors.subtext, marginBottom: spacing.xs },
  filterChip: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { ...font.small, color: colors.text },
  filterChipTextActive: { color: '#fff' },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  generateButtonText: { color: '#fff', ...font.h2 },
  recipeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipeTitle: { ...font.h2, color: colors.text, marginBottom: spacing.xs },
  recipeMeta: { ...font.small, color: colors.subtext, marginBottom: spacing.xs },
  missingText: { ...font.small, color: colors.primaryDark },
  readyText: { ...font.small, color: colors.success },
});
