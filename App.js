import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';


import Home from './src/screens/home';
import Sobre from './src/screens/Sobre';
import Curso from './src/screens/Curso';
import Evento from './src/screens/Evento';
// import Login from './src/screens/Login';
// import Cadastro from './src/screens/Cadastro';  
import { DetalheCurso } from './src/screens/DetalheCurso';



import { tema } from './src/config/tema';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider theme={tema}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: tema.colors.primary,
          }} 
        >
          

          <Tab.Screen name="Home" component={Home}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" size={size} color={color}/>
              ),
            }} 
          />

          <Tab.Screen name="Sobre" component={Sobre}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="questioncircle" size={size} color={color}/>
              ),
            }} 
          />

          <Tab.Screen name="Curso" component={Curso}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="book" size={size} color={color}/>
              ),
            }} 
          />

          <Tab.Screen name="Evento" component={Evento}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-weekend" size={size} color={color} />
              ),
            }} 
          />
           <Tab.Screen name="DetalheCurso" component={DetalheCurso}
            options={{
              tabBarButtom: ()=>null,
              tabBarStyle:{display:'none'}
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>


  );
}
