import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import Video from 'react-native-video';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';
import variaveis from '../../variaveis';
import { DownloadDirectoryPath, downloadFile, exists } from 'react-native-fs';

export default function HomePaciente({navigation, route}) {
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [medico, setMedico] = useState(null);
  const [exercicios, setExercicios] = useState([]);
  const [uri, setUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhes, setDetalhes] = useState(null);
  const [ready, setReady] = useState(false);
  const [som, setSom] = useState(null);
  async function handleSair() {
    const result = await AsyncStorage.clear();
    navigation.replace('Login');
  };
  

  useEffect(() => {
      async function load(){
        try{
          setLoading(true);
          const result = await AsyncStorage.getItem('paciente');
          const paciente = JSON.parse(result);
          setPaciente(paciente);
          
          const resp_medico = await api.get('/medico', {
            params: {
              medico: paciente.medico
            }
          });

          const medico_ = resp_medico.data ? resp_medico.data : null;          
          setMedico(medico_);

          const rest = await api.get('/exercicios/paciente', {
            params: {
              paciente: paciente.id
            }
          });

          const listaExercicios = rest.data.length > 0 ? rest.data : null;

          setExercicios(listaExercicios);
          setLoading(false);
        }catch(error){
          console.log(error);
          setLoading(false);
        }
      }

      load();
   
  }, []);

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


  async function handleShowModal(modalVisible_, item) {
    try{
      setDetalhes(null);

      if (item)
      {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'Application needs access to your storage to download File',
          }
        );
    
        if (granted === PermissionsAndroid.RESULTS.GRANTED)
        {
          baixarVideo(variaveis.baseFiles + item.video, item.video);
          baixarAudio(variaveis.baseFiles + item.audio, item.audio);
        }

        setDetalhes(item.detalhes);        
      }else{
        setSom(null);
      }
      setReady(false);
      setModalVisible(modalVisible_);

    } catch(error){
      console.log(error);
    }
  }

  return (
     <>
      {loading ? (
        <Loading />
      ) : (
          <>
            {paciente && (
              <View style={styles.card}>
                {!paciente.imagem ? (
                  <IconEntypo name="user" size={40} color="rgba(0,128,0, 1)" />
                ) : (
                    <Image source={{ uri: paciente.imagem }} 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: 50, 
                      borderColor: '#CCC',
                      borderWidth: 1,
                      }} />
                  )}
                <Text style={styles.cardNome}>Olá, {paciente.name}</Text>
              </View>
            )}

            <View style={styles.contentMenu}>
              <TouchableOpacity
                style={styles.opcaoMenu}
                onPress={() => navigation.replace('Evolucao')}>
                <IconEntypo name="area-graph" size={30} color="rgba(0,128,0, 1)" />
                <Text style={styles.opcaoMenuText}>Evolução</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcaoMenu}
                onPress={() => navigation.replace('ChatPaciente', { medico })}>
                <IconEntypo name="chat" size={30} color="rgba(0,128,0, 1)" />
                <Text style={styles.opcaoMenuText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcaoMenu}
                onPress={handleSair}>
                <Icon name="exit-run" size={30} color="rgba(0,128,0, 1)" />
                <Text style={styles.opcaoMenuText}>Sair</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={{marginVertical: 16, borderBottomWidth: 1, color: '#000' }}>Lista de Exercícios</Text>
              {!exercicios ? (
                <Text>Nenhum registro encontrado.</Text>
              ) : (
                <>
                  <FlatList
                    style={styles.lista}
                    data={exercicios}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.itemLista} onPress={() => handleShowModal(true, item)}>
                        <View style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Text
                            style={{
                              flex: 1,
                              color: '#000',
                              fontSize: 12,
                            }}>
                            {item.titulo}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#000',
                              fontSize: 12,
                            }}>
                            {item.series} Series / {item.repeticoes} Repetições
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('RegistrarTreino')}>
                    <Text style={{color: '#FFF'}}>Iniciar Exercícios em Casa</Text>
                  </TouchableOpacity>
                  </>
                )}
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
                {!ready && (
                  <View>
                    <ActivityIndicator />
                    <Text style={{ marginLeft: 10, color: '#000', textAlign: 'center', width: '100%' }}>Carregando vídeo</Text>
                  </View>
                )}
                {uri && (
                  <>
                  <Video
                    source={{uri}}
                    muted={true}
                    resizeMode="contain"
                    controls={true}
                    repeat={true}
                    onReadyForDisplay={e => setReady(true)}
                    style={styles.backgroundVideo}
                  />
                  {som && (
                    <Video
                      onReadyForDisplay={e => console.log(e)}
                      source={{uri: som}}
                      onError={error => console.log(error)} 
                      controls={false}
                      audioOnly={true}
                      repeat={true}
                    />
                  )}
                  </>
                )}
                <View style={{ marginTop: 10, }}>
                  <Text style={{
                    color: '#101',
                    fontSize: 14,
                    padding: 20,
                    backgroundColor: 'rgba(60,179,113,0.3)',
                  }}>{detalhes}</Text>
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
              </View>
            </ScrollView>
          </Modal>

          </>
        )}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 10,
    backgroundColor: 'rgba(0,128,0, 1)',
    borderRadius: 2,
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
  lista: { width: '100%' },
  itemLista: {
    flex: 1,
    padding: 5,
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(60,179,113, 0.2)',
  },
  card: {
    flex: 1,
    height: 150,
    maxHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginTop: 5,
  },
  cardNome: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 22,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentMenu: {
    flex: 1,
    height: 100,
    maxHeight: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconePacientes: {
    margin: 10,
    padding: 5,
    minHeight: 80,
    maxHeight: 80,
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
  opcaoMenu: {
    margin: 10,
    padding: 5,
    minWidth: 80,
    maxWidth: 80,
    minHeight: 80,
    maxHeight: 80,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: '#CCC',
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  opcaoMenuText: {
    color: 'rgba(0,128,0, 1)',
    textAlign: 'center',
    fontSize: 10,
  },
  opcaoMenuIcon: {
    color: 'rgba(0,128,0, 1)',
    padding: 5,
  },
});
