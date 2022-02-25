import React from 'react';
import 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import IconAnt from 'react-native-vector-icons/AntDesign'

import Login from './pages/Login';
import Home from './pages/Medico/Home';
import CadastroPaciente from './pages/Medico/CadastroPaciente';
import DetalhesPaciente from './pages/Medico/DetalhesPaciente';
import DadosMedico from './pages/Medico/DadosMedico';
import CadastroMedico from './pages/Medico/CadastroMedico';
import ChatMedico from './pages/Medico/ChatMedico';
import EditarPaciente from './pages/Medico/EditarPaciente';
import Exercicios from './pages/Medico/Exercicios';

import HomePaciente from './pages/Paciente/HomePaciente';
import ChatPaciente from './pages/Paciente/ChatPaciente';
import IniciarExercicios from './pages/Paciente/IniciarExercicios';
import Evolucao from './pages/Paciente/Evolucao';
import EvolucaoMedico from './pages/Medico/EvolucaoMedico';


const Stack = createStackNavigator();

function Routes(props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        headerMode="screen"
        screenOptions={{
        }}>
        <Stack.Screen options={{
          headerShown: false,
        }} name='Login'
          component={Login} />

        <Stack.Screen
          name='Home'
          component={Home}
          options={{
            title: 'Bem vindo',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />

        <Stack.Screen
          name='CadastroPaciente'
          component={CadastroPaciente}
          options={({ navigation, route }) => ({
            title: 'Cadastro de Paciente',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('Home')}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='DetalhesPaciente'
          component={DetalhesPaciente}
          options={({ navigation, route }) => ({
            title: `Paciente`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('Home', {
                  paciente: route.params.paciente,
                })}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='EditarPaciente'
          component={EditarPaciente}
          options={({ navigation, route }) => ({
            title: `Editar Paciente`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('DetalhesPaciente', {
                  paciente: route.params.paciente,
                })}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='EvolucaoMedico'
          component={EvolucaoMedico}
          options={({ navigation, route }) => ({
            title: `Evolução do Paciente`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('DetalhesPaciente', {
                  paciente: route.params.paciente,
                })}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='Evolucao'
          component={Evolucao}
          options={({ navigation, route }) => ({
            title: `Evolução`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('HomePaciente')}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='DadosMedico'
          component={DadosMedico}
          options={({ navigation }) => ({
            title: 'Dados do Profissional',
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('Home')}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='CadastroMedico'
          component={CadastroMedico}
          options={({ navigation }) => ({
            title: 'Cadastro Profissional',
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('Login')}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='ChatMedico'
          component={ChatMedico}
          options={({ route }) => ({
            title: `Chat (${route.params.paciente.name})`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
          })}
        />

        <Stack.Screen
          name='Exercicios'
          component={Exercicios}
          options={({ navigation, route }) => ({
            title: `Exercícios do Paciente`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('DetalhesPaciente', {
                  paciente: route.params.paciente,
                })}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='HomePaciente'
          component={HomePaciente}
          options={({ navigation, route }) => ({
            title: 'Bem vindo',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        />

        <Stack.Screen
          name='ChatPaciente'
          component={ChatPaciente}
          options={({ route, navigation }) => ({
            title: `Chat (${route.params.medico.nome})`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('HomePaciente')}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name='RegistrarTreino'
          component={IniciarExercicios}
          options={({ route, navigation }) => ({
            title: `Exercícios em Casa`,
            headerTintColor: '#fff',
            headerStyle: {
              backgroundColor: 'rgba(0,128,0, 1)',
            },
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => navigation.replace('HomePaciente')}>
                <IconAnt name="back" size={30} color="#FFF" />
              </TouchableOpacity>
            ),
          })}
        />

      </Stack.Navigator>
    </NavigationContainer>
  )
}
export default Routes;
