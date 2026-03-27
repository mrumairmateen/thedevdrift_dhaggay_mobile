import {
  CormorantGaramond_300Light,
  useFonts as useCormorant,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts as useDMSans,
} from '@expo-google-fonts/dm-sans';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  useFonts as usePlayfair,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@shared/theme';
import { AuthSheet } from '@shared/components/AuthSheet';
import { store } from '@store/index';
import { setCredentials } from '@store/authSlice';
import { loadAuthTokens } from '@store/secureAuth';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { colors, mode } = useTheme();

  return (
    <>
      <AuthSheet />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navSolid },
          headerTintColor: colors.textHigh,
          contentStyle: { backgroundColor: colors.bg },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shop/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="store/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="designs/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="tailors/[slug]" options={{ headerShown: false }} />
        <Stack.Screen name="orders/new" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: '' }} />
      </Stack>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [cormorantLoaded] = useCormorant({ CormorantGaramond_300Light });
  const [playfairLoaded] = usePlayfair({ PlayfairDisplay_400Regular, PlayfairDisplay_700Bold });
  const [dmSansLoaded] = useDMSans({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  const [authHydrated, setAuthHydrated] = useState(false);

  const fontsLoaded = cormorantLoaded && playfairLoaded && dmSansLoaded;

  useEffect(() => {
    loadAuthTokens().then((saved) => {
      if (saved) store.dispatch(setCredentials(saved));
    }).finally(() => setAuthHydrated(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && authHydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, authHydrated]);

  if (!fontsLoaded || !authHydrated) return null;

  return (
    <Provider store={store}>
      <ThemeProvider initialScheme="cobalt">
        <RootNavigator />
      </ThemeProvider>
    </Provider>
  );
}
