import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Space from './pages/Space';
import Snapshot from './pages/Snapshot';
import SnapshotGeneralInfo from './pages/SnapshotGeneralInfo';
import SnapshotMakeupInfo from './pages/SnapshotMakeupInfo';
import SnapshotHairInfo from './pages/SnapshotHairInfo';
import SnapshotImagesManage from './pages/SnapshotImagesManage';
import Folder from './pages/Folder';

enableScreens();

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerBackVisible: Platform.OS === 'ios',
            headerBackTitleVisible: false,
            presentation: 'card',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            headerStyle: {
              backgroundColor: '#3F4F5F'
            },
            headerTintColor: '#E2CFC8',
            headerTitleStyle: {
              color: '#E2CFC8'
            }
          }}
        >
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              title: 'My Spaces'
            }}
          />
          <Stack.Screen
            name="Space"
            component={Space}
            options={({ route }) => ({
              title: route.params?.spaceName || null
            })}
          />
          <Stack.Screen
            name="Folder"
            component={Folder}
            options={({ route, navigation }) => ({
              title: route.params?.folderName || null,
              headerBackVisible: false,
              headerLeft: Platform.OS === 'ios' ? () => (
                <HeaderBackButton
                  tintColor="#E2CFC8"
                  label=""
                  labelVisible={false}
                  style={{ marginLeft: -23 }} // Adjust position to match iOS default
                  onPress={() => {
                    const { parentFolderId, parentFolderName, spaceId, spaceName } = route.params;
                    if (parentFolderId && parentFolderName) {
                      navigation.navigate('Folder', {
                        folderId: parentFolderId,
                        folderName: parentFolderName,
                        spaceId: spaceId,
                        spaceName: spaceName
                      });
                    } else {
                      navigation.navigate('Space', {
                        spaceId: spaceId,
                        spaceName: spaceName
                      });
                    }
                  }}
                  backImage={({ tintColor }) => (
                    <Ionicons
                      name="chevron-back"
                      size={28} // Adjust size to match iOS default
                      color={tintColor}
                      style={{ marginLeft: 8 }} // Fine-tune icon position
                    />
                  )}
                />
              ) : undefined
            })}
          />
          <Stack.Screen
            name="Snapshot"
            component={Snapshot}
            options={({ route }) => ({
              title: route.params?.snapshotName || null,
            })}
          />
          <Stack.Screen
            name="SnapshotGeneralInfo"
            component={SnapshotGeneralInfo}
            options={{
              title: 'General Information'
            }}
          />
          <Stack.Screen
            name="SnapshotMakeupInfo"
            component={SnapshotMakeupInfo}
            options={{
              title: 'Makeup Information'
            }}
          />
          <Stack.Screen
            name="SnapshotHairInfo"
            component={SnapshotHairInfo}
            options={{
              title: 'Hair Information'
            }}
          />
          <Stack.Screen
            name="SnapshotImagesManage"
            component={SnapshotImagesManage}
            options={{
              title: 'Snapshot Images'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;