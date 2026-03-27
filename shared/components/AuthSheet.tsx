import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useAppDispatch, useAppSelector } from '@store/index';
import { closeAuthSheet, setCredentials, setSheetMode } from '@store/authSlice';
import { saveAuthTokens } from '@store/secureAuth';
import { useMobileLoginMutation, useMobileRegisterMutation } from '@services/authApi';

// ─── Phone helpers ─────────────────────────────────────────────────────────────

const PK_PHONE = /^(0[0-9]{10})$/;

function normalizePhone(v: string): string {
  let s = v.trim();
  if (s.startsWith('+92')) s = '0' + s.slice(3);
  else if (s.startsWith('0092')) s = '0' + s.slice(4);
  return s.replace(/\D/g, '').slice(0, 11);
}

function formatDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
}

// ─── Role options ──────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'customer' as const, label: 'Customer', sub: 'Buy fabrics & book tailors' },
  { value: 'seller'   as const, label: 'Seller',   sub: 'Sell fabrics on Dhaggay'   },
  { value: 'tailor'   as const, label: 'Tailor',   sub: 'Offer stitching services'  },
];

// ─── Demo accounts ─────────────────────────────────────────────────────────────

const DEMO_TABS = [
  { key: 'customer' as const, label: 'Customers' },
  { key: 'tailor'   as const, label: 'Tailors'   },
  { key: 'seller'   as const, label: 'Sellers'   },
  { key: 'admin'    as const, label: 'Admin'      },
];

const ALL_DEMO_ACCOUNTS = {
  customer: [
    { phone: '03100200300', name: 'Sana Ali',    initials: 'SA', color: '#0D5C63', badge: '750 pts',  badgeBg: '#E6F4F5', badgeColor: '#0D5C63', password: 'Test@123' },
    { phone: '03200300400', name: 'Bilal Khan',  initials: 'BK', color: '#1B4FBE', badge: '1250 pts', badgeBg: '#EEF3FD', badgeColor: '#1B4FBE', password: 'Test@123' },
    { phone: '03300400500', name: 'Maryam Raza', initials: 'MR', color: '#8B1A2C', badge: '200 pts',  badgeBg: '#FBEEF0', badgeColor: '#8B1A2C', password: 'Test@123' },
  ],
  tailor: [
    { phone: '03444555666', name: 'Usman Darzi',       initials: 'UD', color: '#B5872A', badge: 'Master',   badgeBg: '#FDF5E8', badgeColor: '#B5872A', password: 'Test@123' },
    { phone: '03555666777', name: 'Hina Couture',      initials: 'HC', color: '#0D5C63', badge: 'Premium',  badgeBg: '#E6F4F5', badgeColor: '#0D5C63', password: 'Test@123' },
    { phone: '03666777888', name: 'Karachi Stitchers', initials: 'KS', color: '#0D5C63', badge: 'Premium',  badgeBg: '#E6F4F5', badgeColor: '#0D5C63', password: 'Test@123' },
    { phone: '03777888999', name: 'Ahmed Tailor Co.',  initials: 'AT', color: '#4B5563', badge: 'Standard', badgeBg: '#F3F4F6', badgeColor: '#4B5563', password: 'Test@123' },
    { phone: '03999000111', name: 'Faisal Darzi',      initials: 'FD', color: '#4B5563', badge: 'Standard', badgeBg: '#F3F4F6', badgeColor: '#4B5563', password: 'Test@123' },
  ],
  seller: [
    { phone: '03111222333', name: 'Zara Fabrics',       initials: 'ZF', color: '#8B1A2C', badge: 'Lahore',  badgeBg: '#FBEEF0', badgeColor: '#8B1A2C', password: 'Test@123' },
    { phone: '03222333444', name: 'Karachi Silk House', initials: 'KS', color: '#1B4FBE', badge: 'Karachi', badgeBg: '#EEF3FD', badgeColor: '#1B4FBE', password: 'Test@123' },
    { phone: '03333444555', name: 'Punjab Lawn Studio', initials: 'PL', color: '#B5872A', badge: 'Lahore',  badgeBg: '#FDF5E8', badgeColor: '#B5872A', password: 'Test@123' },
  ],
  admin: [
    { phone: '03211111111', name: 'Platform Admin', initials: 'PA', color: '#1A0A0E', badge: 'Admin', badgeBg: '#F0EAEB', badgeColor: '#1A0A0E', password: 'Test@123' },
  ],
} as const;

// ─── Error extraction ──────────────────────────────────────────────────────────

function extractError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const data = e.data as Record<string, unknown> | undefined;
    if (typeof data?.message === 'string') return data.message;
    if (typeof e.error === 'string') return e.error;
  }
  return fallback;
}

// ─── Pakistan flag ─────────────────────────────────────────────────────────────
// Built from Views — emoji doesn't render in iOS Simulator

function PakFlag() {
  return (
    <View style={flagStyles.wrap}>
      <View style={flagStyles.white} />
      <View style={flagStyles.green}>
        {/* crescent hint — small white arc */}
        <View style={flagStyles.crescent} />
      </View>
    </View>
  );
}

const flagStyles = StyleSheet.create({
  wrap: {
    width: 22,
    height: 15,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  white: {
    width: 6,
    backgroundColor: '#FFFFFF',
  },
  green: {
    flex: 1,
    backgroundColor: '#01411C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crescent: {
    width: 7,
    height: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    marginLeft: 1,
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function AuthSheet() {
  const { colors, typo, sp, r, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const sheetOpen = useAppSelector(s => s.auth.sheetOpen);
  const sheetMode = useAppSelector(s => s.auth.sheetMode);

  // ── Animation ───────────────────────────────────────────────────────────────
  const slideY = useRef(new Animated.Value(700)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const hasOpenedRef = useRef(false);

  const backdropOpacity = slideY.interpolate({
    inputRange: [0, 700],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (sheetOpen) {
      hasOpenedRef.current = true;
      setModalVisible(true);
      slideY.setValue(700);
      Animated.spring(slideY, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 1,
        useNativeDriver: true,
      }).start();
    } else if (hasOpenedRef.current) {
      Animated.timing(slideY, {
        toValue: 700,
        duration: 260,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [sheetOpen]);

  const handleClose = useCallback(() => dispatch(closeAuthSheet()), [dispatch]);

  // ── Swipe to dismiss ────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.5) {
          dispatch(closeAuthSheet());
        } else {
          Animated.spring(slideY, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  // ── Demo accounts state ──────────────────────────────────────────────────────
  const [demoTab, setDemoTab] = useState<'customer' | 'tailor' | 'seller' | 'admin'>('customer');
  const activeDemoAccounts = ALL_DEMO_ACCOUNTS[demoTab];

  // ── Login form state ─────────────────────────────────────────────────────────
  const [loginPhoneDisplay, setLoginPhoneDisplay] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginPhoneTouched, setLoginPhoneTouched] = useState(false);
  const [loginPwTouched, setLoginPwTouched] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Register form state ──────────────────────────────────────────────────────
  const [regName, setRegName] = useState('');
  const [regPhoneDisplay, setRegPhoneDisplay] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'seller' | 'tailor'>('customer');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regNameTouched, setRegNameTouched] = useState(false);
  const [regPhoneTouched, setRegPhoneTouched] = useState(false);
  const [regPwTouched, setRegPwTouched] = useState(false);
  const [regError, setRegError] = useState('');

  // Reset forms when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      setLoginPhoneDisplay('');
      setLoginPhone('');
      setLoginPassword('');
      setShowLoginPw(false);
      setLoginPhoneTouched(false);
      setLoginPwTouched(false);
      setLoginError('');
      setDemoTab('customer');
      setRegName('');
      setRegPhoneDisplay('');
      setRegPhone('');
      setRegPassword('');
      setRegRole('customer');
      setShowRegPw(false);
      setRegNameTouched(false);
      setRegPhoneTouched(false);
      setRegPwTouched(false);
      setRegError('');
    }
  }, [sheetOpen]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const [mobileLogin, { isLoading: loginLoading }] = useMobileLoginMutation();
  const [mobileRegister, { isLoading: registerLoading }] = useMobileRegisterMutation();
  const isLoading = loginLoading || registerLoading;

  // ── Derived validation ───────────────────────────────────────────────────────
  const loginPhoneInvalid = loginPhoneTouched && !PK_PHONE.test(loginPhone);
  const loginPwInvalid    = loginPwTouched && loginPassword.length === 0;
  const loginFormValid    = PK_PHONE.test(loginPhone) && loginPassword.length > 0;

  const regNameInvalid  = regNameTouched  && regName.trim().length < 2;
  const regPhoneInvalid = regPhoneTouched && !PK_PHONE.test(regPhone);
  const regPwInvalid    = regPwTouched    && regPassword.length < 8;
  const regFormValid    = regName.trim().length >= 2 && PK_PHONE.test(regPhone) && regPassword.length >= 8;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function fillDemo(acc: { phone: string; password: string }) {
    const raw = acc.phone;
    setLoginPhone(raw);
    setLoginPhoneDisplay(formatDisplay(raw));
    setLoginPassword(acc.password);
    setLoginPhoneTouched(false);
    setLoginPwTouched(false);
    setLoginError('');
  }

  function handleLoginPhoneChange(text: string) {
    const raw = normalizePhone(text);
    setLoginPhone(raw);
    setLoginPhoneDisplay(formatDisplay(raw));
  }

  function handleRegPhoneChange(text: string) {
    const raw = normalizePhone(text);
    setRegPhone(raw);
    setRegPhoneDisplay(formatDisplay(raw));
  }

  async function submitLogin() {
    setLoginPhoneTouched(true);
    setLoginPwTouched(true);
    if (!loginFormValid) return;
    setLoginError('');
    try {
      const result = await mobileLogin({ phone: loginPhone, password: loginPassword }).unwrap();
      dispatch(setCredentials(result));
      await saveAuthTokens(result);
      dispatch(closeAuthSheet());
    } catch (err) {
      setLoginError(extractError(err, 'Sign in failed. Please check your credentials.'));
    }
  }

  async function submitRegister() {
    setRegNameTouched(true);
    setRegPhoneTouched(true);
    setRegPwTouched(true);
    if (!regFormValid) return;
    setRegError('');
    try {
      const result = await mobileRegister({
        name: regName.trim(),
        phone: regPhone,
        password: regPassword,
        role: regRole,
      }).unwrap();
      dispatch(setCredentials(result));
      await saveAuthTokens(result);
      dispatch(closeAuthSheet());
    } catch (err) {
      setRegError(extractError(err, 'Registration failed. Please try again.'));
    }
  }

  // ── Style helpers ─────────────────────────────────────────────────────────────
  const inputBorder = (invalid: boolean) => ({
    borderColor: invalid ? colors.error : colors.border,
  });

  const s = makeStyles(colors, typo, sp, r, elev);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={s.overlay}>
        {/* ── Backdrop ─────────────────────────────────────────────────────── */}
        <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        {/* ── Sheet ────────────────────────────────────────────────────────── */}
        <KeyboardAvoidingView
          style={s.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideY }] }]}>
            {/* Handle */}
            <View style={s.handleWrap} {...panResponder.panHandlers}>
              <View style={s.handle} />
            </View>

            {/* Header */}
            <View style={s.header}>
              <Text style={s.title}>
                {sheetMode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
              <Pressable onPress={handleClose} style={s.closeBtn} hitSlop={8}>
                <IconSymbol name="xmark" size={18} color={colors.textMid} />
              </Pressable>
            </View>

            {/* Tab switcher */}
            <View style={s.tabs}>
              <Pressable
                style={[s.tab, sheetMode === 'login' && s.tabActive]}
                onPress={() => dispatch(setSheetMode('login'))}
              >
                <Text style={[s.tabText, sheetMode === 'login' && s.tabTextActive]}>Sign in</Text>
              </Pressable>
              <Pressable
                style={[s.tab, sheetMode === 'register' && s.tabActive]}
                onPress={() => dispatch(setSheetMode('register'))}
              >
                <Text style={[s.tabText, sheetMode === 'register' && s.tabTextActive]}>Create account</Text>
              </Pressable>
            </View>

            <ScrollView
              style={s.scroll}
              contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + sp['2xl'] }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ── LOGIN ─────────────────────────────────────────────────── */}
              {sheetMode === 'login' && (
                <>
                  {/* ── Demo accounts box ─────────────────────────────────── */}
                  <View style={s.demoBox}>
                    {/* Box header */}
                    <View style={s.demoBoxHeader}>
                      <Text style={s.demoBoxLabel}>QUICK DEMO LOGIN</Text>
                      <View style={s.demoPasswordBadge}>
                        <Text style={s.demoPasswordText}>Test@123</Text>
                      </View>
                    </View>

                    {/* Role tabs */}
                    <View style={s.demoTabRow}>
                      {DEMO_TABS.map(t => (
                        <Pressable
                          key={t.key}
                          onPress={() => setDemoTab(t.key)}
                          style={[s.demoTabBtn, demoTab === t.key && s.demoTabBtnActive]}
                        >
                          <Text style={[s.demoTabText, demoTab === t.key && s.demoTabTextActive]}>
                            {t.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Account rows */}
                    {activeDemoAccounts.map(acc => (
                      <Pressable
                        key={acc.phone}
                        onPress={() => fillDemo(acc)}
                        style={s.demoRow}
                      >
                        <View style={[s.demoAvatar, { backgroundColor: acc.color }]}>
                          <Text style={s.demoInitials}>{acc.initials}</Text>
                        </View>
                        <View style={s.demoMeta}>
                          <Text style={s.demoName}>{acc.name}</Text>
                          <Text style={s.demoPhone}>{formatDisplay(acc.phone)}</Text>
                        </View>
                        <View style={[s.demoBadge, { backgroundColor: acc.badgeBg }]}>
                          <Text style={[s.demoBadgeText, { color: acc.badgeColor }]}>{acc.badge}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={11} color={colors.textLow} />
                      </Pressable>
                    ))}
                  </View>

                  {/* ── Phone ─────────────────────────────────────────────── */}
                  <Text style={s.label}>Phone number</Text>
                  <View style={[s.phoneRow, inputBorder(loginPhoneInvalid)]}>
                    <View style={s.phonePrefix}>
                      <PakFlag />
                      <Text style={s.prefixText}>+92</Text>
                    </View>
                    <TextInput
                      style={s.phoneInput}
                      placeholder="0300-1234567"
                      placeholderTextColor={colors.textLow}
                      keyboardType="phone-pad"
                      value={loginPhoneDisplay}
                      onChangeText={handleLoginPhoneChange}
                      onBlur={() => setLoginPhoneTouched(true)}
                      maxLength={12}
                      returnKeyType="next"
                      autoComplete="tel"
                    />
                  </View>
                  {loginPhoneInvalid && (
                    <Text style={s.fieldError}>Enter a valid number e.g. 0300-1234567</Text>
                  )}

                  {/* ── Password ──────────────────────────────────────────── */}
                  <Text style={[s.label, { marginTop: sp.base }]}>Password</Text>
                  <View style={[s.passwordRow, inputBorder(loginPwInvalid)]}>
                    <TextInput
                      style={s.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textLow}
                      secureTextEntry={!showLoginPw}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      onBlur={() => setLoginPwTouched(true)}
                      returnKeyType="done"
                      onSubmitEditing={submitLogin}
                      autoComplete="current-password"
                    />
                    <Pressable onPress={() => setShowLoginPw(v => !v)} style={s.eyeBtn} hitSlop={8}>
                      <IconSymbol
                        name={showLoginPw ? 'eye.slash' : 'eye'}
                        size={18}
                        color={colors.textLow}
                      />
                    </Pressable>
                  </View>
                  {loginPwInvalid && (
                    <Text style={s.fieldError}>Password is required.</Text>
                  )}

                  {loginError ? <Text style={s.serverError}>{loginError}</Text> : null}

                  <Pressable
                    style={[s.cta, (!loginFormValid || isLoading) && s.ctaDisabled]}
                    onPress={submitLogin}
                    disabled={isLoading}
                  >
                    <Text style={s.ctaText}>{loginLoading ? 'Signing in…' : 'Sign in'}</Text>
                  </Pressable>

                  <Pressable onPress={() => dispatch(setSheetMode('register'))} style={s.switchHint}>
                    <Text style={s.switchHintText}>
                      No account?{' '}
                      <Text style={{ color: colors.accent }}>Create one</Text>
                    </Text>
                  </Pressable>
                </>
              )}

              {/* ── REGISTER ──────────────────────────────────────────────── */}
              {sheetMode === 'register' && (
                <>
                  {/* Role selector */}
                  <Text style={[s.label, { marginBottom: sp.sm }]}>I am a…</Text>
                  <View style={s.roleRow}>
                    {ROLES.map(role => (
                      <Pressable
                        key={role.value}
                        style={[s.roleTile, regRole === role.value && s.roleTileActive]}
                        onPress={() => setRegRole(role.value)}
                      >
                        <Text style={[s.roleTileLabel, regRole === role.value && s.roleTileLabelActive]}>
                          {role.label}
                        </Text>
                        <Text style={[s.roleTileSub, regRole === role.value && s.roleTileSubActive]}>
                          {role.sub}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Name */}
                  <Text style={s.label}>Full name</Text>
                  <TextInput
                    style={[s.input, inputBorder(regNameInvalid)]}
                    placeholder="Your name"
                    placeholderTextColor={colors.textLow}
                    value={regName}
                    onChangeText={setRegName}
                    onBlur={() => setRegNameTouched(true)}
                    autoComplete="name"
                    returnKeyType="next"
                  />
                  {regNameInvalid && (
                    <Text style={s.fieldError}>Name must be at least 2 characters.</Text>
                  )}

                  {/* Phone */}
                  <Text style={[s.label, { marginTop: sp.base }]}>Phone number</Text>
                  <View style={[s.phoneRow, inputBorder(regPhoneInvalid)]}>
                    <View style={s.phonePrefix}>
                      <PakFlag />
                      <Text style={s.prefixText}>+92</Text>
                    </View>
                    <TextInput
                      style={s.phoneInput}
                      placeholder="0300-1234567"
                      placeholderTextColor={colors.textLow}
                      keyboardType="phone-pad"
                      value={regPhoneDisplay}
                      onChangeText={handleRegPhoneChange}
                      onBlur={() => setRegPhoneTouched(true)}
                      maxLength={12}
                      returnKeyType="next"
                      autoComplete="tel"
                    />
                  </View>
                  {regPhoneInvalid && (
                    <Text style={s.fieldError}>Enter a valid number e.g. 0300-1234567</Text>
                  )}

                  {/* Password */}
                  <Text style={[s.label, { marginTop: sp.base }]}>Password</Text>
                  <View style={[s.passwordRow, inputBorder(regPwInvalid)]}>
                    <TextInput
                      style={s.passwordInput}
                      placeholder="Min. 8 characters"
                      placeholderTextColor={colors.textLow}
                      secureTextEntry={!showRegPw}
                      value={regPassword}
                      onChangeText={setRegPassword}
                      onBlur={() => setRegPwTouched(true)}
                      returnKeyType="done"
                      onSubmitEditing={submitRegister}
                      autoComplete="new-password"
                    />
                    <Pressable onPress={() => setShowRegPw(v => !v)} style={s.eyeBtn} hitSlop={8}>
                      <IconSymbol
                        name={showRegPw ? 'eye.slash' : 'eye'}
                        size={18}
                        color={colors.textLow}
                      />
                    </Pressable>
                  </View>
                  {regPwInvalid && (
                    <Text style={s.fieldError}>Password must be at least 8 characters.</Text>
                  )}

                  {regError ? <Text style={s.serverError}>{regError}</Text> : null}

                  <Pressable
                    style={[s.cta, (!regFormValid || isLoading) && s.ctaDisabled]}
                    onPress={submitRegister}
                    disabled={isLoading}
                  >
                    <Text style={s.ctaText}>
                      {registerLoading ? 'Creating account…' : 'Create account'}
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => dispatch(setSheetMode('login'))} style={s.switchHint}>
                    <Text style={s.switchHintText}>
                      Already have an account?{' '}
                      <Text style={{ color: colors.accent }}>Sign in</Text>
                    </Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Styles factory ───────────────────────────────────────────────────────────

function makeStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typo: ReturnType<typeof useTheme>['typo'],
  sp: ReturnType<typeof useTheme>['sp'],
  r: ReturnType<typeof useTheme>['r'],
  elev: ReturnType<typeof useTheme>['elev'],
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    kav: {
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: r['2xl'],
      borderTopRightRadius: r['2xl'],
      maxHeight: '92%',
      ...elev.high,
    },
    handleWrap: {
      alignItems: 'center',
      paddingTop: sp.md,
      paddingBottom: sp.sm,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: r.pill,
      backgroundColor: colors.borderStrong,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
    },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: r.pill,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      flexDirection: 'row',
      marginHorizontal: sp.base,
      marginBottom: sp.lg,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    tab: {
      flex: 1,
      paddingVertical: sp.sm + 2,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.accent,
    },
    tabText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    tabTextActive: {
      color: colors.textOnAccent,
      fontFamily: typo.fonts.sansBold,
    },
    scroll: {
      flexGrow: 0,
    },
    scrollContent: {
      paddingHorizontal: sp.base,
    },

    // ── Demo box ────────────────────────────────────────────────────────────
    demoBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.md,
      backgroundColor: colors.panel,
      marginBottom: sp.lg,
      overflow: 'hidden',
    },
    demoBoxHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.md,
      paddingTop: sp.md,
      paddingBottom: sp.sm,
    },
    demoBoxLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textLow,
    },
    demoPasswordBadge: {
      backgroundColor: colors.elevated,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
    },
    demoPasswordText: {
      fontSize: 10,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      letterSpacing: 0.3,
    },
    demoTabRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    demoTabBtn: {
      flex: 1,
      paddingVertical: sp.sm,
      alignItems: 'center',
    },
    demoTabBtnActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.accent,
    },
    demoTabText: {
      fontSize: 10,
      fontFamily: typo.fonts.sansBold,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    demoTabTextActive: {
      color: colors.accent,
    },
    demoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      paddingHorizontal: sp.md,
      paddingVertical: sp.sm + 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    demoAvatar: {
      width: 28,
      height: 28,
      borderRadius: r.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    demoInitials: {
      fontSize: 9,
      fontFamily: typo.fonts.sansBold,
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    demoMeta: {
      flex: 1,
      gap: 1,
    },
    demoName: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    demoPhone: {
      fontSize: 10,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      letterSpacing: 0.2,
    },
    demoBadge: {
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
    },
    demoBadgeText: {
      fontSize: 9,
      fontFamily: typo.fonts.sansBold,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    // ── Form fields ──────────────────────────────────────────────────────────
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.xs + 2,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderRadius: r.sm,
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderRadius: r.sm,
      overflow: 'hidden',
    },
    phonePrefix: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      paddingHorizontal: sp.md,
      paddingVertical: sp.md,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.panel,
    },
    prefixText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    phoneInput: {
      flex: 1,
      paddingHorizontal: sp.md,
      paddingVertical: sp.md,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderRadius: r.sm,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    eyeBtn: {
      paddingHorizontal: sp.md,
      paddingVertical: sp.md,
    },
    fieldError: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
      marginTop: sp.xs,
    },
    serverError: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.error,
      backgroundColor: colors.errorSubtle,
      borderRadius: r.sm,
      padding: sp.md,
      marginTop: sp.md,
    },
    roleRow: {
      flexDirection: 'row',
      gap: sp.sm,
      marginBottom: sp.base,
    },
    roleTile: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.md,
      padding: sp.sm,
      alignItems: 'center',
      gap: 2,
    },
    roleTileActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSubtle,
    },
    roleTileLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
    },
    roleTileLabelActive: {
      color: colors.accent,
    },
    roleTileSub: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      textAlign: 'center',
    },
    roleTileSubActive: {
      color: colors.accentMid,
    },
    cta: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      paddingVertical: sp.md + 2,
      alignItems: 'center',
      marginTop: sp.lg,
    },
    ctaDisabled: {
      opacity: 0.5,
    },
    ctaText: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    switchHint: {
      alignItems: 'center',
      paddingVertical: sp.lg,
    },
    switchHintText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });
}
