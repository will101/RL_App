import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View, Alert, Button, Image, ReactDOM, SectionList, FlatList } from 'react-native';

/* To Do:
*Make it look pretty
*Compare with other users
*Handle multiple results returned from rest better
*Use the data to create graphs?
*Anything else cool :P
*Try redux? should help with state(apparently)
*/

class userObj {
  username;
  avatar;
  constructor(username, avatar, platform, profile) {
    this.username = username;
    this.avatar = avatar;
    this.platform = platform;
    this.profile = profile;
  }
}

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
        console.log("length: " + length);


        if (length === 1) {
          let avatar = resJSON.data[0].avatar;
          let platform = resJSON.data[0].platform.name;
          let wins = resJSON.data[0].stats.wins;
          let goals = resJSON.data[0].stats.goals;
          let mvps = resJSON.data[0].stats.mvps;
          let saves = resJSON.data[0].stats.saves;
          let shots = resJSON.data[0].stats.shots;
          let assists = resJSON.data[0].stats.assists;
          let profileUrl = resJSON.data[0].profileUrl;
          let signatureUrl = resJSON.data[0].signatureUrl; //this has everything on in but in a picture, use the above for graphs?

          //this re renders the component!
          this.setState({ display: true, length: length++, username: userName, avatar: avatar, platform: platform, wins: wins, goals: goals, mvps: mvps, saves: saves, shots: shots, assists: assists, signatureUrl: signatureUrl });

        }
        else if (length > 1) {
          //loop through the data and put it into an array, then put it in a list view where the user selects which one is them... then we will display their data
          let allUsers = [];
          for (let i = 0; i < length; i++) {
            let avatar;
            let profileUrl;
            let platform;
            try {
              avatar = resJSON.data[i].avatar
            }
            catch (err) {
              avatar = "";
            }
            try {
              profileUrl = resJSON.data[i].profileUrl;
            }
            catch (err) {
              profileUrl = "";
            }
            try {
              platform = resJSON.data[i].platform.name;
            }
            catch (e) {
              platform = "";
            }

            let user = new userObj(userName, avatar, platform, profileUrl);
            allUsers.push(user);
          }
          this.setState({ display: "Multiple", multipleData: allUsers })
        }
        else {
          this.setState({ display: "Not found", userName: "User: " + userName + " not found." });
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
    this.state = { text: '', display: false, length: '', username: '', avatar: '', platform: '', wins: '', goals: '', mvps: '', saves: '', shots: '', assists: '', signatureUrl: '', multipleData: [] };
    this.SearchForUser = this.SearchForUser.bind(this);
  }

  render() {
    if (this.state.display === false) {
      return (
        <View style={{ alignItems: 'center', padding: 10, }}>
          <Text>Welcome to the Rocket league Stats app </Text>
          <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username here!" onChangeText={(text) => this.setState({ text })} />
          <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />
        </View>
      );
    }
    if (this.state.display === true) {
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
          <Image source={{ uri: this.state.signatureUrl }} style={{ width: 400, height: 100 }} />
          <Button title="Search Again" color="#00B200" onPress={() => this.setState({ display: false })} />
        </View >
      );
    }

    if (this.state.display === "Not found") {
      return (
        <View style={{ alignItems: 'center', padding: 10, }}>
          <Text>User '{this.state.text}' not found. </Text>
          <Button title="Search Again" color="#00B200" onPress={() => this.setState({ display: false })} />
        </View >
      );
    }

    if (this.state.display === "Multiple") {
      //display all in view with a button
      console.log("**************** the data **************");
      console.log(this.state.multipleData);
      //probably need to cast this to a json object? then should be able to print it out in a list view

      //use  the sample search of "robocop" - 8 results
      //https://facebook.github.io/react-native/docs/flatlist.html 
      //need a key extractor? https://facebook.github.io/react-native/docs/network.html 
      return (
        <View style={{ alignItems: 'center', padding: 10, }}>
          <Text> Found so many users: pick which one is yours! </Text>
          <FlatList
            data={this.state.multipleData}
            renderItem={({ item }) => <Text>User: {item.username}, Avatar: {item.avatar}, Profile: {item.profile} {"\n"}</Text>}
          />
        </View>
      );
    }

  }
}







