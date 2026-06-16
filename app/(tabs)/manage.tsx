import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useWheel } from '@/contexts/WheelContext';
import { parseListInput } from '@/utils/parseListInput';
import { ACTION_MINT } from '@/constants/wheel';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ManageScreen() {
  const { items, isLoaded, addItem, addItems, replaceItems, updateItem, removeItem, clearItems } =
    useWheel();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importDraft, setImportDraft] = useState('');

  const openEditor = (id: string, label: string) => {
    setEditingId(id);
    setEditDraft(label);
  };

  const closeEditor = () => {
    setEditingId(null);
    setEditDraft('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateItem(editingId, editDraft);
    closeEditor();
  };

  const confirmClear = () => {
    if (items.length === 0) return;

    Alert.alert('Clear all options?', 'This removes every item from your wheel.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearItems },
    ]);
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportDraft('');
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text.trim()) {
      Alert.alert('Clipboard empty', 'Copy a list first, then paste it here.');
      return;
    }
    setImportDraft((current) => (current ? `${current}\n${text}` : text));
  };

  const importParsed = (mode: 'add' | 'replace') => {
    const parsed = parseListInput(importDraft);
    if (!parsed.length) {
      Alert.alert('Nothing to import', 'Paste a comma or newline separated list first.');
      return;
    }

    if (mode === 'replace' && items.length > 0) {
      Alert.alert(
        'Replace all options?',
        `This removes your current ${items.length} options and adds ${parsed.length} new ones.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              replaceItems(parsed);
              closeImport();
            },
          },
        ],
      );
      return;
    }

    if (mode === 'add') {
      addItems(parsed);
    } else {
      replaceItems(parsed);
    }
    closeImport();
  };

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={[styles.count, { color: colors.text }]}>{items.length} options</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setImportOpen(true)}>
            <Text style={[styles.importText, { color: colors.tint }]}>Import list</Text>
          </Pressable>
          {items.length > 0 && (
            <Pressable onPress={confirmClear}>
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
          placeholder="Add an option"
          placeholderTextColor={colors.tabIconDefault}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => {
            addItem(draft);
            setDraft('');
          }}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, { backgroundColor: ACTION_MINT }]}
          onPress={() => {
            addItem(draft);
            setDraft('');
          }}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            Add at least two options, then head to Spin.
          </Text>
        }
        ListFooterComponent={
          <Pressable
            style={[styles.spinButton, { backgroundColor: ACTION_MINT }]}
            onPress={() => router.navigate('/spin')}>
            <Text style={styles.spinButtonText}>spin the bottle!!! 😉</Text>
          </Pressable>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.row, { borderColor: colors.tabIconDefault }]}>
            <Pressable style={styles.rowMain} onPress={() => openEditor(item.id, item.label)}>
              <Text style={[styles.rowIndex, { color: colors.tabIconDefault }]}>{index + 1}</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={3}>
                {item.label}
              </Text>
            </Pressable>
            <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
      />

      <Modal visible={editingId !== null} transparent animationType="fade" onRequestClose={closeEditor}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit option</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.tabIconDefault }]}
              value={editDraft}
              onChangeText={setEditDraft}
              autoFocus
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeEditor}>
                <Text style={[styles.modalButton, { color: colors.tabIconDefault }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveEdit}>
                <Text style={[styles.modalButton, { color: colors.tint }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={importOpen} transparent animationType="fade" onRequestClose={closeImport}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.importCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Import list</Text>
            <Text style={[styles.importHint, { color: colors.tabIconDefault }]}>
              Paste options separated by commas or new lines.
            </Text>
            <TextInput
              style={[styles.importInput, { color: colors.text, borderColor: colors.tabIconDefault }]}
              placeholder={'Pizza, Sushi, Tacos\nor one per line'}
              placeholderTextColor={colors.tabIconDefault}
              value={importDraft}
              onChangeText={setImportDraft}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Pressable onPress={pasteFromClipboard}>
              <Text style={[styles.pasteLink, { color: colors.tint }]}>Paste from clipboard</Text>
            </Pressable>
            <View style={styles.importActions}>
              <Pressable onPress={closeImport}>
                <Text style={[styles.modalButton, { color: colors.tabIconDefault }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => importParsed('add')}>
                <Text style={[styles.modalButton, { color: colors.tint }]}>Add to list</Text>
              </Pressable>
              <Pressable onPress={() => importParsed('replace')}>
                <Text style={[styles.modalButton, styles.replaceButton]}>Replace all</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  importText: {
    fontWeight: '600',
  },
  clearText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#F8FAF9',
    fontWeight: '700',
    fontSize: 16,
  },
  list: {
    paddingBottom: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    gap: 8,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowIndex: {
    width: 24,
    fontWeight: '700',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  removeText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '700',
  },
  importCard: {
    maxHeight: '85%',
  },
  importHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  importInput: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  pasteLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  importActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
  },
  replaceButton: {
    color: '#d32f2f',
  },
  spinButton: {
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  spinButtonText: {
    color: '#F8FAF9',
    fontSize: 16,
    fontWeight: '700',
  },
});
