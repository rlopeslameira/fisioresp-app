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
  Alert,
  Modal,
  Image,
  PermissionsAndroid
} from 'react-native';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { format, toDate } from 'date-fns';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';
import Video from 'react-native-video';
import variaveis from '../../variaveis';
import { DownloadDirectoryPath, downloadFile, exists } from 'react-native-fs';

const w_ = Dimensions.get('window').width;

export default function DetalhesPaciente({ navigation, route }) {
  //console.log(route);
  let _video = React.createRef();
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [exercicios, setExercicios] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ready, setReady] = useState(false);
  const [uri, setUri] = useState(null);
  const [som, setSom] = useState(null);

  useEffect(() => {

    async function load() {

      await setPaciente(route.params.paciente);

      setLoading(true);
      const result = await AsyncStorage.getItem('usuario');
      setUsuario(JSON.parse(result));

      const rest = await api.get('/exercicios/paciente', {
        params: {
          paciente: route.params.paciente.id
        }
      });
      const listaExercicios = rest.data.length > 0 ? rest.data : null;

      setLoading(false);
      setExercicios(listaExercicios);
    }

    load();

  }, []);

  function handleEditar() {
    navigation.replace('EditarPaciente', { paciente });
  }

  async function handleEditarExercicios() {
    navigation.replace('Exercicios', { paciente });
  }


  async function baixarVideo(url, fileName){
    const path = `${DownloadDirectoryPath}/${fileName}`;
    if (exists(path))
    {
      setUri("file://"+path);
      return true;
    }
    
    const response =  await downloadFile({fromUrl: url, toFile: path});

    return response.promise.then(async(res) => {
      if(res && res.statusCode === 200 && res.bytesWritten > 0)
      {
        setUri("file://"+path);

      }else{
        console.log(res)
      }
    })
  };

  async function baixarAudio(url, fileName){
    const path = `${DownloadDirectoryPath}/${fileName}`;
    const tem = await exists(path);

    try{
      if (tem)
      {
        setSom("file://"+path);
        return true;
      }
      const response =  await downloadFile({fromUrl: url, toFile: path});

      return response.promise.then(async(res) => {
        if(res && res.statusCode === 200 && res.bytesWritten > 0)
        {
          setSom("file://"+path);
        }else{
          console.log(res)
        }
      })
    }catch(error){
      console.log(error);
    }
  };


  async function handleShowModal(modalVisible, item=null) {
    if (item)
    {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message:
            'Application needs access to your storage to download File',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED)
      {
        baixarVideo(variaveis.baseFiles + item.video, item.video);
        baixarAudio(variaveis.baseFiles + item.audio, item.audio);
      }
    }
    setModalVisible(modalVisible);  
    setSelectedItem(item);
    setReady(false) ;
  }

  // async function handleShowModal(modalVisible, uri, detalhes) {
  //   setReady(false);
  //   setModalVisible(modalVisible)
  //   setUri(uri);
  //   setDetalhes(detalhes);
  // }


  return (
    <>
      {(loading || !paciente) ? <Loading /> : (
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.iconePacientes}>
              <Image
                source={{ uri: paciente.imagem }}
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: 60,
                  marginTop: 10,
                }}
              />
              <Text style={{ color: '#000', fontSize: 16 }}>
                {paciente.name}
              </Text>
              <Text style={{ color: '#000', fontSize: 11, paddingBottom: 16 }}>
                {paciente.cidade} / {paciente.estado}
              </Text>
              <View style={{width: (w_ - 10), flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity style={styles.btn}  onPress={() => handleEditar()}>
                  <IconAnt name="edit" size={30} color="rgba(60,179,113,1)" />
                  <Text style={{color: 'black', fontSize: 12}}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('EvolucaoMedico', { paciente })}>
                  <IconAnt name="barschart" size={30} color="rgba(60,179,113,1)" />
                  <Text style={{color: 'black', fontSize: 12}}>Evolução</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} 
                  onPress={() => navigation.navigate('ChatMedico', {
                    paciente: paciente,
                  })}
                >
                  <IconAnt name="wechat" size={30} color="rgba(60,179,113,1)" />
                  <Text style={{color: 'black', fontSize: 12}}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ alignItems: 'center', marginTop: 10, }}>
              <Text style={styles.titulo}>Lista de Exercícios</Text>
              <View style={{
                width: Dimensions.get('window').width - 10,
                marginTop: 5,
                paddingVertical: 14,
              }}>
                {exercicios && exercicios.map(item => (
                  <TouchableOpacity
                    key={item.id} onPress={() => handleShowModal(true, item)}
                    style={{
                      backgroundColor: 'rgba(60,179,113,0.3)',
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginBottom: 5,
                    }}>
                    <Text
                      lineBreakMode="tail"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        color: '#000',
                        padding: 5,
                        fontWeight: 'bold',
                      }}>{item.titulo}</Text>
                    <Text
                      style={{
                        flex: 1,
                        marginBottom: 8,
                        color: '#000',
                      }}>{item.series} Series | {item.repeticoes} Repetições </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.container}>
              <TouchableOpacity style={styles.btGravar} onPress={() => handleEditarExercicios()}>
                <Text style={styles.txtBotao}>Editar Exercícios</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}>
            <ScrollView>
              <View style={{
                marginTop: 22,
                alignItems: 'center',
                marginBottom: 10,
              }}>
                {selectedItem && (
                  <>
                    {uri && (
                      <Video                    
                        source={{ uri }}
                        muted={true}
                        resizeMode="contain"
                        controls={true}
                        repeat={true}
                        style={{
                          backgroundColor: '#000',
                          height: 340,
                          width: Dimensions.get('window').width,
                        }}
                        onReadyForDisplay={e => setReady(true)}
                      />
                    )}
                    {som && (
                      <Video
                        onReadyForDisplay={e => console.log(e)}
                        source={{uri: som}}
                        onError={error => console.log(error)} 
                        controls={false}
                        audioOnly={true}
                        repeat={false}
                      />
                    )}
                    <View style={{ marginTop: 10, }}>
                      <Text style={{
                        color: '#101',
                        fontSize: 14,
                        padding: 20,
                        backgroundColor: 'rgba(60,179,113,0.3)',
                      }}>{selectedItem.detalhes}</Text>
                    </View>

                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        marginTop: 30,
                      }}
                      onPress={() => handleShowModal(false, null)}>
                      <Text style={{ color: '#000' }}>Fechar</Text>
                    </TouchableOpacity>
                </>
                )}
              </View>

            </ScrollView>
          </Modal>

        </ScrollView>
      )}
    </>
  );
}


const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(60,179,113,1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 5,    
  },
  titulo: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backgroundVideo: {
    height: (Dimensions.get('window').width - 80),
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
  input: {
    width: width - 40,
    backgroundColor: 'rgba(60,179,113, 0.1)',
    marginTop: 15,
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
