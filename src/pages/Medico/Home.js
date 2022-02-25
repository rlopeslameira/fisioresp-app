import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFont from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../config/api';
import Loading from '../../Componentes/Loading';

import { StackActions } from '@react-navigation/native';

function Home(props) {

  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const result = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(result);
      try {
        const dados = await api.get('/paciente/lista', {
          params: {
            medico: usuario.id,
          },
        });
        setUsuario(usuario);
        setPacientes(dados.data);
        setLoading(false);
      } catch (error) {
        setPacientes([]);
        setLoading(false);
        Alert.alert('Atenção', 'Não foi possível conectar no servidor.');
      }
    }

    load();
  }, []);

  async function handleSair() {
    const result = await AsyncStorage.clear();
    props.navigation.replace('Login');
  };

  async function abreDetalhes(paciente) {
    props.navigation.replace('DetalhesPaciente', { paciente });
  }

  async function deletePaciente(paciente){
    const dados = await api.delete('/paciente', { data: {paciente: paciente.id} });
    props.navigation.replace('Home');
  }

  async function removerPaciente(paciente){
    Alert.alert(
      "Atenção",
      `Deseja remover o Paciente (${paciente.name}) ?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Sim", onPress: async () => deletePaciente(paciente)}
      ]
    );

  }

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
          <>
            {usuario && (
              <View style={styles.card}>
                {!usuario.foto ? (
                  <IconAnt name="user" size={50} color="rgba(0,128,0, 1)" />
                ) : (
                    <Image source={{ uri: usuario.foto }} 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: 50, 
                      borderColor: '#CCC',
                      borderWidth: 1,
                      }} />
                  )}
                <Text style={styles.cardNome}>Olá, {usuario.nome}</Text>
              </View>
            )}

            <View style={styles.contentMenu}>
              <TouchableOpacity
                style={styles.opcaoMenu}
                onPress={() => props.navigation.replace('DadosMedico')}>
                <IconFont name="user-md" size={30} color="rgba(0,128,0, 1)" />
                <Text style={styles.opcaoMenuText}>Meus Dados</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcaoMenu}
                onPress={() => props.navigation.replace('CadastroPaciente')}>
                <IconAnt name="adduser" size={30} color="rgba(0,128,0, 1)" />
                <Text style={styles.opcaoMenuText}>Adicionar Paciente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcaoMenu}
                onPress={handleSair}>
                <Icon name="exit-run" size={30} color="rgba(0,128,0, 1)" />
                <Text style={styles.opcaoMenuText}>Sair</Text>
              </TouchableOpacity>
            </View>

            <View style={{height: 25, backgroundColor: "#A52A2A", alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{
                  flex: 1,
                  color: '#FFF',
                  fontSize: 12,    
                  textAlignVertical: 'center'              
                }}>
                Para remover um paciente prescione por 2 segundos.
              </Text>
            </View>

            <View style={styles.content}>
              {!pacientes ? (
                <Text>Nenhum registro encontrado.</Text>
              ) : (
                  <FlatList
                    style={styles.lista}
                    data={pacientes}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.itemLista} onPress={() => abreDetalhes(item)} onLongPress={() => removerPaciente(item)}>
                        <Image
                          source={{ uri: item.imagem }}
                          style={{
                            height: 50,
                            width: 50,
                            marginRight: 10,
                            borderRadius: 25,
                          }}
                        />
                        <View style={{
                          flex: 1,
                          justifyContent: 'center',
                        }}>
                          <Text
                            style={{
                              flex: 1,
                              color: '#000',
                              fontSize: 16,
                            }}>
                            {item.name}
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              color: '#000',
                              fontSize: 14,
                            }}>
                            {item.cidade} / {item.estado}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
            </View>
          </>
        )}
    </>
  );
}

const styles = StyleSheet.create({
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

export default Home;