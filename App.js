import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View, Alert, Button, Image, ReactDOM } from 'react-native';

/* To Do:
* Work out how to display the data!
*/

export default class GetUsername extends Component {
  async SearchForUser(userName) {
    if (userName != null || userName != undefined || userName != "") {

      console.log("username: " + userName);
      let obj = {
        method: "GET",
        headers: {
          Accept: "Application/json",
          Authorization: "JB2J33D8O694771DF5OOWMSMLYM7WXM2"
        }
      }
      try {
        let response = await fetch("https://api.rocketleaguestats.com/v1/search/players?display_name=" + userName, obj)
        let resJSON = await response.json();
        let length = resJSON.totalResults;
        if (length > 0) {
          for (let i = 0; i < length; i++) {
            let avatar = resJSON.data[i].avatar;
            let platform = resJSON.data[i].platform.name;
            let wins = resJSON.data[i].stats.wins;
            let goals = resJSON.data[i].stats.goals;
            let mvps = resJSON.data[i].stats.mvps;
            let saves = resJSON.data[i].stats.saves;
            let shots = resJSON.data[i].stats.shots;
            let assists = resJSON.data[i].stats.assists;
            let signatureUrl = resJSON.data[i].signatureUrl; //this has everything on in but in a picture, use the above for graphs?

            //this re renders the component!
            this.setState({ display: true, length: length++, username: userName, avatar: avatar, platform: platform, wins: wins, goals: goals, mvps: mvps, saves: saves, shots: shots, assists: assists, signatureUrl: signatureUrl });
          }
        }
      }
      catch (err) {
        console.log("ERROR!");
        console.log(err);
      }
    }
  }
  constructor(props) {
    super(props);
    this.state = { text: '', display: false, length: '', username: '', avatar: '', platform: '', wins: '', goals: '', mvps: '', saves: '', shots: '', assists: '', signatureUrl: '' };
    this.SearchForUser = this.SearchForUser.bind(this);
  }

  render() {

    if (this.state.display === false) {
      return (
        <View style={{ alignItems: 'center', padding: 10, }}>
          <Text>Welcome to the Rocket league Stats app </Text>
          <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username here!" onChangeText={(text) => this.setState({ text })} />
          <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />
          <Text> This is the text that has been entered: {this.state.text} </Text>
        </View>
      );
    }
    else {
      //try a list or listview, or flat list to make this look a lot better!
      return (
        <View style={{ alignItems: 'center', padding: 10, }}>
          <Text>Results for {this.state.username}: </Text>
          <Image source={{ uri: this.state.avatar }} style={{ width: 50, height: 50 }} />
          <Text>Wins: {this.state.wins} </Text>
          <Text> Goals: {this.state.goals} </Text>
          <Text>MVP's: {this.state.mvps}</Text>
          <Text>Saves: {this.state.saves}</Text>
          <Text>Shots: {this.state.shots}</Text>
          <Text>Assists: {this.state.assists}</Text>
          <Image source={{ uri: this.state.signatureUrl }} style={{ width: 500, height: 100 }} />
        </View >
      );
    }
  }
}







