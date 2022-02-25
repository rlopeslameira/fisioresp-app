import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../../config/api';
import { format , subHours} from 'date-fns';
import {Calendar, LocaleConfig} from 'react-native-calendars';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
  today: 'Hoje'
};

LocaleConfig.defaultLocale = 'pt-br';

export default function Evolucao({navigation, route}) {
  const [loading, setLoading] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [markeddatelist, setMarkedDatesList] = useState({});
  const [detalhes, setDetalhes] = useState(null);
  const [date, setDate] = useState(subHours(new Date(), 3));
  // const [date, setDate] = useState(format(new Date(), 'yyyy-M-dd'));

  async function handleSair() {
    const result = await AsyncStorage.clear();
    navigation.replace('Login');
  };

  async function carregaEvolucao(paciente_){
    const evolucao_mes = await api.get('/paciente/evolucao', {
      params: {
        paciente: paciente_.id,
        mes: format(date, 'M')
      }
    });

    let objs = {};
    evolucao_mes.data.map(item => {
      objs = {...objs, [item.data]:{selected: true}};
    });
    return objs;
  }

  useEffect(() => {

      async function load(){
        try{
          setLoading(true);
          const result = await AsyncStorage.getItem('paciente');
          const paciente_ = JSON.parse(result);

          const evo = await carregaEvolucao(paciente_);

          setMarkedDatesList(evo);    

          setPaciente(paciente_);
          setLoading(false);
        }catch(error){
          console.log('error', error);
          setLoading(false);
        }
      }
      load();  
  }, []);

  async function loadDay(day){
    setDate(new Date(day.dateString + 'T06:00:00'));
    addDate(day.dateString);
    const evolucao_dia = await api.get('/paciente/evolucao/load', {
      params: {
        paciente: paciente.id,
        data: day.dateString
      }
    });
    setDetalhes(evolucao_dia.data.length > 0 ? evolucao_dia.data : null);

  }

  async function addDate(date){    
    const evo = await carregaEvolucao(paciente);

    let objs = {...evo, [date]:{selected: true, selectedColor: 'green'}};
    setMarkedDatesList(objs);
  }

  return (
    <ScrollView>
    <View style={styles.container}>
     <Calendar     
        markingType={'custom'}
        current={date}
        markedDates={markeddatelist}
        onDayPress={loadDay}
        hideExtraDays={true}
        enableSwipeMonths={true}
      />
        {detalhes ? (
        <View style={{flex: 1}}>
          <Text style={{color: '#000', flex: 1, textAlign: "center", marginTop: 10, fontSize: 20}}>
            {format(date, 'dd/MM/yyyy') }
          </Text>
          <Text style={{color: '#000', flex: 1, textAlign: "center", marginTop: 4, }}>Ganhou {detalhes[0].total} Pontos</Text>
          <View style={{backgroundColor: '#CCC', height: 3, flex: 1, marginHorizontal: 10, marginVertical: 12,}}>
          </View>
          {detalhes.map((item, index) => (
            <View key={index} style={{
              marginHorizontal: 10,
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              padding: 4,
            }}>
              <View style={item.finalizado ? styles.porcentagemVerde : styles.porcentagem}>
                <Text style={{fontSize: 14, fontWeight: 'bold'}}>{item.porcentagem * 10}%</Text>
              </View>
              <Text style={styles.text}>{item.titulo}</Text>
            </View>
          ))}
        </View>
        ) : (
          <View style={{flex: 1}}>
            <Text style={{color: '#000', flex: 1, textAlign: "center", marginTop: 10, fontSize: 20}}>
              {format(date, 'dd/MM/yyyy') }
            </Text>
            <Text style={{color: '#000', flex: 1, textAlign: "center", marginTop: 4}}>
              Nenhum registro encontrado.
            </Text>
          </View>
        )}
    </View>
  </ScrollView>

  );
}

const styles = StyleSheet.create({
  porcentagem: {
    backgroundColor: '#00adf5',
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  porcentagemVerde: {
    backgroundColor: 'rgba(0,128,0, 0.8)',
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  text: {
    color: '#000'
  },
  currentDay: {
    color: '#FFF'
  },
  day: {
    backgroundColor: 'rgba(0,128,0, 0.8)',
    borderColor: '#FFF',
  },
  calendar:{
    backgroundColor: 'rgba(0,128,0, 0.8)',
  },
  container: {
    paddingBottom: 20,
  },
  icLockRed: {
    width: 40,
    height: 40,
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: '#A1DD70',
  }
});
