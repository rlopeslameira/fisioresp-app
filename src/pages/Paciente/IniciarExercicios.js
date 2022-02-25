import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Lottie from 'lottie-react-native';

import finalizado from '../../animations/finalizado.json';
import success from '../../animations/success.json';
import variaveis from '../../variaveis';
import { DownloadDirectoryPath, downloadFile, exists } from 'react-native-fs';
import { format, subHours } from 'date-fns';

export default function IniciarExercicios({ navigation, route }) {

  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [exercicios, setExercicios] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalParabens, setModalParabens] = useState(false);
  const [finalizadia, setFinalizaDia] = useState(false);
  const [totalPontos, setTotalPontos] = useState(0);
  const [evolucaoDia, setEvolucaoDia] = useState(0);
  const [ready, setReady] = useState(false);
  const [uri, setUri] = useState(null);
  const [som, setSom] = useState(null);

  useEffect(() => {
    setLoading(true);
    async function load() {
      const result = await AsyncStorage.getItem('paciente');
      const paciente_ = JSON.parse(result);

      const evolucao_dia = await api.get('/paciente/evolucao/load', {
        params: {
          paciente: paciente_.id,
          data: format(subHours(new Date(), 3), 'yyyy-MM-dd')
        }
      });
      
      if (evolucao_dia.data.length > 0)
      {
        setEvolucaoDia(evolucao_dia.data[0].evolucao);
      }

      const rest = await api.get('/exercicios/paciente', {
        params: {
          paciente: paciente_.id
        }
      });
      let exercicios_ = rest.data;
      
      exercicios_ =  exercicios_.map(reg => {
        const exe = evolucao_dia.data.find(e => e.exercicio == reg.id);
        if (exe){
          reg.finalizado = exe.finalizado;
          reg.value = exe.porcentagem * 10;
        }else{
          reg.value = 0;
        }
        return reg
      })
      
      setPaciente(paciente_);      
      setExercicios(exercicios_);
      setLoading(false);
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


  async function iniciarExercicio(modalVisible, item=null) {
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

  useEffect(() => {

  }, [ready])

  async function finalizarExercicio() {
    setFinalizaDia(false);
    setModalVisible(false);  
    setSelectedItem(null);
    setReady(false) ;
    setUri(null);
    const exercicios_ = await exercicios.map(reg => {
      if (reg.id === selectedItem.id){        
        reg.finalizado = 'S';
        reg.value = selectedItem.value;
      }
      return reg;
    });

    let pontos = 0;
    let total = 0;
    const exercicios_final = await exercicios_.map(reg => {
      if (reg.finalizado){    
        reg.porcentagem = (reg.value / 10);
        pontos = pontos + reg.value;
        total++;
      }
      return reg;
    });

    const media = (pontos / total) / 10;
    const result = await api.post('/paciente/evolucao', {
        lista: exercicios_final,
        paciente: paciente.id,
        pontos: media,
        evolucao: evolucaoDia
      }
    );
    

    setModalParabens(true);

    setExercicios(exercicios_);
    setSom(null);
  }
 
  async function finalizarDia() {
    setModalVisible(false);  
    setSelectedItem(null);
    setReady(false) ;
    let pontos = 0;
    let total = 0;
    const exercicios_ = await exercicios.map(reg => {
      if (reg.finalizado){    
        reg.porcentagem = (reg.value / 10);
        pontos = pontos + reg.value;
        total++;
      }
      return reg;
    });

    const media = (pontos / total) / 10;
    const result = await api.post('/paciente/evolucao', {
        lista: exercicios_,
        paciente: paciente.id,
        pontos: media,
      }
    );
    setTotalPontos(media);

    setModalParabens(true);
    setFinalizaDia(true);
  }

  async function fecharParabens() {
    setFinalizaDia(false);
    setModalParabens(false);
  }
  
  return (
    <>
      {loading ? <Loading /> : (
        <KeyboardAvoidingView 
        style={{flex: 1,}} 
        behavior='padding' 
        keyboardVerticalOffset={80}>
          <ScrollView style={styles.content}>
            {exercicios && exercicios.map(item => (
                <View key={item.id} style={{
                  backgroundColor: item.check ? '#228B22' : '#FFF',
                  margin: 5,
                }}>
                  <View
                    key={item.id}
                    style={{
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
                        color: '#FFF',
                        fontSize: 18,
                        backgroundColor: 'rgba(0,128,0, 0.6)',
                        padding: 10,
                      }}>{item.titulo}</Text>                     
                  </View>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', 
                  justifyContent: 'center', padding: 5}}>
                    <Text style={{ color: '#000' }}>Séries</Text>
                    <Text style={styles.input} >{item.series}</Text>
                    <Text style={{ marginLeft: 10, color: '#000' }}>Repetições</Text>
                    <Text style={styles.input} value={item.series}>{item.repeticoes}</Text>
                  </View>
                  {item.finalizado == 'S' ? (
                    <>
                      <Text style={{ color: 'rgba(0,128,0, 1)', flex: 1, fontSize: 18, textAlign: "center", }}>
                        Você atingiu
                      </Text>
                      <Text style={{ color: 'rgba(0,128,0, 1)', flex: 1, fontSize: 26, textAlign: "center", }}>{item.value}%</Text>
                      <Text style={{ color: 'rgba(0,128,0, 1)', flex: 1, fontSize: 18, textAlign: "center", marginBottom: 10,}}>
                        do objetivo.
                      </Text>
                    </>
                  ) : (
                    <TouchableOpacity 
                    onPress={() => iniciarExercicio(true, item)}
                    style={styles.btn}>
                      <Text style={{color: '#000'}}>Iniciar</Text>
                    </TouchableOpacity>
                  )}
                </View>                 
            ))}        
             <TouchableOpacity
              style={{
                borderWidth: 0.5,
                borderRadius: 6,
                padding: 10,
                marginTop: 6,                    
                width: Dimensions.get('screen').width - 10,
                marginBottom: 10,
                backgroundColor: 'rgba(0,128,0, 1)',
                alignSelf: 'center'
              }}
              onPress={() => finalizarDia()}>
              <Text style={{ color: '#FFF', textAlign: "center" }}>Finalizar Dia</Text>
            </TouchableOpacity>   
          </ScrollView>

          <Modal
            animationType="fade"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => iniciarExercicio(false)}>
            <ScrollView>
                <View >
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
                      repeat={true}
                    />
                  )}
                  {selectedItem && (
                    <>
                      <Text style={{backgroundColor: '#66CDAA', color: '#000', fontSize: 25, textAlign: "center"}}>OBJETIVO</Text>
                      <View style={{backgroundColor: '#66CDAA', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 5, }}>
                        <Text style={{ color: '#000', fontSize: 18 }}>{selectedItem.series} Séries / {selectedItem.repeticoes} Repetições</Text>
                      </View>
                      <View style={{ }}>
                        <Text style={{
                          color: '#101',
                          fontSize: 14,
                          padding: 10,
                          textAlign: 'justify'
                        }}>{selectedItem && selectedItem.detalhes}</Text>
                      </View>   
                      <Text style={{backgroundColor: '#2E8B57', color: '#FFF', paddingTop: 10,  paddingBottom: 5, fontSize: 18, textAlign: "center"}}>Informe a % atingida do objetivo.</Text>                      
                      <Slider
                        style={{backgroundColor: '#2E8B57', flex: 1, height: 30}}
                        minimumValue={0}
                        maximumValue={100}
                        value={selectedItem.value}
                        step={5}
                        onValueChange={(value) => setSelectedItem({...selectedItem, value})}
                        minimumTrackTintColor="#FFF"
                        maximumTrackTintColor="#FFF"
                      />
                      <Text style={{backgroundColor: '#2E8B57', color: '#FFF', paddingBottom: 10, marginBottom: 10,  fontSize: 25, textAlign: "center"}}>{selectedItem.value}% - CONCLUÍDO</Text>                    
                    </>
                  )} 
                  </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: "center", 
                justifyContent: "space-around", marginBottom: 10, }}>
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      marginTop: 6,                    
                      maxWidth: 160,
                      alignSelf: "center",
                      marginBottom: 10,
                      backgroundColor: 'rgba(0,128,0, 1)',
                    }}
                    onPress={() => finalizarExercicio()}>
                    <Text style={{ color: '#FFF' }}>Finalizar Exercício</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      marginTop: 6,                    
                      maxWidth: 160,
                      alignSelf: "center",
                      marginBottom: 10,
                      borderColor: 'rgba(0,128,0, 1)',
                    }}
                    onPress={() => iniciarExercicio(false)}>
                    <Text style={{ color: '#000' }}>Cancelar Exercício</Text>
                  </TouchableOpacity>
                </View>
            </ScrollView>
          </Modal>

          <Modal
            animationType="fade"
            transparent={false}
            visible={modalParabens}
            onRequestClose={() => fecharParabens()}
            >
              <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <Lottie 
                  resizeMode="contain"
                  autoPlay
                  autoSize
                  loop
                  style={{width: Dimensions.get('window').width}}
                  source={finalizadia ? success : finalizado}
                />
                
                <View style={{flexDirection: "column", alignItems: "center", justifyContent: "flex-start"}}>
                {finalizadia ? (
                  <>
                  <Text style={{textAlign: "center",  fontSize: 30, color: '#66CDAA', marginBottom: 10, }}>
                    Parabéns!!
                  </Text>            
                  <Text style={{textAlign: "center",  fontSize: 22, color: '#66CDAA', marginBottom: 10, }}>
                    Você ganhou mais {totalPontos.toFixed(1)} pontos.
                  </Text>            
                  </>
                ) : (
                  <Text style={{textAlign: "center",  fontSize: 26, color: '#66CDAA', marginBottom: 10, }}>
                    Muito bem, continue evoluindo!
                  </Text>            
                )}      
                <TouchableOpacity
                    style={{
                      borderWidth: 0.5,
                      borderRadius: 6,
                      padding: 10,
                      marginTop: 6,                    
                      maxWidth: 160,
                      marginBottom: 10,
                      borderColor: '#66CDAA',                      
                    }}
                    onPress={() => fecharParabens(false)}>
                    <Text style={{ color: '#000' }}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

        </KeyboardAvoidingView>
      )}
    </>
  );
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    margin: 10,
    fontSize: 16,
    borderBottomWidth: 0.6,
    color: "#000",
    textAlign: 'center',
    justifyContent: 'center',
  },
  titulo: {
    textAlign: 'center',
    marginTop: 5,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: '#000'
  },
  backgroundVideo: {  },
  botoes: {
    flex: 1,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  btn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    padding: 6,
    margin: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0,128,0, 1)',
    alignSelf: 'center',
    borderRadius: 6,

  },
  txtBotao: {
    color: 'rgba(0,128,0, 1)',
  },
  container: { },
  content: { flex: 1, },
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
