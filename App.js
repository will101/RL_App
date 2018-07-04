import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View, Alert, Button, Image, ReactDOM, SectionList, FlatList, StyleSheet, ScrollView } from 'react-native';
import { List, ListItem, Avatar, Header, ButtonGroup, CheckBox } from "react-native-elements";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryPie } from "victory-native";
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

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

class seasonData {
  constructor(season, singles, doubles, triples) {
    this.season = season;
    this.singles = singles;
    this.doubles = doubles;
    this.triples = triples;
  }
}

class MenuComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };

  }
  //setState isnt working!
  render() {

    if (this.state.open === false) {
      return (
        <View style={{}}>
          <Button title="Open Menu" color="#ADD8E6" onPress={() => this.setState({ open: true })} />
        </View>
      );
    }

    //style this properly!
    //or try this? might ake everything cleaner: https://reactnavigation.org/docs/en/getting-started.html 
    if (this.state.open === true) {
      return (
        <View style={{}}>
          <Text>Menu!</Text>
          <Button title="Search" color="#ADD8E6" />
          <Button title="Search by Steam ID" color="#ADD8E6" />
          <Button title="Rocket League Stat Leaderboard" color="#ADD8E6" />
          <Button title="Rocket League Tips" color="#ADD8E6" />
        </View>
      );
    }

  }
}

export default class GetUsername extends Component {
  constructor(props) {
    super(props);
    this.state = { text: '', display: false, length: '', username: '', singlePlayerData: {}, multipleData: [], menu: '', selectedIndex: 0, stat: '', rankedData: [], showStats: false, haveRanked: false };
    this.SearchForUser = this.SearchForUser.bind(this);
    this.getUserFromID = this.getUserFromID.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
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
            "id": resJSON.data[0].unieueId,
            "UserName": resJSON.data[0].displayName,
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
          //will redo this at some point to make it more dynamic! 
          //we already have the ranked data, so format and put in something like dataObj 
          let rankedData = [];
          //do this in a for , for each season!
          for (let i = 6; i < 9; i++) {
            //get the keys for this season
            let seasonKeys = Object.keys(resJSON.data[0].rankedSeasons[i]);
            //check what exists in the array
            let singlesPos = seasonKeys.indexOf("11");
            let doublePos = seasonKeys.indexOf("12");
            let triplePos = seasonKeys.indexOf("13");
            let singlesData;
            let doublesData;
            let triplesData;

            if (singlesPos != -1 && resJSON.data[0].rankedSeasons[i][11].matchesPlayed > 0) {
              singlesData = {
                "division": resJSON.data[0].rankedSeasons[i][11].division,
                "matchesPlayed": resJSON.data[0].rankedSeasons[i][11].matchesPlayed,
                "rankPoints": resJSON.data[0].rankedSeasons[i][11].rankPoints,
                "tier": resJSON.data[0].rankedSeasons[i][11].tier
              }
            }
            else {
              singlesData = {
                "division": "",
                "matchesPlayed": "",
                "rankPoints": "",
                "tier": ""
              }
            }

            if (doublePos != -1 && resJSON.data[0].rankedSeasons[i][12].matchesPlayed > 0) {
              doublesData = {
                "division": resJSON.data[0].rankedSeasons[i][12].division,
                "matchesPlayed": resJSON.data[0].rankedSeasons[i][12].matchesPlayed,
                "rankPoints": resJSON.data[0].rankedSeasons[i][12].rankPoints,
                "tier": resJSON.data[0].rankedSeasons[i][12].tier
              }
            }
            else {
              doublesData = {
                "division": "",
                "matchesPlayed": "",
                "rankPoints": "",
                "tier": ""
              }
            }
            if (triplePos != -1 && resJSON.data[0].rankedSeasons[i][13].matchesPlayed > 0) {
              triplesData = {
                "division": resJSON.data[0].rankedSeasons[i][13].division,
                "matchesPlayed": resJSON.data[0].rankedSeasons[i][13].matchesPlayed,
                "rankPoints": resJSON.data[0].rankedSeasons[i][13].rankPoints,
                "tier": resJSON.data[0].rankedSeasons[i][13].tier
              }
            }
            else {
              triplesData = {
                "division": "",
                "matchesPlayed": "",
                "rankPoints": "",
                "tier": ""
              }
            }
            //push an object, format of season:{playlist data, playlist data, playlist data}
            rankedData.push(new seasonData(i, singlesData, doublesData, triplesData));
          }
          this.setState({ display: true, length: length++, username: userName, singlePlayerData: dataObj, rankedData: rankedData });
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
      "UserName": userJSON.displayName,
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
    const styles = StyleSheet.create({
      container: {
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
      },
      title: {
        fontSize: 19,
        fontWeight: 'bold',
      },
      userTitle: {
        fontSize: 22,
        fontWeight: 'bold',

      },
      playerContainer: {
        alignItems: 'center',
        paddingVertical: 20,

      },
      label: {
        fontWeight: 'bold'
      },
      menuLeft: {

      },
      head: { height: 40, backgroundColor: '#f1f8ff' },
      tableContainer: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
      head: { height: 40, backgroundColor: '#f1f8ff' },
      text: { margin: 6 }


    });

    if (this.state.display === false && this.state.showStats === false) {
      return (
        <View style={{}}>
          <Header
            placement="left"
            leftComponent={<MenuComponent />}
            centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
            rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
            style={{ alignSelf: 'stretch' }}
          />

          <Text style={styles.title}>Enter username or steam id:</Text>
          <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username or id here!" onChangeText={(text) => this.setState({ text })} />
          <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />

          <Text>{"\n"}</Text>
          <Button
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
          <Text style={styles.title}>Enter username or steam id:</Text>
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
                      "UserName": item.username,
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

      let goalToShot = parseInt(this.state.singlePlayerData.Goals) / parseInt(this.state.singlePlayerData.Shots);
      let totalPercentage = Math.round(goalToShot * 100);
      let mvpWins = parseInt(this.state.singlePlayerData.Mvps) / parseInt(this.state.singlePlayerData.Wins);
      let totalMvpWins = Math.round(mvpWins * 100);
      console.log("DISPLAY IS TRUE");
      console.log(this.state.rankedData);

      if (this.state.avatar == "") {
        let initials = this.state.username.slice(0, 2).toString();
        console.log("initials!");
        console.log(initials);
        return (
          <View>
            <Header
              placement="left"
              leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
              centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
              rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
              style={{ alignSelf: 'stretch' }}
            />
            <ScrollView contentContainerStyle={styles.playerContainer}>
              <Text style={styles.userTitle}>Stats for: {this.state.singlePlayerData.UserName} </Text>

              <Text style={styles.title}>Play style: </Text>
              <Text>{"\n"}</Text>
              <VictoryPie
                height={300}
                width={450}
                theme={VictoryTheme.material}
                data={[
                  { x: "1", y: parseInt(this.state.singlePlayerData.Wins), label: "Wins: " + this.state.singlePlayerData.Wins.toString() },
                  { x: "2", y: parseInt(this.state.singlePlayerData.Goals), label: "Goals: " + this.state.singlePlayerData.Goals.toString() },
                  { x: "3", y: parseInt(this.state.singlePlayerData.Mvps), label: "Mvp's: " + this.state.singlePlayerData.Mvps.toString() },
                  { x: "4", y: parseInt(this.state.singlePlayerData.Shots), label: "Shots: " + this.state.singlePlayerData.Shots.toString() },
                  { x: "5", y: parseInt(this.state.singlePlayerData.Saves), label: "Saves: " + this.state.singlePlayerData.Saves.toString() },
                  { x: "6", y: parseInt(this.state.singlePlayerData.Assists), label: "Assists: " + this.state.singlePlayerData.Assists.toString() }
                ]}
              />

              <Text>Goal/Shot % -  {totalPercentage}%</Text>
              <Text>MVP/Wins % -  {totalMvpWins}%</Text>



              <Button title="Search Again" color="#00B200" onPress={() => this.setState({ display: false })} />
            </ScrollView >
          </View >

        );
      }
      else {
        let goalToShot = parseInt(this.state.singlePlayerData.Goals) / parseInt(this.state.singlePlayerData.Shots);
        let totalPercentage = Math.round(goalToShot * 100);
        let mvpWins = parseInt(this.state.singlePlayerData.Mvps) / parseInt(this.state.singlePlayerData.Wins);
        let totalMvpWins = Math.round(mvpWins * 100);

        //to display the ranked data try and use this: https://www.npmjs.com/package/react-native-table-component 
        //looks simple enough to use!

        return (
          <View>
            <Header
              placement="left"
              leftComponent={{ icon: 'menu', onPress: () => this.setState({ menu: open }), color: '#fff' }}
              centerComponent={{ text: 'Rocket League Stats App!', style: { color: '#fff' } }}
              rightComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
              style={{ alignSelf: 'stretch' }}
            />
            <ScrollView contentContainerStyle={styles.playerContainer}>
              <Text style={styles.userTitle}>Stats for: {this.state.singlePlayerData.UserName} </Text>

              <Text style={styles.title}>Play style: {"\n"}</Text>
              <VictoryPie
                height={300}
                width={450}
                theme={VictoryTheme.material}
                data={[
                  { x: "1", y: parseInt(this.state.singlePlayerData.Wins), label: "Wins: " + this.state.singlePlayerData.Wins.toString() },
                  { x: "2", y: parseInt(this.state.singlePlayerData.Goals), label: "Goals: " + this.state.singlePlayerData.Goals.toString() },
                  { x: "3", y: parseInt(this.state.singlePlayerData.Mvps), label: "Mvp's: " + this.state.singlePlayerData.Mvps.toString() },
                  { x: "4", y: parseInt(this.state.singlePlayerData.Shots), label: "Shots: " + this.state.singlePlayerData.Shots.toString() },
                  { x: "5", y: parseInt(this.state.singlePlayerData.Saves), label: "Saves: " + this.state.singlePlayerData.Saves.toString() },
                  { x: "6", y: parseInt(this.state.singlePlayerData.Assists), label: "Assists: " + this.state.singlePlayerData.Assists.toString() }
                ]}
              />

              <Text>Goal/Shot % -  {totalPercentage}%</Text>
              <Text>MVP/Wins % -  {totalMvpWins}%</Text>

              <Text>Ranked data: </Text>

              <FlatList
                data={this.state.rankedData}
                renderItem={({ item }) => <Text>Season: {item.season} &nbsp;
                  <Text> 1 V 1: </Text>
                  <Text>Division: {item.singles.division}</Text>
                  <Text>Matches played: {item.singles.matchesPlayed}</Text>
                  <Text>Rank points: {item.singles.rankPoints} </Text>
                  <Text>Tier: {item.singles.tier}</Text>

                  <Text> 2 V 2: </Text>
                  <Text>Division: {item.doubles.division}</Text>
                  <Text>Matches played: {item.doubles.matchesPlayed}</Text>
                  <Text>Rank points: {item.doubles.rankPoints} </Text>
                  <Text>Tier: {item.doubles.tier}</Text>

                  <Text> 3 V 3: </Text>
                  <Text>Division: {item.triples.division}</Text>
                  <Text>Matches played: {item.triples.matchesPlayed}</Text>
                  <Text>Rank points: {item.triples.rankPoints} </Text>
                  <Text>Tier: {item.triples.tier}</Text>
                </Text>
                }
              />
            </ScrollView>
          </View>

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
                    "UserName": item.username,
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







