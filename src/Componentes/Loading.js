import React, { Component } from 'react';

import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

export default class Componentes extends Component {

    render() {

    return (
        <View style={styles.content}>
            <ActivityIndicator size={25} color="#FFF"/>
            <Text style={{
                color: '#FFF',
                fontSize: 20,
            }}>
                Aguarde...
            </Text>
        </View>
    );
  }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});