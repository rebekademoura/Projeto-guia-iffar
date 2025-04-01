import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import Home from './src/screens/home';
import Sobre from './src/screens/Sobre';
import Curso from './src/screens/Curso';
import Evento from './src/screens/Evento';
import { tema } from './src/config/tema';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={tema}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home}></Stack.Screen>
          <Stack.Screen name="Sobre" component={Sobre}></Stack.Screen>
          <Stack.Screen name="Curso" component={Curso}></Stack.Screen>
          <Stack.Screen name="Evento" component={Evento}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>


  );
}
