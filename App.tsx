/**
 * Expensso — Expense & Net Worth Tracker
 * React Native CLI (No Expo)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import './src/i18n'; // Initialize i18n
import AppNavigator from './src/navigation/AppNavigator';
import {useAppInit} from './src/hooks';
import {COLORS} from './src/constants';
import {ThemeProvider} from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 2,
    },
  },
});

const SplashScreen: React.FC<{error?: string | null}> = ({error}) => (
  <View style={splashStyles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent />
    <Text style={splashStyles.logo}>Expensso</Text>
    <Text style={splashStyles.tagline}>Track. Plan. Grow.</Text>
    {error ? (
      <Text style={splashStyles.error}>{error}</Text>
    ) : (
      <ActivityIndicator size="small" color={COLORS.primary} style={splashStyles.loader} />
    )}
  </View>
);

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  loader: {
    marginTop: 32,
  },
  error: {
    marginTop: 24,
    fontSize: 14,
    color: COLORS.danger,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

const App: React.FC = () => {
  const {isReady, error} = useAppInit();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {isReady ? <AppNavigator /> : <SplashScreen error={error} />}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
