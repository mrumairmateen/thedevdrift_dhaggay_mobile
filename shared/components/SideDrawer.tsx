/**
 * Generic slide-in side drawer used by all role dashboards.
 *
 * Renders inside a Modal so it sits above the bottom tab bar and
 * status bar on both iOS and Android.
 *
 * Usage:
 *   <SideDrawer
 *     isOpen={isDrawerOpen}
 *     onClose={() => setDrawerOpen(false)}
 *     sections={ADMIN_DRAWER_SECTIONS}
 *     userName={user?.name}
 *     userRole={user?.role}
 *   />
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { IconSymbolName } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrawerNavItem {
  icon: IconSymbolName;
  label: string;
  route: string;
  /** Shown as a red badge when greater than 0. */
  badge?: number;
}

export interface DrawerSection {
  /** Optional section heading rendered above its items. */
  title?: string;
  items: DrawerNavItem[];
}

export interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: DrawerSection[];
  userName: string | null | undefined;
  /** e.g. "admin" | "seller" | "tailor" — capitalised and shown as a role badge. */
  userRole?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.8, 300);
const SPRING_CONFIG = { bounciness: 0, speed: 20, useNativeDriver: true } as const;
const FADE_DURATION = 200;

// ─── Component ────────────────────────────────────────────────────────────────

export function SideDrawer({
  isOpen,
  onClose,
  sections,
  userName,
  userRole,
}: SideDrawerProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Internal modal visibility stays true until the close animation finishes
  // so the backdrop/panel can animate out before the Modal unmounts.
  const [modalVisible, setModalVisible] = useState(false);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, ...SPRING_CONFIG }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, { toValue: -DRAWER_WIDTH, ...SPRING_CONFIG }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [isOpen, translateX, backdropOpacity]);

  const handleItemPress = useCallback(
    (route: string): void => {
      onClose();
      // Small delay so the drawer close animation plays before navigation.
      setTimeout(() => {
        router.navigate(route as never);
      }, 220);
    },
    [onClose, router],
  );

  const initial = (userName ?? 'U').charAt(0).toUpperCase();
  const roleLabel =
    userRole !== undefined
      ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
      : undefined;

  const styles = StyleSheet.create({
    modalBg: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.bg,
    },
    drawerPanel: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      backgroundColor: colors.surface,
      ...elev.high,
    },
    drawerHeader: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.lg,
      paddingHorizontal: sp.base,
      paddingBottom: sp.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: sp.xs,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sp.sm,
    },
    avatarCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.accentSubtle,
      borderWidth: 2,
      borderColor: colors.accentMid,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      ...typo.scale.subtitle,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accentSubtle,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
    },
    roleBadgeText: {
      fontSize: 10,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    scrollContent: {
      paddingTop: sp.sm,
      paddingBottom: Math.max(insets.bottom, sp.base) + sp.base,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: typo.fonts.sansBold,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      paddingHorizontal: sp.base,
      paddingTop: sp.lg,
      paddingBottom: sp.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: sp.base,
      marginTop: sp.sm,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      gap: sp.md,
    },
    navItemLabel: {
      flex: 1,
      ...typo.scale.body,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    badge: {
      backgroundColor: colors.error,
      borderRadius: r.pill,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: sp.xs,
    },
    badgeText: {
      fontSize: 10,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalBg}>
        {/* Dimmed backdrop — tapping it closes the drawer */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.55],
              }),
            },
          ]}
          pointerEvents="none"
        />
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityLabel="Close navigation menu"
        />

        {/* Slide-in drawer panel */}
        <Animated.View
          style={[styles.drawerPanel, { transform: [{ translateX }] }]}
        >
          {/* User info header */}
          <View style={styles.drawerHeader}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
              <Pressable
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={8}
                accessibilityLabel="Close menu"
                accessibilityRole="button"
              >
                <IconSymbol name="xmark" size={16} color={colors.textMid} />
              </Pressable>
            </View>
            <Text style={styles.userName}>{userName ?? 'User'}</Text>
            {roleLabel !== undefined && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              </View>
            )}
          </View>

          {/* Navigation sections */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {sections.map((section, sIdx) => (
              <View key={sIdx}>
                {sIdx > 0 && <View style={styles.divider} />}
                {section.title !== undefined && (
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                )}
                {section.items.map((item) => (
                  <Pressable
                    key={item.route}
                    style={styles.navItem}
                    onPress={() => handleItemPress(item.route)}
                    accessibilityRole="menuitem"
                    accessibilityLabel={item.label}
                  >
                    <IconSymbol
                      name={item.icon}
                      size={20}
                      color={colors.accent}
                    />
                    <Text style={styles.navItemLabel}>{item.label}</Text>
                    {item.badge !== undefined && item.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {item.badge > 99 ? '99+' : String(item.badge)}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
