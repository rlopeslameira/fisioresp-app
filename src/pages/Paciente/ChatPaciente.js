import React, { Component } from 'react';

import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import Loading from '../../Componentes/Loading';
import api from '../../config/api';
import locale from 'moment/locale/pt-br';

export default class ChatPaciente extends Component {

  constructor(props) {
    console.log(props.route.params);
    super(props);
    this.state = {
      loading: false,
      paciente: null,
      messages: [],
      medico: props.route.params.medico,
      socket: null,
    }
  }

  componentDidMount = async () => {
    try{
      this.setState({loading: true});
      const { medico } = this.state;
      console.log('medico', medico);

      const socket = io('https://fisioresp-chat.herokuapp.com/');
      const paciente_ = await AsyncStorage.getItem('paciente');
      const paciente = JSON.parse(paciente_);

      socket.on('receivedMessage', data => {
        if (data[0].to === paciente.id && data[0].user._id === medico.id) {
          this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, data),
          }));
        }
      });

      const res = await api.get('chat', {
        params: {
          medico: medico.id,
          paciente: paciente.id,
        }
      });

      this.setState({ paciente, socket, messages: res.data || [], loading: false });
    }catch(error){
      console.log(error);
    }
  };

  onSend = async (messages = []) => {
    this.setState({ loading: true });
    const { medico, paciente } = this.state;
    messages[0].to = medico.id;

    const sendMsg = await api.post('chat/send', {
      medico: medico.id,
      nome: medico.nome,
      paciente: paciente.id,
      mensagem: messages[0].text,
      enviado_por: 'P'
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
    const { paciente, messages, loading } = this.state;
    return (
      <>
        {loading && (
          <Loading />
        )}
        {(!loading && paciente) && (
          <GiftedChat
            placeholder="Digite sua mensagem..."
            locale="pt-br"
            dateFormat="LLLL"
            timeFormat="LT"
            showUserAvatar={false}
            renderAvatar={null}
            textInputStyle={{color: '#000'}}
            messages={messages}
            onSend={newMessages => this.onSend(newMessages)}
            user={{
              _id: paciente.id,
            }}
          />
          )}
      </>
    )
  }
}
