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
  Modal,
  Image,
  Switch,
  TextInput,
} from 'react-native';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { format, toDate } from 'date-fns';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';
import Video from 'react-native-video';

export default function Exercicios({ navigation, route }) {

  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(false);
  const [paciente, setPaciente] = useState(route.params.paciente);
  const [exercicios, setExercicios] = useState(null);
  const [uri, setUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhes, setDetalhes] = useState(null);

  useEffect(() => {
    setLoading(true);
    async function load() {
      const result = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(result);

      const rest = await api.get('/exercicios', {
        params: {
          paciente: paciente.id
        }
      });

      const exercicios = rest.data.length > 0 ? rest.data : null;

      const lista = exercicios.map(item => {
        if (item.paciente)
          item.check = true;

        return item;
      });

      setUsuario(usuario);
      setLoading(false);
      setExercicios(lista);
    }
    load();
  }, []);

  async function handleShowModal(modalVisible, uri, detalhes) {
    setModalVisible(modalVisible);
    setUri(uri);
    setDetalhes(detalhes);
  }

  async function handleChange(value, id) {
    const lista = exercicios.map(item => {
      if (item.id === id) {
        item.check = value;
      }

      return item;
    });
    setExercicios(lista);
  };

  async function handleChangeSeries(text, id) {
    const lista = exercicios.map(item => {
      if (item.id === id) {
        item.series = text;
      }

      return item;
    });
    setExercicios(lista);
  };

  async function handleChangeRepeticoes(text, id) {
    const lista = exercicios.map(item => {
      if (item.id === id) {
        item.repeticoes = text;
      }

      return item;
    });
    setExercicios(lista);
  };

  async function handleSave() {
    setLoading(true);

    const lista = exercicios.filter(item => { return item.check; })
    const result = await api.post('/exercicios',
      {
        lista,
        paciente: paciente.id
      });

    Alert.alert(result.data);
    navigation.replace('DetalhesPaciente', { paciente });
    setLoading(false);
  }

  return (
    <>
      {loading ? <Loading /> : (
        <ScrollView>
          <View style={styles.content}>

            <View style={{ alignItems: 'center', marginBottom: 10, marginTop: 20, }}>
              <Text style={styles.titulo}>{paciente.name}</Text>
              <View style={{
                width: Dimensions.get('window').width - 10,
                marginTop: 5,
                paddingVertical: 14,
              }}>
                {exercicios && exercicios.map(item => (
                  <View key={item.id} style={{
                    borderWidth: 0.6,
                    borderColor: item.check ? '#228B22' : '#808080',
                    marginBottom: 5,
                  }}>
                    <View
                      key={item.id}
                      style={{
                        backgroundColor: 'rgba(220,220,220, 0.5)',
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 5,
                      }}>
                      <Text
                        lineBreakMode="tail"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          color: '#000',
                          padding: 10,
                        }}>{item.titulo}</Text>
                      <Switch
                        style={{
                          marginRight: 4,
                        }}
                        trackColor={{ true: '#CCC', false: '#CCC' }}
                        thumbColor={item.check ? "#228B22" : "#808080"}
                        value={item.check ? true : false}
                        onValueChange={value =>
                          handleChange(value, item.id)
                        }
                      />
                    </View>
                    <View style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 5,
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#000' }}>Séries</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="" placeholderTextColor="#A9A9A9"
                        value={item.series}
                        onChangeText={
                          value => handleChangeSeries(value, item.id)
                        }
                      />
                      <Text style={{ marginLeft: 10, color: '#000' }}>Repetições</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="" placeholderTextColor="#A9A9A9"
                        value={item.repeticoes}
                        onChangeText={
                          value => handleChangeRepeticoes(value, item.id)
                        }
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.container}>
              <TouchableOpacity style={styles.btGravar} onPress={() => handleSave()}>
                <Text style={styles.txtBotao}>Gravar Exercícios</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}>
            <View style={{
              marginTop: 22,
              alignItems: 'center',
              marginBottom: 10,
            }}>
              {uri && (
                <Video
                  resizeMode="contain"
                  source={myVideo}
                  style={styles.backgroundVideo} />
              )}

              <View style={{ marginTop: 10, }}>
                <Text style={{
                  color: '#101',
                  fontSize: 14,
                  padding: 20,
                  backgroundColor: 'rgba(220,220,220,0.3)',

                }}>{detalhes}</Text>
              </View>

              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  padding: 10,
                  marginTop: 30,
                }}
                onPress={() => {
                  this.handleShowModal(false, null);
                }}>
                <Text style={{ color: '#000' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </Modal>

        </ScrollView>
      )}
    </>
  );
}



const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    margin: 5,
    fontSize: 16,
    height: 40,
    width: 80,
    maxWidth: 80,
    borderWidth: 1,
    color: "#000",
    textAlign: 'center'
  },
  titulo: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 5,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: '#000'
  },
  backgroundVideo: {
    height: (Dimensions.get('window').width / 2),
    width: (Dimensions.get('window').width - 20),
  },
  botoes: {
    flex: 1,
    maxHeight: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    maxWidth: width - 40,
  },
  btGravar: {
    width: width - 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    marginLeft: 10,
    marginBottom: 20,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconePacientes: {
    margin: 5,
    padding: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  iconeText: {
    color: 'rgba(0,128,0, 1)',
    textAlign: 'center',
    fontSize: 12,
  },
});
