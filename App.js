import React, { Component } from 'react';
import { AppRegistry, Image, StyleSheet, Text, View, events, ScrollView, Button, Alert, ReactDOM, ActivityIndicator, FlatList } from 'react-native';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true }
  }


  render() {

    return (
      <View style={{ flex: 1, paddingTop: 20 }}>
        <text>Hello there!!</text>
      </View>
    );

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }
    })
  }
}

