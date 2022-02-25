import React, {Component} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../../config/api';
import imgBG from '../../assets/bg.jpg';
import imgLogo from '../../assets/logo.png';
import {InputLogin} from './styles';
import Loading from '../../Componentes/Loading';

import variaveis from '../../variaveis';

export default class Login extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      senha: '',
      tipo: 'Paciente',
      profissional: false,
      carregando: false,
    };
  }

  componentDidMount = async () => {
    const usuario = await AsyncStorage.getItem('usuario');
    const paciente = await AsyncStorage.getItem('paciente');
    if (usuario)
      this.props.navigation.replace('Home');
    else if (paciente)
      this.props.navigation.replace('HomePaciente');

  }

  handleEntrar = async () => {
    try{
      this.setState({carregando: true});
      Keyboard.dismiss();
      const {email, senha, profissional} = this.state;

      const result = await api.post('usuario/login', {
        email,
        senha,
      });
      console.log(result.data);
      
      if (result.data) {        
        if (result.data.tipo === 'medico')
        {
          await AsyncStorage.setItem('usuario', JSON.stringify(result.data));
          this.props.navigation.replace('Home');
        }else{
          await AsyncStorage.setItem('paciente', JSON.stringify(result.data));
          this.props.navigation.replace('HomePaciente');
        }
      } else {
        Alert.alert('Atenção', 'Dados incorretos');
      }
          
      this.setState({carregando: false});
    }catch(error){
      this.setState({carregando: false});
      Alert.alert(error);
    }
  };

  handleTipo = () => {
    const {profissional} = this.state;
    this.setState({
      tipo: !profissional ? 'Profissional' : 'Paciente',
      profissional: !profissional,
    })
  }

  render() {
    const {carregando, profissional, tipo} = this.state;
    return (
      <KeyboardAvoidingView 
      style={{flex: 1,}} 
      behavior='padding' 
      keyboardVerticalOffset={80} 
      enabled={Platform.OS === 'ios'}>
        <ImageBackground source={imgBG} style={{height: '100%', width: '100%'}}>
        {!carregando ? (
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Image
                source={imgLogo}
                style={{maxWidth: 300, maxHeight: 200, marginBottom: 5}}
                resizeMode="contain"
              />              
              <InputLogin
                autoCompleteType="email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="E-mail"
                onChangeText={value => this.setState({email: value})}
              />
              <InputLogin
                autoCapitalize="none"
                autoCompleteType="password"
                keyboardType="default"
                placeholder="Senha"
                secureTextEntry={true}
                onChangeText={value => this.setState({senha: value})}
              />

              <TouchableOpacity
                style={styles.btEntrar}
                onPress={() => !carregando && this.handleEntrar()}>                
                <Text style={{textAlign: 'center', color: '#000'}}>
                  Entrar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 200,
                  height: 30,
                  borderRadius: 30,
                  marginTop: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 1)'
                }}
                onPress={() => this.props.navigation.replace('CadastroMedico')}>                
                <Text style={{textAlign: 'center', color: '#0431B4'}}>
                  Criar conta profissional
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 10,
                  width: '100%',
                  textAlign: 'center',
                  color: '#000',
                  marginTop: 30,
                }}>
                Versão: {variaveis.versao}
              </Text>
            </View>
          </View>
          ) : (<Loading />)}
        </ImageBackground>          
      </KeyboardAvoidingView>        
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btEntrar: {
    width: 300,
    height: 50,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255, 1)',
  },
});
