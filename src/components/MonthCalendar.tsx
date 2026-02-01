import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getMonthYear(ts: number) {
  const d = new Date(ts);
  return { month: d.getMonth(), year: d.getFullYear() };
}

type Props = {
  value: number;
  onChange: (ts: number) => void;
  min?: number;
  max?: number;
};

export function MonthCalendar({ value, onChange, min, max }: Props) {
  const selectedStart = startOfDay(value);
  const [viewMonth, setViewMonth] = useState(() => getMonthYear(value));

  const { days, leadingBlanks } = useMemo(() => {
    const { month, year } = viewMonth;
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const firstDayOfWeek = first.getDay();
    const daysInMonth = last.getDate();
    const leadingBlanks = firstDayOfWeek;
    const days: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const t = new Date(year, month, d).getTime();
      days.push(t);
    }
    return { days, leadingBlanks };
  }, [viewMonth.month, viewMonth.year]);

  const goPrev = () => {
    setViewMonth((prev) => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goNext = () => {
    setViewMonth((prev) => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const isDisabled = (ts: number) => {
    const t = startOfDay(ts);
    if (min != null && t < startOfDay(min)) return true;
    if (max != null && t > startOfDay(max)) return true;
    return false;
  };

  const cellMargin = 2;
  const cellMarginStyle = { marginVertical: cellMargin, marginHorizontal: 0 };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrow} onPress={goPrev} accessibilityLabel="Previous month">
          <Text style={styles.arrowText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
        </Text>
        <TouchableOpacity style={styles.arrow} onPress={goNext} accessibilityLabel="Next month">
          <Text style={styles.arrowText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday} numberOfLines={1}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <View key={`blank-${i}`} style={[styles.dayCell, styles.dayCellSize, cellMarginStyle]} />
        ))}
        {days.map((ts) => {
          const d = new Date(ts);
          const dayNum = d.getDate();
          const selected = startOfDay(ts) === selectedStart;
          const disabled = isDisabled(ts);
          return (
            <TouchableOpacity
              key={ts}
              style={[
                styles.dayCell,
                styles.dayCellSize,
                cellMarginStyle,
                selected && styles.dayCellSelected,
                disabled && styles.dayCellDisabled,
              ]}
              onPress={() => !disabled && onChange(startOfDay(ts))}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.dayNum,
                  selected && styles.dayNumSelected,
                  disabled && styles.dayNumDisabled,
                ]}
              >
                {dayNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 20, color: colors.black, fontWeight: '600' },
  monthYear: { fontSize: 14, fontWeight: '700', color: colors.black },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellSize: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
  },
  dayCellDisabled: {
    opacity: 0.4,
  },
  dayNum: { fontSize: 15, fontWeight: '600', color: colors.black },
  dayNumSelected: { color: colors.white },
  dayNumDisabled: { color: colors.textMuted },
});
