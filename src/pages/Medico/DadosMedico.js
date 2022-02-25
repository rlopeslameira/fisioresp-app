import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  TextInput,
  ScrollView,
  Image
} from 'react-native';
import IconAnt from 'react-native-vector-icons/AntDesign';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';
var RNFS = require('react-native-fs');
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

import * as yup from 'yup'; // for everything

import schemaMedico from './ValidacaoMedico';

export default function DadosMedico({ navigation }) {

  const [medico, setMedico] = useState({
    nome: '',
    email: '',
    cidade: '',
    estado: '',
    id: 0,
    foto: null
  });
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const result = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(result);
      setMedico(usuario);
      setLoading(false);
    };

    load();

  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      let dados = medico;

      await schemaMedico.validate(dados, { abortEarly: false });

      const rest = await api.put('/usuario', dados);

      if (rest.data) {
        Alert.alert('Atenção', 'Dados salvos com sucesso!');
        await AsyncStorage.setItem('usuario', JSON.stringify(rest.data));
        navigation.replace('Home');
      } else {
        Alert.alert('Atenção', 'Houve um problema ao tentar gravar os dados, tente novamente!');
      }
      setLoading(false);
    } catch (error) {
      if (error instanceof (yup.ValidationError)) {
        let listaErros = [];
        error.inner.forEach((err, index) => {
          listaErros[index] = err;
        })
        setErros(listaErros);
        //Alert.alert('Atenção', error.inner[0].message);
      }
      setLoading(false);
    }
  }


  async function handleSelectImage() {
    setLoading(true);

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    }

    ImagePicker.launchImageLibrary(
      {
        title: 'Selecionar foto',
        mediaType: 'photo',
        quality: 0.5,
        storageOptions: {
          skipBackup: true,
          path: 'FisioResp',
        },
      },
      async response => {
        if (response.error) {
          Alert.alert('Erro ao seleiconar imagem', response.error);
          setLoading(false);
        } else if (response.didCancel) {
          setLoading(false);
        } else {
          await ImageResizer.createResizedImage(
            response.uri,
            300,
            300,
            'JPEG',
            50,
          )
            .then(async newImage => {
              const base64image = await RNFS.readFile(newImage.uri, 'base64');
              const foto = 'data:image/jpeg;base64,' + base64image;
              setMedico({ ...medico, foto });
              setLoading(false);
            })
            .catch(err => {
              setLoading(false);
              console.warn(err);
            });
        }
      },
    );
  };

  return (
    <>
      {loading ? <Loading /> : (
        <View style={styles.content}>
          <ScrollView>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              style={{ flex: 1, alignItems: 'center', marginTop: 10 }}>

              <TouchableOpacity style={styles.iconeMedico} onPress={() => handleSelectImage()}>
                {!medico.foto ? (
                  <IconAnt name="user" size={40} color="rgba(0,128,0, 1)" />
                ) : (
                    <Image source={{ uri: medico.foto }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderColor: '#CCC',
                        borderWidth: 1,
                      }} />
                  )}
              </TouchableOpacity>

              <Text style={styles.iconeText}>Meus Dados</Text>
              <Text style={{ color: 'rgba(255,0,0, 0.8)', fontSize: 10, marginTop: 10 }}>
                Campos em vermelho são obrigatórios
            </Text>

              {erros && (
                <View style={{
                  backgroundColor: 'rgba(255,0,0, 0.4)',
                  marginTop: 10,
                  borderRadius: 6, padding: 10,
                  alignItems: 'center'
                }}>
                  {erros.map((erro, index) =>
                    <Text key={index} style={{ marginBottom: 3, fontSize: 10, }}>
                      {erro.message}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.container}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome"
                  underlineColor="#008000"
                  defaultValue={medico.nome}
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  onChangeText={nome => setMedico({ ...medico, nome })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e-mail"
                  underlineColor="#008000"
                  defaultValue={medico.email}
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  onChangeText={email => setMedico({ ...medico, email })}
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  secureTextEntry={true}
                  underlineColor="#008000"
                  defaultValue={medico.senha}
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  onChangeText={senha => setMedico({ ...medico, senha })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Cidade"
                  underlineColor="#008000"
                  defaultValue={medico.cidade}
                  onChangeText={cidade => setMedico({ ...medico, cidade })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Estado"
                  defaultValue={medico.estado}
                  underlineColor="#008000"
                  onChangeText={estado => setMedico({ ...medico, estado })}
                />

                <View style={styles.botoes}>
                  <TouchableOpacity style={styles.btVoltar} onPress={() => navigation.replace('Home')}>
                    <Text style={styles.txtBotao}>Voltar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.btGravar} onPress={() => handleSave()}>
                    <Text style={styles.txtBotao}>Gravar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      )}
    </>
  );
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  botoes: {
    flex: 1,
    maxHeight: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    maxWidth: width - 40,
  },
  btGravar: {
    flex: 1,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,128,0, 1)',
  },
  btVoltar: {
    flex: 1,
    maxHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,128,0, 1)',
  },
  txtBotao: {
    color: 'rgba(0,128,0, 1)',
  },
  container: {
    flex: 1,
    width: width,
    alignItems: 'center',
  },
  input: {
    width: width - 40,
    backgroundColor: 'rgba(60,179,113, 0.1)',
    marginTop: 15,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(30,120,10, 0.8)',
    paddingLeft: 15,
    color: '#000'
  },
  content: {
    flex: 1,
  },
  iconeMedico: {
    margin: 5,
    padding: 5,
    maxHeight: 80,
    height: 80,
    width: 80,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeText: {
    color: 'rgba(0,128,0, 1)',
    textAlign: 'center',
    fontSize: 12,
  },
});
