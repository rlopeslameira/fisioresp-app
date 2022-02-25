import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Modal,
  PermissionsAndroid,
  Image,
} from 'react-native';

var RNFS = require('react-native-fs');
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, toDate } from 'date-fns';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';
import * as yup from 'yup'; // for everything

import schemaPaciente from './ValidacaoPaciente';

function CadastroPaciente(props) {
  const [paciente, setPaciente] = useState({
    name: '',
    email: '',
    senha: '',
    datanascimento: '',
    dataf: '',
    contatos: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    medico: 0,
    imagem: null
  });

  const [usuario, setUsuario] = useState({});
  const [erros, setErros] = useState(null);
  const [dataSeleted, setDataSeleted] = useState(new Date());
  const [dataIos, setDataIos] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    async function load() {

      const result = await AsyncStorage.getItem('usuario');
      if (!result) {
        props.navigation.replace('Login');
      }
      const usuario = JSON.parse(result);
      setUsuario(usuario);
      setPaciente({ ...paciente, medico: usuario.id })
    }

    load();
    setLoading(false);

  }, []);

  async function handleSave() {
    let dados = paciente;
    setLoading(true);
    try {

      await schemaPaciente.validate(dados, { abortEarly: false });

      const rest = await api.post('/paciente', paciente);
      //const paciente = rest.data;
      console.log(rest.data);

      if (paciente) {
        Alert.alert('Atenção', 'Paciente adicionado com sucesso!');
        props.navigation.replace('Home');
      } else {
        Alert.alert('Atenção', 'Houve um problema ao tentar adicionar o paciente, tente novamente!');
      }
      setErros(null);
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

  function abreData() {
    Keyboard.dismiss();
    setShowDate(true);
  };

  function handleData(event, data) {
    data = data || dataSeleted;
    setDataSeleted(data);
    try {
      console.warn(data);
      const dt = toDate(data);
      const datanascimento = format(dt, 'dd/MM/yyyy');
      const dataf = format(dt, 'yyyy-MM-dd');

      setDatanascimento(datanascimento);
      setDataf(dataf);
    } catch (error) {
      console.warn(error);
    }
  }

  function handleDataAndroid(event, data) {
    data = data || dataSeleted;
    setShowDate(false);
    setDataSeleted(data);
    const dt = toDate(data);
    const datanascimento = format(dt, 'dd/MM/yyyy');
    const dataf = format(dt, 'yyyy-MM-dd');

    setPaciente({ ...paciente, datanascimento, dataf })
  }

  // date picker iOs
  async function changeDate(event, data) {
    setDataIos(data);
  }

  function setDate() {
    setShowDate(false);
    setDataSeleted(dataIos);
    const dt = toDate(dataIos);
    const datanascimento = format(dt, 'dd/MM/yyyy');
    const dataf = format(dt, 'yyyy-MM-dd');

    setPaciente({ ...paciente, datanascimento, dataf })
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
              const imagem = 'data:image/jpeg;base64,' + base64image;
              setPaciente({ ...paciente, imagem });
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
              <TouchableOpacity style={styles.iconePacientes} onPress={() => handleSelectImage()}>
                {!paciente.imagem ? (
                  <IconAnt name="user" size={40} color="rgba(0,128,0, 1)" />
                ) : (
                    <Image source={{ uri: paciente.imagem }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                  )}
              </TouchableOpacity>
              <Text style={styles.iconeText}>Dados do Paciente</Text>
              <Text style={{ color: 'rgba(255,0,0, 0.8)', fontSize: 10, marginTop: 10 }}>
                Campos em vermelho são obrigatórios
              </Text>
              {erros && (
                <View style={{
                  flex: 1, backgroundColor: 'rgba(255,0,0, 0.4)',
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
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  defaultValue={paciente.name}
                  onChangeText={name => setPaciente({ ...paciente, name })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e-mail"
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  defaultValue={paciente.email}
                  onChangeText={email => setPaciente({ ...paciente, email })}
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  secureTextEntry={true}
                  defaultValue={paciente.senha}
                  onChangeText={senha => setPaciente({ ...paciente, senha })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Data Nascimento"
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  defaultValue={paciente.datanascimento}
                  onFocus={abreData}
                />
                {(showDate && Platform.OS === 'android') && <DateTimePicker
                  locale="pt-BR"
                  value={dataSeleted}
                  mode="date"
                  display="default"
                  onChange={handleDataAndroid}
                />
                }

                {(showDate && Platform.OS === 'ios') && (
                  <Modal
                    visible={show}
                    animationType="fade"
                    transparent
                  >
                    <View style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                      flexDirection: 'column',
                    }}>
                      <DateTimePicker
                        locale="pt-Br"
                        style={{ width: '100%', backgroundColor: 'rgba(60,179,113, 0.1)' }}
                        value={dataSeleted}
                        onChange={changeDate} />
                      <View style={{
                        alignItems: 'center',
                        backgroundColor: 'rgba(60,179,113, 0.1)',
                        paddingVertical: 20,
                      }}>
                        <Button
                          title="CONFIRMAR"
                          style={{ padding: 5, fontWeight: 'bold' }}
                          color="#FFF"
                          onPress={setDate}
                        />
                      </View>
                    </View>
                  </Modal>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Contatos"
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  defaultValue={paciente.contatos}
                  onChangeText={contatos => setPaciente({ ...paciente, contatos })}

                />

                <TextInput
                  style={styles.input}
                  placeholder="Endereço"
                  placeholderTextColor='rgba(255,99,71,0.8)'
                  defaultValue={paciente.endereco}
                  onChangeText={endereco => setPaciente({ ...paciente, endereco })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Bairro"
                  placeholderTextColor='rgba(0,0,0,0.2)'
                  defaultValue={paciente.bairro}
                  onChangeText={bairro => setPaciente({ ...paciente, bairro })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Cidade"
                  placeholderTextColor='rgba(0,0,0,0.2)'
                  defaultValue={paciente.cidade}
                  onChangeText={cidade => setPaciente({ ...paciente, cidade })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Estado"
                  placeholderTextColor='rgba(0,0,0,0.2)'
                  defaultValue={paciente.estado}
                  onChangeText={estado => setPaciente({ ...paciente, estado })}
                />

                <View style={styles.botoes}>
                  <TouchableOpacity style={styles.btGravar} onPress={() => handleSave()}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Gravar</Text>
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
    maxHeight: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    maxWidth: width - 40,
    marginTop: 30,
  },
  btGravar: {
    flex: 1,
    maxHeight: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    marginBottom: 20,
    backgroundColor: 'rgba(0,128,0, 1)',
  },
  btVoltar: {
    flex: 1,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    marginTop: 10,
    marginBottom: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,128,0, 1)',
  },
  txtBotao: {
    color: 'rgba(0,128,0, 1)',
  },
  container: {
    width: width,
    alignItems: 'center',
  },
  input: {
    color: '#000',
    width: width - 40,
    backgroundColor: 'rgba(60,179,113, 0.1)',
    marginTop: 15,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(30,120,10, 0.8)',
    paddingLeft: 15,
    // borderTopLeftRadius: 12,
    // borderTopRightRadius: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconePacientes: {
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

export default CadastroPaciente;
