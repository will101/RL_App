import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View, Alert, Button } from 'react-native';

/* To Do:
* Get it working with a button click!
* Display that info
*/

export default class GetUsername extends Component {
  SearchForUser(userName) {
    //let userName = text.text;

    //doing console.log, puts it into the terminal, you have to restart the project with npm start for it display in the terminal
    // console.log("username: " + userName);
    let obj = {
      method: "GET",
      headers: {
        Accept: "Application/json",
        Authorization: "JB2J33D8O694771DF5OOWMSMLYM7WXM2"
      }
    }
    fetch("https://api.rocketleaguestats.com/v1/search/players?display_name=RoboCrop", obj)
      .then(function (res) {
        return res.json()
      })
      .then(function (resJSON) {
        let length = resJSON.totalResults;
        let avatar = resJSON.data[0].avatar;
        let platform = resJSON.data[0].platform.name;
        let wins = resJSON.data[0].stats.wins;
        let goals = resJSON.data[0].stats.goals;
        let mvps = resJSON.data[0].stats.mvps;
        let saves = resJSON.data[0].stats.saves;
        let shots = resJSON.data[0].stats.shots;
        let assists = resJSON.data[0].stats.assists;
        let signatureUrl = resJSON.data[0].signatureUrl; //this has everything on in but in a picture, use the above for graphs?
        console.log("Player Data: Avatar: " + avatar + "  Wins: " + wins + " Goals: " + goals + " MVP's: " + mvps + " Saves: " + saves + " Shots: " + shots + " Assists: " + assists);
      })
      .catch((error) => {
        console.log(error);
      })

  }

  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  render() {
    return (
      <View style={{ alignItems: 'center', padding: 10, }}>
        <Text>Welcome to the Rocket league Stats app </Text>
        <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username here!" onChangeText={(text) => this.SearchForUser({ text })} />
        <Text> This is the text that has been entered: {this.state.text} </Text>
      </View>
    );

  }

}






