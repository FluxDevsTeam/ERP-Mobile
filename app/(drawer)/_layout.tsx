// drawer layout file



import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Sidebar from '../../components/sidebar'; // Import the component we just made

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true, // We hide the default header because Dashboard has its own custom header
          drawerType: 'front', // Slide over
          drawerStyle: {
            width: '75%', // Width of the sidebar
          }
        }}
      >
        {/* Define screens inside the drawer */}
        <Drawer.Screen 
          name="dashboard" 
          options={{
            title: 'Dashboard',
          }} 
        />
        
        {/* You can add more screens here later, e.g. inventory, pos */}
      </Drawer>
    </GestureHandlerRootView>
  );
}