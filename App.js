import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Space from './pages/Space';
import Snapshot from './pages/Spanshot';
import SnapshotGeneralInfo from './pages/SnapshotGeneralInfo';
import SnapshotMakeupInfo from './pages/SnapshotMakeupInfo';
import SnapshotHairInfo from './pages/SnapshotHairInfo';
import SnapshotImagesAddEdit from './pages/SnapshotImagesAddEdit';

enableScreens();

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }} // Hide the header for the Home screen
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              title: 'My Spaces',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
          <Stack.Screen
            name="Space"
            component={Space}
            options={{
              title: 'Title of Space',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
          <Stack.Screen
            name="Snapshot"
            component={Snapshot}
            options={{
              title: 'Title of Snapshot',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
          <Stack.Screen
            name="SnapshotGeneralInfo"
            component={SnapshotGeneralInfo}
            options={{
              title: 'General Information',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
          <Stack.Screen
            name="SnapshotMakeupInfo"
            component={SnapshotMakeupInfo}
            options={{
              title: 'Makeup Information',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
          <Stack.Screen
            name="SnapshotHairInfo"
            component={SnapshotHairInfo}
            options={{
              title: 'Hair Information',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
          <Stack.Screen
            name="SnapshotImagesAddEdit"
            component={SnapshotImagesAddEdit}
            options={{
              title: 'Snapshot Images',
              headerBackVisible: Platform.OS === 'ios',
              headerStyle: {
                backgroundColor: '#3F4F5F'
              },
              headerTintColor: '#E2CFC8',
              headerTitleStyle: {
                color: '#E2CFC8'
              }
            }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;