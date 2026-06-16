import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Wheel from '@/components/Wheel';
import { useWheel } from '@/contexts/WheelContext';
import { ACTION_MINT } from '@/constants/wheel';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SpinScreen() {
  const { items, isLoaded } = useWheel();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [winner, setWinner] = useState<string | null>(null);

  const labels = useMemo(() => items.map((item) => item.label), [items]);

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled">
      {items.length < 2 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Not enough options</Text>
          <Text style={[styles.emptyBody, { color: colors.tabIconDefault }]}>
            Add at least two options on the decision, decisions..... tab to spin the wheel.
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
            {items.length} equal slices · tap Spin when ready
          </Text>
          <Wheel labels={labels} onSpinComplete={setWinner} />
        </>
      )}

      <Modal visible={winner !== null} transparent animationType="fade" onRequestClose={() => setWinner(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalLabel, { color: colors.text }]}>
              and so the wheel has spoken...
            </Text>
            <Text style={[styles.modalWinner, { color: colors.text }]}>{winner}</Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: ACTION_MINT }]}
              onPress={() => setWinner(null)}>
              <Text style={styles.modalButtonText}>All Hail Mighty Wheel! 🙇</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 14,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  modalWinner: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  modalButtonText: {
    color: '#F8FAF9',
    fontWeight: '700',
    fontSize: 16,
  },
});
