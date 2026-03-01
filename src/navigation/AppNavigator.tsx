import React from 'react';
import {NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  ModernDashboard,
  ExpensesScreen,
  NetWorthScreen,
  SettingsScreen,
} from '../screens';
import {useTheme} from '../theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, {focused: string; unfocused: string}> = {
  Dashboard: {focused: 'view-dashboard', unfocused: 'view-dashboard-outline'},
  Transactions: {focused: 'receipt', unfocused: 'receipt'},
  NetWorth: {focused: 'chart-line', unfocused: 'chart-line'},
  Settings: {focused: 'cog', unfocused: 'cog-outline'},
};

const AppNavigator: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {colors, isDark} = theme;
  const insets = useSafeAreaInsets();

  const baseNavTheme = isDark ? NavDarkTheme : NavDefaultTheme;
  const navigationTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: colors.background,
      card: colors.surfaceContainerLow,
      text: colors.onSurface,
      border: colors.outlineVariant,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({focused, color, size}) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: colors.surfaceContainerLow,
            borderTopColor: colors.outlineVariant + '40',
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        })}>
        <Tab.Screen
          name="Dashboard"
          component={ModernDashboard}
          options={{tabBarLabel: t('tabs.dashboard')}}
        />
        <Tab.Screen
          name="Transactions"
          component={ExpensesScreen}
          options={{tabBarLabel: t('tabs.expenses')}}
        />
        <Tab.Screen
          name="NetWorth"
          component={NetWorthScreen}
          options={{tabBarLabel: t('tabs.netWorth')}}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{tabBarLabel: t('tabs.settings')}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
