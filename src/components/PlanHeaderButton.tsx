import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const PLAN_STAR_ORANGE = '#F97316';

type Props = {
  hasActivePlan: boolean;
  onPress: () => void;
};

export function PlanHeaderButton({ hasActivePlan, onPress }: Props) {
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!hasActivePlan) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hasActivePlan, glowAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.planHeaderBtn, hasActivePlan && styles.planHeaderBtnActive]}
      accessibilityLabel={hasActivePlan ? 'Active plan' : 'View plan'}
      accessibilityRole="button"
    >
      {hasActivePlan ? (
        <View style={styles.planStarBtnInnerWrap}>
          <Animated.View style={{ opacity: glowAnim }}>
            <Ionicons name="navigate" size={24} color={PLAN_STAR_ORANGE} />
          </Animated.View>
          <Text style={[styles.planStarLabel, { color: PLAN_STAR_ORANGE }]}>Active plan</Text>
        </View>
      ) : (
        <Ionicons name="navigate" size={24} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  planHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  planHeaderBtnActive: {},
  planStarBtnInnerWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planStarLabel: { fontSize: 12, fontWeight: '600' },
});
