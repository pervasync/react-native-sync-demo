/**
 * Demo App for React Native Sync
 */

import React from "react";
import {
  AppRegistry
} from "react-native";
import { name as appKey } from './app.json';
import {
  StackNavigator,
  TabNavigator,
  TabBarBottom
} from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome";
import SettingsScreen from "./SettingsScreen";
import FilesScreen from "./FilesScreen";
import DatabaseScreen from "./DatabaseScreen";
import RecordScreen from "./RecordScreen";

const SettingsStack = StackNavigator({
  SettingsScreen: {
    screen: SettingsScreen,
    navigationOptions: () => ({
      headerTitle: "Sync Settings"
    })
  }
});

const DatabaseStack = StackNavigator({
  DatabaseScreen: {
    screen: DatabaseScreen,
    navigationOptions: () => ({
      headerTitle: "Tables"
    })
  },
  RecordScreen: {
    screen: RecordScreen,
    navigationOptions: ({ navigation }) => ({
      headerTitle: `${navigation.state.params.syncTable.name}: ${navigation.state.params.index}`
    })
  }
});

const FilesStack = StackNavigator(
  {// Route Configs
    FilesScreen: {
      screen: FilesScreen,
      navigationOptions: () => ({
        headerTitle: "Files"
      })
    }
  }
);

class MyApp extends React.Component {
  render() {
    let MyTabNavigator =
      TabNavigator(
        {// Route Configs
          SettingsStack: { screen: SettingsStack },
          DatabaseStack: { screen: DatabaseStack },
          FilesStack: { screen: FilesStack },
        },
        {// TabNavigator Configs
          navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ tintColor }) => {
              let iconNameMap = {
                FilesStack: "folder",
                DatabaseStack: "database",
                SettingsStack: "cog"
              }
              let icon = <Icon name={iconNameMap[navigation.state.routeName]}
                color={tintColor} size={25} />;
              return icon;
            },
            tabBarLabel: () => {
              let labelMap = {
                FilesStack: "Files",
                DatabaseStack: "Database",
                SettingsStack: "Settings"
              }
              let label = labelMap[navigation.state.routeName];
              return label;
            },
          }),
          tabBarComponent: TabBarBottom,
          tabBarPosition: 'bottom',
          tabBarOptions: {
            activeTintColor: 'blue',
            inactiveTintColor: 'gray',
          },
          animationEnabled: false,
          swipeEnabled: false,
        }
      );

    return <MyTabNavigator />;
  }
}

AppRegistry.registerComponent(appKey, () => MyApp);
