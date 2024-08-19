import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;