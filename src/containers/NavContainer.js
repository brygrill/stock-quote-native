// @flow
// thanks: https://github.com/react-community/react-navigation/blob/master/examples/NavigationPlayground/js/SimpleTabs.js

import React from 'react';
import { Platform, StyleSheet, Text, StatusBar, View } from 'react-native';
import { TabNavigator } from 'react-navigation';
// $FlowFixMe
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import Realtime from '../screens/RealtimeScreen';

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
const RealtimeScreen = (props: { navigation: Object }) =>
  <Realtime banner="Realtime Tab" navigation={props.navigation} />;

RealtimeScreen.navigationOptions = {
  tabBarLabel: 'Realtime',
  tabBarIcon: (props: { tintColor: Object, focused: Boolean }) =>
    <NavIcon color={props.tintColor} icon="pulse" focused={props.focused} />,
};

// Render Data Screen
const DataScreen = (props: { navigation: Object }) =>
  <ScreenContainer banner="Data Tab" navigation={props.navigation} />;

DataScreen.navigationOptions = {
  tabBarLabel: 'Data',
  tabBarIcon: (props: { tintColor: Object, focused: Boolean }) =>
    <NavIcon color={props.tintColor} icon="stats" focused={props.focused} />,
};

// Render News Screen
const NewsScreen = (props: { navigation: Object }) =>
  <ScreenContainer banner="News Tab" navigation={props.navigation} />;

NewsScreen.navigationOptions = {
  tabBarLabel: 'News',
  tabBarIcon: (props: { tintColor: Object, focused: Boolean }) =>
    <NavIcon color={props.tintColor} icon="paper" focused={props.focused} />,
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
    Realtime: {
      screen: RealtimeScreen,
      path: '',
    },
    Data: {
      screen: DataScreen,
      path: 'data',
    },
    News: {
      screen: NewsScreen,
      path: 'news',
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
