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
        <Text>Go through all the react tutorials</Text>
        <Text>Build a UI for searching for a user, a text input and a button</Text>
        <Text>When button clicked, do rest call (fetch) to return users that match</Text>
        <Text>Get user to pick one, then do another rest call and display the stats</Text>
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

