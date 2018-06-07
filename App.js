import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View, Alert, Button, Image, ReactDOM, SectionList, FlatList } from 'react-native';
import { List, ListItem, Avatar, Header, ButtonGroup, CheckBox } from "react-native-elements";


class userObj {
  username;
  avatar;
  constructor(username, avatar, platform, profile, id, wins, goals, mvps, saves, assists, signatureUrl, shots) {
    this.username = username;
    this.avatar = avatar;
    this.platform = platform;
    this.profile = profile;
    this.id = id;
    this.wins = wins;
    this.goals = goals;
    this.mvps = mvps;
    this.saves = saves;
    this.assists = assists;
    this.signatureUrl = signatureUrl;
    this.shots = shots;
  }
}

export default class GetUsername extends Component {
  constructor(props) {
    super(props);
    this.state = { text: '', display: false, length: '', username: '', singlePlayerData: {}, multipleData: [], menu: '', selectedIndex: 0, stat: '', checked: false, showStats: false };
    this.SearchForUser = this.SearchForUser.bind(this);
    this.getUserFromID = this.getUserFromID.bind(this);
    this.updateIndex = this.updateIndex.bind(this)
  }

  async SearchForUser(userName) {

    if (userName != null || userName != undefined || userName != "") {
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

        //output ranked data too!
        if (length === 1) {
          let dataObj = {
            "Avatar": resJSON.data[0].avatar,
            "Platform": resJSON.data[0].platform.name,
            "Wins": resJSON.data[0].stats.wins,
            "Goals": resJSON.data[0].stats.goals,
            "Mvps": resJSON.data[0].stats.mvps,
            "Saves": resJSON.data[0].stats.saves,
            "Shots": resJSON.data[0].stats.shots,
            "Assists": resJSON.data[0].stats.assists,
            "ProfileUrl": resJSON.data[0].profileUrl,
            "SignatureUrl": resJSON.data[0].signatureUrl
          }

          //this re renders the component!
          this.setState({ display: true, length: length++, username: userName, singlePlayerData: dataObj });

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
            let id = resJSON.data[i].uniqueId;
            let wins = resJSON.data[i].stats.wins;
            let goals = resJSON.data[i].stats.goals;
            let mvps = resJSON.data[i].stats.mvps;
            let saves = resJSON.data[i].stats.saves;
            let shots = resJSON.data[i].stats.shots;
            let assists = resJSON.data[i].stats.assists;
            let signatureUrl = resJSON.data[i].signatureUrl;
            let user = new userObj(userName, avatar, platform, profileUrl, id, wins, goals, mvps, saves, assists, signatureUrl, shots);
            allUsers.push(user);
          }
          this.setState({ display: "Multiple", multipleData: allUsers })
        }
        else {
          //no users found, search using steams API
          let obj = {
            "Method": "GET",
            "Headers": {
              "Accept": "Application/json"
            }
          }
          let userCall = await fetch("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=DE17C275FB1AC961556785D2BE883E93&vanityurl=" + userName);
          let userJSON = await userCall.json();
          let userId = "";
          try {
            userId = userJSON.response.steamid;
          }
          catch (e) {
            userId = undefined;
          }

          console.log("user id!");
          console.log(userId);

          if (userId === undefined) {
            this.setState({ display: "Not found", userName: "User: " + userName + " not found." });
          }
          else {
            this.getUserFromID(userId);
          }
        }
      }
      catch (err) {
        console.log("ERROR!");
        console.log(err);
      }
    }
  }


  async getUserFromID(userId) {
    let obj = {
      method: "GET",
      headers: {
        Accept: "Application/json",
        Authorization: "JB2J33D8O694771DF5OOWMSMLYM7WXM2"
      }
    }

    let userData = await fetch("https://api.rocketleaguestats.com/v1/player?unique_id=" + userId + "&platform_id=1", obj);
    let userJSON = await userData.json();
    let displayName;
    let avatar;
    let platform;
    let profile;
    let signatureUrl;

    displayName = userJSON.displayName;

    try {
      avatar = userJSON.avatar

    }
    catch (e) {
      avatar = "";
    }
    try {
      profile = userJSON.profileUrl;

    }
    catch (e) { }


    let dataObj = {
      "Avatar": avatar,
      "Platform": userJSON.platform.name,
      "Wins": userJSON.stats.wins,
      "Goals": userJSON.stats.goals,
      "Mvps": userJSON.stats.mvps,
      "Saves": userJSON.stats.saves,
      "Shots": userJSON.stats.shots,
      "Assists": userJSON.stats.assists,
      "ProfileUrl": profile,
      "SignatureUrl": userJSON.signatureUrl
    }

    //this re renders the component!
    this.setState({ display: true, username: displayName, singlePlayerData: dataObj });

  }

  async getTopStats(index) {
    let statToFind;
    const buttons = ["Mvps", "Goals", "Wins", "Shots", "Saves", "Assists"];
    switch (index) {
      case 0:
        statToFind = "mvps"
        break;
      case 1:
        statToFind = "goals"
        break;
      case 2:
        statToFind = "wins"
        break;
      case 3:
        statToFind = "shots"
        break;
      case 4:
        statToFind = "saves"
        break;
      case 5:
        statToFind = "assists"
        break;
    }
    this.setState({ stat: statToFind });

    //console.log("selected index: " + index);
    //console.log(statToFind);

    let obj = {
      method: "GET",
      headers: {
        Accept: "Application/json",
        Authorization: "JB2J33D8O694771DF5OOWMSMLYM7WXM2"
      }
    }

    let mvp = await fetch("https://api.rocketleaguestats.com/v1/leaderboard/stat?type=" + statToFind, obj);
    let mvpJSON = await mvp.json();
    let allUsers = [];
    let avatar;
    let profileUrl;
    let platform;

    for (let i = 0; i < 100; i++) {

      try {
        avatar = mvpJSON[i].avatar
      }
      catch (err) {
        avatar = "";
      }
      try {
        profileUrl = mvpJSON[i].profileUrl;
      }
      catch (err) {
        profileUrl = "";
      }
      try {
        platform = mvpJSON[i].platform.name;
      }
      catch (e) {
        platform = "";
      }
      let id = mvpJSON[i].uniqueId;
      let wins = mvpJSON[i].stats.wins;
      let goals = mvpJSON[i].stats.goals;
      let mvps = mvpJSON[i].stats.mvps;
      let saves = mvpJSON[i].stats.saves;
      let shots = mvpJSON[i].stats.shots;
      let assists = mvpJSON[i].stats.assists;
      let signatureUrl = mvpJSON[i].signatureUrl;
      let userName = mvpJSON[i].displayName;
      let user = new userObj(userName, avatar, platform, profileUrl, id, wins, goals, mvps, saves, assists, signatureUrl, shots);
      allUsers.push(user);
    }
    this.setState({ display: false, multipleData: allUsers })

  }


  updateIndex(selectedIndex) {
    console.log("updated: ")
    console.log(selectedIndex);
    this.setState({ multipleData: [] });
    this.setState({ selectedIndex });
    this.setState({ showStats: true });
    this.getTopStats(selectedIndex);
  }

  render() {
    const buttons = ["Mvps", "Goals", "Wins", "Shots", "Saves", "Assists"];

    if (this.state.display === false && this.state.showStats === false) {
      return (
        <View style={{}}>
          <Header
            placement="left"
            leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
            centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
            rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
            style={{ alignSelf: 'stretch' }}
          />

          <Text>Welcome to the Rocket league Stats app </Text>
          <Text>Enter username or steam id</Text>
          <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username or id here!" onChangeText={(text) => this.setState({ text })} />
          <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />

          <Text>{"\n"}</Text>
          <CheckBox
            checked={this.state.checked}
            onPress={() => this.updateIndex(this.state.selectedIndex)}
            title="Show stat leaderboard!"
          />
        </View>
      );
    }


    if (this.state.display === false && this.state.showStats === true) {
      return (

        <View style={{}}>
          <Header
            placement="left"
            leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
            centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
            rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
            style={{ alignSelf: 'stretch' }}
          />

          <Text>Welcome to the Rocket league Stats app </Text>
          <Text>Enter username or steam id</Text>
          <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username or id here!" onChangeText={(text) => this.setState({ text })} />
          <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />

          <Text>{"\n"}</Text>
          <CheckBox
            checked={this.state.checked}
            onPress={() => this.updateIndex(this.state.selectedIndex)}
            title="Show stat leaderboard!"
          />

          <ButtonGroup
            onPress={this.updateIndex}
            selectedIndex={this.state.selectedIndex}
            buttons={buttons}
            containerStyle={{ height: 40 }}
          />


          <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0, }}>
            <Text>Stat leaderboard for {this.state.stat}:</Text>
            <FlatList
              data={this.state.multipleData}
              renderItem={({ item }) => (
                <ListItem
                  roundAvatar
                  title={`${item.username}`}
                  subtitle={`Platform: ${item.platform}, ${this.state.stat}: ${item[this.state.stat]}`}
                  avatar={{ uri: item.avatar }}
                  containerStyle={{ borderBottomWidth: 0 }}
                  onPress={() => this.setState({
                    display: true, singlePlayerData:
                      {
                        "Avatar": item.avatar,
                        "Platform": item.platform,
                        "Wins": item.wins,
                        "Goals": item.goals,
                        "Mvps": item.mvps,
                        "Saves": item.saves,
                        "Shots": item.shots,
                        "Assists": item.assists,
                        "ProfileUrl": item.profileUrl,
                        "SignatureUrl": item.signatureUrl
                      }
                  })}
                />
              )}
              keyExtractor={item => item.id}
            />
          </ List>
        </View>
      );
    }
    if (this.state.display === true) {
      let initials = this.state.username.slice(0, 2).toString();
      console.log("initials!");
      console.log(initials);

      if (this.state.avatar == "") {
        return (
          <View style={{}}>
            <Header
              placement="left"
              leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
              centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
              rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
              style={{ alignSelf: 'stretch' }}
            />
            <Avatar
              large
              rounded
              title={initials}
              activeOpacity={0.7}
            />
            <Text>Wins: {this.state.singlePlayerData.Wins} </Text>
            <Text> Goals: {this.state.singlePlayerData.Goals} </Text>
            <Text>MVP's: {this.state.singlePlayerData.Mvps}</Text>
            <Text>Saves: {this.state.singlePlayerData.Saves}</Text>
            <Text>Shots: {this.state.singlePlayerData.Shots}</Text>
            <Text>Assists: {this.state.singlePlayerData.Assists}</Text>
            <Image source={{ uri: this.state.singlePlayerData.signatureUrl }} style={{ width: 400, height: 100 }} />
            <Button title="Search Again" color="#00B200" onPress={() => this.setState({ display: false })} />
          </View >
        );
      }
      else {
        return (
          <View style={{}}>
            <Header
              placement="left"
              leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
              centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
              rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
              style={{ alignSelf: 'stretch' }}
            />
            <Avatar
              large
              rounded
              source={{ uri: this.state.singlePlayerData.Avatar }}
              activeOpacity={0.7}
            />
            <Text>Wins: {this.state.singlePlayerData.Wins} </Text>
            <Text>Goals: {this.state.singlePlayerData.Goals} </Text>
            <Text>MVP's: {this.state.singlePlayerData.Mvps}</Text>
            <Text>Saves: {this.state.singlePlayerData.Saves}</Text>
            <Text>Shots: {this.state.singlePlayerData.Shots}</Text>
            <Text>Assists: {this.state.singlePlayerData.Assists}</Text>
            <Image source={{ uri: this.state.singlePlayerData.signatureUrl }} style={{ width: 400, height: 100 }} />
            <Button title="Search Again" color="#00B200" onPress={() => this.setState({ display: false })} />
          </View >
        );
      }

    }

    if (this.state.display === "Not found") {

      return (
        <View style={{}}>
          <Header
            placement="left"
            leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
            centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
            rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
            style={{ alignSelf: 'stretch' }}
          />
          <Text>User '{this.state.text}' not found. </Text>
          <Text>Try entering your steam id instead:</Text>
          <TextInput style={{ height: 40, width: 200 }} placeholder="Enter steam id" onChangeText={(text) => this.setState({ text })} />
          <Button title="Search using Steam ID" color="#FF0000" onPress={() => this.getUserFromID(this.state.text)} />
        </View >
      );
    }

    if (this.state.display === "Multiple") {
      //display all in view with a button
      return (

        <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
          <Header
            placement="left"
            leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
            centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
            rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
            style={{ alignSelf: 'stretch' }}
          />
          <FlatList
            data={this.state.multipleData}
            renderItem={({ item }) => (
              <ListItem
                roundAvatar
                title={`${item.username}`}
                subtitle={`Platform: ${item.platform}, Goals: ${item.goals}`}
                avatar={{ uri: item.avatar }}
                containerStyle={{ borderBottomWidth: 0 }}
                onPress={() => this.setState({
                  display: true, singlePlayerData:
                    {
                      "Avatar": item.avatar,
                      "Platform": item.platform,
                      "Wins": item.wins,
                      "Goals": item.goals,
                      "Mvps": item.mvps,
                      "Saves": item.saves,
                      "Shots": item.shots,
                      "Assists": item.assists,
                      "ProfileUrl": item.profileUrl,
                      "SignatureUrl": item.signatureUrl
                    }
                })}
              />
            )}
            keyExtractor={item => item.id}
          />
        </ List>
      )
    }
  }
}







