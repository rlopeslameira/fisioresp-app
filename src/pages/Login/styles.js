import styled from 'styled-components/native';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';

export const InputLogin = styled(TextInput).attrs({
  placeholderTextColor: 'rgba(255, 255, 255, 0.6)',
})`
  border-color: rgba(255, 255, 255, 0.35);
  border-width: 1;
  padding-left: 30;
  margin-top: 15;
  width: 300;
  border-radius: 30;
  color: #FFF;
`;

export const ButtonLogin = styled(TouchableOpacity)`
  width: 300;
  height: 50;
  margin-top: 15;
  background-color: rgba(255, 255, 255, 0.7);
  color: rgba(0, 0, 0, 0.7);
  border-radius: 40;
  flex-direction: row;
  align-items: center;
  font-size: 18;
  font-weight: 500;
`;
