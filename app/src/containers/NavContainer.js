// @flow
// thanks: https://github.com/react-community/react-navigation/blob/master/examples/NavigationPlayground/js/SimpleTabs.js

import React from 'react';
import { Platform, StyleSheet, Text, StatusBar, View } from 'react-native';
import { TabNavigator } from 'react-navigation';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import CoinsComponent from '../screens/CoinsScreen';
// import StockComponent from '../screens/StockScreen';

// Set status bar to white
StatusBar.setBarStyle('light-content', true);

// Set styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#0d0d0d',
  },
  paragraph: {
    margin: 24,
    fontSize: 30,
    fontWeight: '300',
    textAlign: 'center',
    color: '#f5f5f5',
  },
});

// Base components
const ScreenContainer = (props: { banner: string }) =>
  <View style={styles.container}>
    <Text style={styles.paragraph}>
      {props.banner}
    </Text>
  </View>;

const NavIcon = (props: { color: Object, icon: string, focused: Boolean }) =>
  <Ionicons
    name={props.focused ? `ios-${props.icon}` : `ios-${props.icon}-outline`}
    size={26}
    style={{ color: props.color }}
  />;

// Render Realtime Screen
const CoinScreen = (props: { navigation: Object }) =>
  <CoinsComponent banner="Coin Tab" navigation={props.navigation} />;
  // <ScreenContainer banner="Coin Tab" navigation={props.navigation} />;

CoinScreen.navigationOptions = {
  tabBarLabel: 'Coins',
  tabBarIcon: (props: { tintColor: Object, focused: Boolean }) =>
    <NavIcon color={props.tintColor} icon="pulse" focused={props.focused} />,
};

// Render Data Screen
const StockScreen = (props: { navigation: Object }) =>
  <ScreenContainer banner="Stock Tab" navigation={props.navigation} />;

StockScreen.navigationOptions = {
  tabBarLabel: 'Stocks',
  tabBarIcon: (props: { tintColor: Object, focused: Boolean }) =>
    <NavIcon color={props.tintColor} icon="speedometer" focused={props.focused} />,
};

// Render About Screen
const AboutScreen = (props: { navigation: Object }) =>
  <ScreenContainer banner="About Tab" navigation={props.navigation} />;

AboutScreen.navigationOptions = {
  tabBarLabel: 'About',
  tabBarIcon: (props: { tintColor: Object, focused: Boolean }) =>
    <NavIcon
      color={props.tintColor}
      icon="information-circle"
      focused={props.focused}
    />,
};

// Render Tabs
const Tabs = TabNavigator(
  {
    Coins: {
      screen: CoinScreen,
      path: 'coins',
    },
    Data: {
      screen: StockScreen,
      path: 'stocks',
    },
    About: {
      screen: AboutScreen,
      path: 'settings',
    },
  },
  {
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      activeTintColor: Platform.OS === 'ios' ? '#43a047' : '#fff',
      style: {
        backgroundColor: '#000',
      },
    },
  },
);

export default Tabs;
