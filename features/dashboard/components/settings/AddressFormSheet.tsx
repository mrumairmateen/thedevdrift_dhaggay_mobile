import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Address, AddressInput } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (input: AddressInput) => void;
  initial?: Address;
  isSaving?: boolean;
}

export function AddressFormSheet({ visible, onClose, onSave, initial, isSaving }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const slideAnim = useRef(new Animated.Value(400)).current;

  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (visible) {
      setLabel(initial?.label ?? '');
      setLine1(initial?.line1 ?? '');
      setCity(initial?.city ?? '');
      setArea(initial?.area ?? '');
      setPhone(initial?.phone ?? '');
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleSave = () => {
    if (!label.trim() || !line1.trim() || !city.trim()) return;
    onSave({ label: label.trim(), line1: line1.trim(), city: city.trim(), area: area.trim() || undefined, phone: phone.trim() || undefined });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: r['2xl'],
                borderTopRightRadius: r['2xl'],
                transform: [{ translateY: slideAnim }],
              },
            ]}
            // Prevent overlay press from closing when touching the sheet
            onStartShouldSetResponder={() => true}
          >
            {/* Handle + header */}
            <View style={[styles.sheetHeader, { paddingHorizontal: sp.base, paddingVertical: sp.md }]}>
              <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
              <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                {initial ? 'Edit Address' : 'Add Address'}
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <IconSymbol name="xmark" size={18} color={colors.textMid} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: sp.base, paddingBottom: sp['3xl'] }}>
              {[
                { label: 'Label (e.g. Home)', value: label, setter: setLabel, required: true, placeholder: 'Home' },
                { label: 'Street Address', value: line1, setter: setLine1, required: true, placeholder: '123 Main Street' },
                { label: 'City', value: city, setter: setCity, required: true, placeholder: 'Lahore' },
                { label: 'Area (optional)', value: area, setter: setArea, required: false, placeholder: 'DHA Phase 5' },
                { label: 'Phone (optional)', value: phone, setter: setPhone, required: false, placeholder: '+923001234567' },
              ].map((field) => (
                <View key={field.label} style={{ marginBottom: sp.md }}>
                  <Text style={[typo.scale.label, {
                    fontFamily: typo.fonts.sansMed,
                    color: colors.textLow,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    marginBottom: sp.xs,
                  }]}>
                    {field.label}
                  </Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textLow}
                    style={[styles.input, {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                      borderRadius: r.sm,
                      color: colors.textHigh,
                      fontFamily: typo.fonts.sans,
                      fontSize: 16,
                      paddingHorizontal: sp.base,
                      paddingVertical: sp.md,
                    }]}
                  />
                </View>
              ))}

              {/* Footer */}
              <View style={[styles.footer, { gap: sp.sm, marginTop: sp.sm }]}>
                <Pressable
                  onPress={onClose}
                  style={[styles.btn, {
                    borderColor: colors.border,
                    borderRadius: r.md,
                    paddingVertical: sp.md,
                    flex: 1,
                  }]}
                >
                  <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={isSaving || !label.trim() || !line1.trim() || !city.trim()}
                  style={({ pressed }) => [styles.btn, {
                    backgroundColor: colors.accent,
                    borderRadius: r.md,
                    paddingVertical: sp.md,
                    flex: 2,
                    opacity: pressed || isSaving ? 0.7 : 1,
                  }]}
                >
                  <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
                    {isSaving ? 'Saving…' : 'Save Address'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  kav: { justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%' },
  sheetHeader: { alignItems: 'center', gap: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, marginBottom: 4 },
  input: { borderWidth: 1 },
  footer: { flexDirection: 'row' },
  btn: { alignItems: 'center', borderWidth: 1 },
});
