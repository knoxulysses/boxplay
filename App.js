import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StoreProvider } from './src/store';
import { C } from './src/theme';
import Home from './src/screens/Home';
import MyList from './src/screens/MyList';
import Me from './src/screens/Me';
import Detail from './src/screens/Detail';
import Player from './src/screens/Player';
import Legal from './src/screens/Legal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const icons = { Home: 'home', 'My List': 'bookmark', Me: 'person' };

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: C.card, borderTopColor: '#2a2a2a' },
      tabBarActiveTintColor: C.accent, tabBarInactiveTintColor: '#888',
      tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
    })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="My List" component={MyList} />
      <Tab.Screen name="Me" component={Me} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.card } }}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: C.card }, headerTintColor: '#fff' }}>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Detail" component={Detail} options={{ title: '' }} />
          <Stack.Screen name="Player" component={Player} options={{ title: 'Now Playing' }} />
          <Stack.Screen name="Legal" component={Legal} options={{ title: 'About / DMCA / Terms' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </StoreProvider>
  );
}
