import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface SleepTimerModalProps {
  visible: boolean;
  activeMinutes: number | null; // null if inactive
  onClose: () => void;
  onSetTimer: (minutes: number | null) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  visible,
  activeMinutes,
  onClose,
  onSetTimer,
}) => {
  const options = [
    { label: '15 Minutes', mins: 15 },
    { label: '30 Minutes', mins: 30 },
    { label: '45 Minutes', mins: 45 },
    { label: '60 Minutes (1 Hour)', mins: 60 },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="moon" size={20} color={Colors.accentViolet} />
              </View>
              <View>
                <Text style={styles.title}>Sleep Timer</Text>
                <Text style={styles.sub}>Music stops automatically</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((opt) => {
              const isSelected = activeMinutes === opt.mins;
              return (
                <TouchableOpacity
                  key={opt.mins}
                  style={[styles.optBtn, isSelected && styles.optBtnSelected]}
                  onPress={() => {
                    onSetTimer(opt.mins);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optText, isSelected && styles.optTextSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            {activeMinutes !== null && (
              <TouchableOpacity
                style={styles.turnOffBtn}
                onPress={() => {
                  onSetTimer(null);
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.turnOffText}>Turn Off Sleep Timer</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#181C28',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#252B3B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#232838',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#232838',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    marginTop: 14,
    gap: 8,
  },
  optBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E2333',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optBtnSelected: {
    backgroundColor: '#162822',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  optText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  optTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  turnOffBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 6,
  },
  turnOffText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
