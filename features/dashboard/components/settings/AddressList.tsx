import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { AddressFormSheet } from './AddressFormSheet';
import type { Address, AddressInput } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from '@services/userApi';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  addresses: Address[];
}

export function AddressList({ addresses }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editing, setEditing] = useState<Address | undefined>();

  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefault] = useSetDefaultAddressMutation();

  const isSaving = isAdding || isUpdating;

  const handleSave = async (input: AddressInput) => {
    try {
      if (editing) {
        await updateAddress({ id: editing._id, body: input }).unwrap();
      } else {
        await addAddress(input).unwrap();
      }
      setSheetVisible(false);
      setEditing(undefined);
    } catch {
      Alert.alert('Error', 'Could not save address.');
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert('Delete Address', `Remove "${address.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAddress(address._id),
      },
    ]);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setSheetVisible(true);
  };

  const openAdd = () => {
    setEditing(undefined);
    setSheetVisible(true);
  };

  return (
    <View>
      <View style={[styles.list, elev.low, {
        backgroundColor: colors.elevated,
        borderColor: colors.border,
        borderRadius: r.lg,
        overflow: 'hidden',
      }]}>
        {addresses.length === 0 ? (
          <View style={{ padding: sp.base, alignItems: 'center' }}>
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
              No saved addresses
            </Text>
          </View>
        ) : (
          addresses.map((addr, idx) => (
            <View
              key={addr._id}
              style={[
                styles.item,
                {
                  paddingHorizontal: sp.base,
                  paddingVertical: sp.md,
                  borderBottomWidth: idx < addresses.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.labelRow}>
                  <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                    {addr.label}
                  </Text>
                  {addr.isDefault && (
                    <View style={[styles.defaultBadge, {
                      backgroundColor: colors.accentSubtle,
                      borderRadius: r.sharp,
                      paddingHorizontal: sp.xs,
                    }]}>
                      <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansBold, color: colors.accent, fontSize: 10 }]}>
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
                  {addr.line1}, {addr.city}
                </Text>
                {!addr.isDefault && (
                  <Pressable onPress={() => setDefault(addr._id)}>
                    <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.accent, marginTop: 2 }]}>
                      Set as default
                    </Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(addr)} hitSlop={8}>
                  <IconSymbol name="pencil" size={16} color={colors.textMid} />
                </Pressable>
                <Pressable onPress={() => handleDelete(addr)} hitSlop={8}>
                  <IconSymbol name="trash" size={16} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add button */}
      <Pressable
        onPress={openAdd}
        style={({ pressed }) => [
          styles.addBtn,
          {
            borderColor: colors.accent,
            borderRadius: r.md,
            paddingVertical: sp.md,
            marginTop: sp.sm,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <IconSymbol name="plus" size={16} color={colors.accent} />
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.accent }]}>
          Add Address
        </Text>
      </Pressable>

      <AddressFormSheet
        visible={sheetVisible}
        onClose={() => { setSheetVisible(false); setEditing(undefined); }}
        onSave={handleSave}
        initial={editing}
        isSaving={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  defaultBadge: {},
  actions: { flexDirection: 'row', gap: 12, paddingTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1 },
});
