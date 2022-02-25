import React, { Component } from 'react';

import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import Loading from '../../Componentes/Loading';
import api from '../../config/api';

export default class ChatMedico extends Component {

  constructor(props) {
    console.log(props.route.params);
    super(props);
    this.state = {
      loading: false,
      usuario: null,
      messages: [],
      paciente: props.route.params.paciente,
      socket: null,
    }

  }


  //io('http://megaaula.nodejs7003.uni5.net/chat/')

  componentDidMount = async () => {
    try{
      this.setState({loading: true});
      const { paciente } = this.state;
      // const socket = io('http://192.168.0.11:21051/')
      const socket = io('http://megaaula.nodejs7003.uni5.net/chat/');
      const user = await AsyncStorage.getItem('usuario');
      const usuario = JSON.parse(user);

      socket.on('receivedMessage', data => {
        if (data[0].to === usuario.id && data[0].user._id === paciente.id) {
          this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, data),
          }));
        }
      });

      const res = await api.get('chat', {
        params: {
        paciente: paciente.id,
        medico: usuario.id,
        }
      });

      console.log(res.data);

      this.setState({ usuario, socket, messages: res.data, loading: false });
    }catch(error){
      console.log(error);
    }
  };

  onSend = async (messages = []) => {
    this.setState({ loading: true });
    const { paciente, usuario } = this.state;
    messages[0].to = paciente.id;

    const sendMsg = await api.post('chat/send', {
      paciente: paciente.id,
      nome: paciente.nome,
      medico: usuario.id,
      mensagem: messages[0].text,
      enviado_por: 'M'
    });

    this.state.socket.emit('infoMessage', messages);
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
    this.setState({ loading: false });
  }

  componentWillUnmount() {
    const { socket } = this.state;
    socket.disconnect();
  }

  render() {
    const { usuario, messages, loading } = this.state;
    return (
      <>
        {loading && (
          <Loading />
        )}
        {(!loading && usuario) && (
          <GiftedChat
            placeholder="Digite sua mensagem..."
            locale="pt-br"
            dateFormat="LLLL"
            timeFormat="LT"
            showUserAvatar={false}
            renderAvatar={null}
            messages={messages}
            onSend={newMessages => this.onSend(newMessages)}
            user={{
              _id: usuario.id,
            }}
          />
          )}
      </>
    )
  }
}
