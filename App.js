import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, View, Alert, Button, Image, ReactDOM, SectionList, FlatList, StyleSheet, ScrollView, Modal, TouchableHighlight, Linking } from 'react-native';
import { List, ListItem, Avatar, Header, ButtonGroup, CheckBox, Badge } from "react-native-elements";
import { VictoryBar, VictoryLabel, VictoryTheme, VictoryPie } from "victory-native";



class userObj {
  //so that when we have multiple users, we can have an object for each user. Means we can print them out in a list.
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
  //ranked data per season
  constructor(season, playlist, matchesPlayed, tier, ranked, division) {
    this.season = season;
    this.playlist = playlist;
    this.matchesPlayed = matchesPlayed;
    this.tier = tier;
    this.ranked = ranked;
    this.division = division;
  }
}


export default class GetUsername extends Component {
  constructor(props) {
    super(props);
    //the states used throughout the app
    this.state = {
      text: '',
      display: false,
      length: '',
      username: '',
      singlePlayerData: {},
      multipleData: [],
      menu: '',
      selectedIndex: 0,
      stat: '',
      rankedData: [],
      showStats: false,
      haveRanked: false,

      //modal box
      modalVisible: false,

    };
    //bind this so we can call these anywhere
    this.SearchForUser = this.SearchForUser.bind(this);
    this.getUserFromID = this.getUserFromID.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
  }

  async SearchForUser(userName) {
    if (userName != null || userName != undefined || userName != "") {

      //set the parameters for the fetch
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


        if (length === 1) {
          //get user details and some basic stats

          //try/catches for fields that might be null, stats will just be 0 rather than null.
          let avatar;
          let platform;
          let profileURL;

          try {
            avatar = resJSON.data[0].avatar;
          }
          catch (e) {
            avatar = "";
          }
          try {
            platform = resJSON.data[0].platform.name;
          }
          catch (e) {
            platform = "";
          }
          try {
            profileURL = resJSON.data[0].profileUrl;
          }
          catch (e) {
            profileURL = "";
          }

          let dataObj = {
            "id": resJSON.data[0].uniqueId,
            "UserName": resJSON.data[0].displayName,
            "Avatar": avatar,
            "Platform": platform,
            "Wins": resJSON.data[0].stats.wins,
            "Goals": resJSON.data[0].stats.goals,
            "Mvps": resJSON.data[0].stats.mvps,
            "Saves": resJSON.data[0].stats.saves,
            "Shots": resJSON.data[0].stats.shots,
            "Assists": resJSON.data[0].stats.assists,
            "ProfileUrl": profileURL,
            "SignatureUrl": resJSON.data[0].signatureUrl
          }

          let rankedData = [];
          //get data from season 6 - season 8
          for (let i = 6; i < 9; i++) {
            let seasonKeys;
            try {
              //get the keys to see if the user has taken part in any ranked seasons
              seasonKeys = Object.keys(resJSON.data[0].rankedSeasons[i]);
            }
            catch (e) {
              //console.log("caught!");
              continue; //skip to the next iteration  - the user hasnt taken part in any ranked matches for this season
            }

            /*
            * 11 = singles
            * 12 = doubles
            * 13 = triples
            */

            //check what exists in the array
            let singlesPos = seasonKeys.indexOf("11");
            let doublePos = seasonKeys.indexOf("12");
            let triplePos = seasonKeys.indexOf("13");

            //if the user has played singles matches, get the ranked data for it and push it into our array
            if (singlesPos != -1 && resJSON.data[0].rankedSeasons[i][11].matchesPlayed > 0) {
              rankedData.push(new seasonData(i, "Singles", resJSON.data[0].rankedSeasons[i][11].matchesPlayed, this.getTierName(resJSON.data[0].rankedSeasons[i][11].tier), resJSON.data[0].rankedSeasons[i][11].rankPoints, resJSON.data[0].rankedSeasons[i][11].division));
            }

            if (doublePos != -1 && resJSON.data[0].rankedSeasons[i][12].matchesPlayed > 0) {
              rankedData.push(new seasonData(i, "Doubles", resJSON.data[0].rankedSeasons[i][12].matchesPlayed, this.getTierName(resJSON.data[0].rankedSeasons[i][12].tier), resJSON.data[0].rankedSeasons[i][12].rankPoints, resJSON.data[0].rankedSeasons[i][12].division));
            }

            if (triplePos != -1 && resJSON.data[0].rankedSeasons[i][13].matchesPlayed > 0) {
              rankedData.push(new seasonData(i, "Triples", resJSON.data[0].rankedSeasons[i][13].matchesPlayed, this.getTierName(resJSON.data[0].rankedSeasons[i][13].tier), resJSON.data[0].rankedSeasons[i][13].rankPoints, resJSON.data[0].rankedSeasons[i][13].division));
            }

          }
          //once we have all the data we need, set the state which will call the main render function. So we can display our data.
          this.setState({ display: true, length: length++, username: userName, singlePlayerData: dataObj, rankedData: rankedData });
        }

        else if (length > 1) {
          //if we have more than one result for this username, get all the users and put them into a list so that the user can select themself
          let allUsers = [];
          for (let i = 0; i < length; i++) {
            let avatar;
            let profileUrl;
            let platform;
            //handle these if they are null
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
            //get the rest of the data for each user and push it into our array
            let id = resJSON.data[i].uniqueId;
            let wins = resJSON.data[i].stats.wins;
            let goals = resJSON.data[i].stats.goals;
            let mvps = resJSON.data[i].stats.mvps;
            let saves = resJSON.data[i].stats.saves;
            let shots = resJSON.data[i].stats.shots;
            let assists = resJSON.data[i].stats.assists;
            let signatureUrl = resJSON.data[i].signatureUrl;
            //needs to be in this object so we can use the flatlist component
            let user = new userObj(userName, avatar, platform, profileUrl, id, wins, goals, mvps, saves, assists, signatureUrl, shots);
            allUsers.push(user);
          }
          //once we're done, render everything.
          this.setState({ display: "Multiple", multipleData: allUsers })
        }
        else {
          //tell the user we cant find them
          this.setState({ display: "Not found", userName: "User: " + userName + " not found." });
        }

        getTierName(tierID) {
          //feed an ID in, get the tier name back out. 
          switch (tierID) {
            case 0:
              return "Unranked";
            case 1:
              return "Bronze I";
            case 2:
              return "Bronze II";
            case 3:
              return "Bronze III";
            case 4:
              return "Silver I";
            case 5:
              return "Silver II";
            case 6:
              return "Silver III";
            case 7:
              return "Gold I";
            case 8:
              return "Gold II";
            case 9:
              return "Gold III";
            case 10:
              return "Platinum I";
            case 11:
              return "Platinum II";
            case 12:
              return "Platinum III";
            case 13:
              return "Diamond I";
            case 14:
              return "Diamond II";
            case 15:
              return "Diamond III";
            case 16:
              return "Champion I";
            case 17:
              return "Champion II";
            case 18:
              return "Champion III";
            case 19:
              return "Grand Champion";
          }
        }

        async getUserFromID(userId) {
          this.setState({ modalVisible: true }); //let the user know whats going on

          let obj = {
            method: "GET",
            headers: {
              Accept: "Application/json",
              Authorization: "JB2J33D8O694771DF5OOWMSMLYM7WXM2"
            }
          }

          let userData = await fetch("https://api.rocketleaguestats.com/v1/player?unique_id=" + userId + "&platform_id=1", obj);
          let userJSON = await userData.json();
          let platform;
          let profileURL;
          let avatar;
          //handle nulls
          try {
            platform = userJSON.platform.name
          }
          catch (e) {
            platform = "";
          }
          try {
            profileURL = userJSON.profileUrl;
          }
          catch (e) {
            profileURL = "";
          }
          try {
            avatar = userJSON.avatar;
          }
          catch (e) {
            avatar = "";
          }
          let dataObj = {
            "id": userJSON.uniqueId,
            "UserName": userJSON.displayName,
            "Avatar": avatar,
            "Platform": platform,
            "Wins": userJSON.stats.wins,
            "Goals": userJSON.stats.goals,
            "Mvps": userJSON.stats.mvps,
            "Saves": userJSON.stats.saves,
            "Shots": userJSON.stats.shots,
            "Assists": userJSON.stats.assists,
            "ProfileUrl": profileURL,
            "SignatureUrl": userJSON.signatureUrl
          }
          let userName = userJSON.displayName;
          let rankedData = [];

          //get ranked data if we have any
          for (let i = 6; i < 9; i++) {
            let seasonKeys;
            try {
              seasonKeys = Object.keys(userJSON.rankedSeasons[i]);
            }
            catch (e) {
              //console.log("caught!");
              continue; //skip to the next iteration
            }

            //check what exists in the array
            let singlesPos = seasonKeys.indexOf("11");
            let doublePos = seasonKeys.indexOf("12");
            let triplePos = seasonKeys.indexOf("13");

            //if we have single date, go get it!
            if (singlesPos != -1 && userJSON.rankedSeasons[i][11].matchesPlayed > 0) {
              rankedData.push(new seasonData(i, "Singles", userJSON.rankedSeasons[i][11].matchesPlayed, this.getTierName(userJSON.rankedSeasons[i][11].tier), userJSON.rankedSeasons[i][11].rankPoints, userJSON.rankedSeasons[i][11].division));
            }

            if (doublePos != -1 && userJSON.rankedSeasons[i][12].matchesPlayed > 0) {
              rankedData.push(new seasonData(i, "Doubles", userJSON.rankedSeasons[i][12].matchesPlayed, this.getTierName(userJSON.rankedSeasons[i][12].tier), userJSON.rankedSeasons[i][12].rankPoints, userJSON.rankedSeasons[i][12].division));
            }

            if (triplePos != -1 && userJSON.rankedSeasons[i][13].matchesPlayed > 0) {
              rankedData.push(new seasonData(i, "Triples", userJSON.rankedSeasons[i][13].matchesPlayed, this.getTierName(userJSON.rankedSeasons[i][13].tier), userJSON.rankedSeasons[i][13].rankPoints, userJSON.rankedSeasons[i][13].division));
            }
          }
          //set the state once everything is done
          this.setState({ display: true, username: userName, singlePlayerData: dataObj, rankedData: rankedData, modalVisible: false });
        }

        async getTopStats(index) {
          let statToFind;
          //work out what the selected index of the tab actually means.
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

          let obj = {
            method: "GET",
            headers: {
              Accept: "Application/json",
              Authorization: "JB2J33D8O694771DF5OOWMSMLYM7WXM2"
            }
          }
          //go and get the stat leaderboard based on which tab the user selected
          let mvp = await fetch("https://api.rocketleaguestats.com/v1/leaderboard/stat?type=" + statToFind, obj);
          let mvpJSON = await mvp.json();

          let allUsers = [];
          let avatar;
          let profileUrl;
          let platform;

          //Just display the top 100
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
            //put everything into the format we need for the flatlist
            let user = new userObj(userName, avatar, platform, profileUrl, id, wins, goals, mvps, saves, assists, signatureUrl, shots);
            allUsers.push(user);
          }
          this.setState({ display: false, multipleData: allUsers })
        }


        updateIndex(selectedIndex) {
          //update the selected index for the stat tabs
          this.setState({ multipleData: [] });
          this.setState({ selectedIndex });
          this.setState({ showStats: true });
          this.getTopStats(selectedIndex);
        }

        render() {
          //disable warnings as they are from external libraries we are using (react native elements, victory pie);
          console.disableYellowBox = true;

          const buttons = ["Mvps", "Goals", "Wins", "Shots", "Saves", "Assists"]; //stat leaderboard buttons

          //css for the rendered elements
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
            },
            label: {
              fontWeight: 'bold'
            },
            menuLeft: {

            },
            head: { height: 40, backgroundColor: '#f1f8ff' },
            text: { margin: 6 },
            h1: {
              fontSize: 30,
              fontWeight: 'bold',
              fontFamily: 'sans-serif-thin',
            },
            h2: {
              fontSize: 25,
              fontWeight: 'bold',
              fontFamily: 'sans-serif-thin',
            },
            h3: {
              fontSize: 18,
              fontWeight: '200',
              fontFamily: 'sans-serif-thin',
            },
            Image: {
              flex: 1,
              width: 400,
              height: 150,
              resizeMode: 'contain'
            },
            modal: {
              justifyContent: 'center',
              alignItems: 'center',
            },
            link: {
              color: '#191970',
              textDecorationLine: 'underline',
              fontWeight: '200',
              fontFamily: 'sans-serif-thin',
              paddingTop: 10,
            }



          });

          if (this.state.display === false && this.state.showStats === false) {
            return (
              <View style={{}}>
                <Header
                  placement="left"
                  leftComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
                  centerComponent={{ text: 'Rocket League Stats', style: { color: '#fff' } }}
                  style={{ alignSelf: 'stretch' }}
                />

                <Text style={styles.h2}>Enter username or steam id:</Text>
                <TextInput style={{ height: 60, width: 350 }} placeholder="Enter username or id here." onChangeText={(text) => this.setState({ text })} />
                <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />

                <Text>{"\n"}</Text>
                <Button
                  onPress={() => this.updateIndex(this.state.selectedIndex)}
                  title="Show stat leaderboard"
                />

                <Modal style={styles.modal}
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    alert('Modal has been closed.');
                  }}>
                  <View style={{ marginTop: 22 }}>
                    <View style={styles.modal}>
                      <Image source={require('./loader.gif')} />
                      <Text style={styles.h3}>Fetching Data...</Text>
                    </View>
                  </View>
                </Modal>
                <TouchableHighlight onPress={() => Linking.openURL('http://documentation.rocketleaguestats.com/')}>
                  <Text style={styles.link}>Rocket League API provided by Rocket League Stats</Text>
                </TouchableHighlight>
              </View>

            );
          }

          if (this.state.display === false && this.state.showStats === true) {
            return (

              <View style={{}}>

                <Header
                  placement="left"
                  leftComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
                  centerComponent={{ text: 'Rocket League Stats', style: { color: '#fff' } }}
                  style={{ alignSelf: 'stretch' }}
                />



                <Text style={styles.title}>Enter username or steam id:</Text>
                <TextInput style={{ height: 40, width: 200 }} placeholder="Enter username or id here!" onChangeText={(text) => this.setState({ text })} />
                <Button title="Get Stats" color="#ADD8E6" onPress={() => this.SearchForUser(this.state.text)} />
                <Button title="Hide Leaderboard" onPress={() => this.setState({ display: false, showStats: false })} />
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
                        onPress={() => this.getUserFromID(item.id)}
                      />
                    )}
                    keyExtractor={item => item.id}
                  />
                </ List>

                <Modal style={styles.modal}
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    alert('Modal has been closed.');
                  }}>
                  <View style={{ marginTop: 22 }}>
                    <View style={styles.modal}>
                      <Image source={require('./loader.gif')} />
                      <Text style={styles.h3}>Fetching Data...</Text>
                    </View>
                  </View>
                </Modal>
                <TouchableHighlight onPress={() => Linking.openURL('http://documentation.rocketleaguestats.com/')}>
                  <Text style={styles.link}>Rocket League API provided by Rocket League Stats</Text>
                </TouchableHighlight>
              </View>
            );
          }
          if (this.state.display === true) {

            let goalToShot = parseInt(this.state.singlePlayerData.Goals) / parseInt(this.state.singlePlayerData.Shots);
            let totalPercentage = Math.round(goalToShot * 100);
            let mvpWins = parseInt(this.state.singlePlayerData.Mvps) / parseInt(this.state.singlePlayerData.Wins);
            let totalMvpWins = Math.round(mvpWins * 100);

            if (this.state.avatar == "") {
              let initials = this.state.username.slice(0, 2).toString();
              console.log("initials!");
              console.log(initials);
              return (
                <View>
                  <Header
                    placement="left"
                    leftComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
                    centerComponent={{ text: 'Rocket League Stats', style: { color: '#fff' } }}
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
                        { x: "1", y: parseInt(this.state.singlePlayerData.Wins), label: "Wins: " + "\n" + this.state.singlePlayerData.Wins.toString() },
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
                  <Modal style={styles.modal}
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                      alert('Modal has been closed.');
                    }}>
                    <View style={{ marginTop: 22 }}>
                      <View style={styles.modal}>
                        <Image source={require('./loader.gif')} />
                        <Text style={styles.h3}>Fetching Data...</Text>
                      </View>
                    </View>
                  </Modal>
                  <TouchableHighlight onPress={() => Linking.openURL('http://documentation.rocketleaguestats.com/')}>
                    <Text style={styles.link}>Rocket League API provided by Rocket League Stats</Text>
                  </TouchableHighlight>
                </View >

              );
            }

            else {
              let goalToShot = parseInt(this.state.singlePlayerData.Goals) / parseInt(this.state.singlePlayerData.Shots);
              let totalPercentage = Math.round(goalToShot * 100);
              let mvpWins = parseInt(this.state.singlePlayerData.Mvps) / parseInt(this.state.singlePlayerData.Wins);
              let totalMvpWins = Math.round(mvpWins * 100);
              console.log(this.state.singlePlayerData.Avatar);

              return (
                <ScrollView contentContainerStyle={styles.playerContainer}>
                  <Header
                    placement="left"
                    leftComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
                    centerComponent={{ text: 'Rocket League Stats', style: { color: '#fff' } }}
                    style={{ alignSelf: 'stretch' }}
                  />

                  <Text style={styles.h2}> <Image source={{ uri: this.state.singlePlayerData.Avatar }} style={{ width: 120, height: 120 }} /> {this.state.singlePlayerData.UserName} </Text>


                  <Text style={styles.h2}>Play style:</Text>
                  <VictoryPie
                    height={375}
                    padAngle={0.5}
                    width={400}
                    label={{ fontSize: "14" }}
                    innerRadius={75}
                    theme={VictoryTheme.material}
                    data={[
                      { x: "1", y: parseInt(this.state.singlePlayerData.Wins), label: "Wins: \n" + this.state.singlePlayerData.Wins.toString() },
                      { x: "2", y: parseInt(this.state.singlePlayerData.Goals), label: "Goals: \n " + this.state.singlePlayerData.Goals.toString() },
                      { x: "3", y: parseInt(this.state.singlePlayerData.Mvps), label: "Mvp's: \n" + this.state.singlePlayerData.Mvps.toString() },
                      { x: "4", y: parseInt(this.state.singlePlayerData.Shots), label: "Shots: \n" + this.state.singlePlayerData.Shots.toString() },
                      { x: "5", y: parseInt(this.state.singlePlayerData.Saves), label: "Saves: \n" + this.state.singlePlayerData.Saves.toString() },
                      { x: "6", y: parseInt(this.state.singlePlayerData.Assists), label: "Assists: \n" + this.state.singlePlayerData.Assists.toString() }
                    ]}
                  />

                  <Text style={styles.h3}>Shots converted into goals:  {totalPercentage}%</Text>
                  <Text style={styles.h3}>Percntage of wins where you are MVP: {totalMvpWins}%</Text>

                  <Text style={styles.h1}>Ranked data:</Text>
                  <List containerStyle={{ marginBottom: 20, }}>
                    <FlatList data={this.state.rankedData}
                      renderItem={({ item }) => (
                        <ListItem
                          hideChevron title={`${"Season: " + item.season}, ${"Playlist: " + item.playlist}, ${"Played: " + item.matchesPlayed}`}
                          subtitle={`${"Tier: " + item.tier}, ${"Rating: " + item.ranked}, ${"Division: " + item.division}`}
                        />
                      )}
                    />
                  </List>

                  <Image
                    style={styles.Image}
                    source={{ uri: this.state.singlePlayerData.SignatureUrl }}
                  />
                  <Modal style={styles.modal}
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                      alert('Modal has been closed.');
                    }}>
                    <View style={{ marginTop: 22 }}>
                      <View style={styles.modal}>
                        <Image source={require('./loader.gif')} />
                        <Text style={styles.h3}>Fetching Data...</Text>
                      </View>
                    </View>
                  </Modal>
                  <TouchableHighlight onPress={() => Linking.openURL('http://documentation.rocketleaguestats.com/')}>
                    <Text style={styles.link}>Rocket League API provided by Rocket League Stats</Text>
                  </TouchableHighlight>
                </ScrollView >
              );
            }
          }

          if (this.state.display === "Not found") {

            return (
              <View style={{}}>
                <Header
                  placement="left"
                  leftComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
                  centerComponent={{ text: 'Rocket League Stats', style: { color: '#fff' } }}
                  style={{ alignSelf: 'stretch' }}
                />


                <Text>User '{this.state.text}' not found. </Text>
                <Text>Try entering your steam id instead:</Text>
                <TextInput style={{ height: 40, width: 200 }} placeholder="Enter steam id" onChangeText={(text) => this.setState({ text })} />
                <Button title="Search using Steam ID" color="#FF0000" onPress={() => this.getUserFromID(this.state.text)} />
                <Modal style={styles.modal}
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    alert('Modal has been closed.');
                  }}>
                  <View style={{ marginTop: 22 }}>
                    <View style={styles.modal}>
                      <Image source={require('./loader.gif')} />
                      <Text style={styles.h3}>Fetching Data...</Text>
                    </View>
                  </View>
                </Modal>
                <TouchableHighlight onPress={() => Linking.openURL('http://documentation.rocketleaguestats.com/')}>
                  <Text style={styles.link}>Rocket League API provided by Rocket League Stats</Text>
                </TouchableHighlight>
              </View >
            );
          }
          if (this.state.display === "Multiple") {
            //display all in view with a button
            return (

              <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>

                <Header
                  placement="left"
                  leftComponent={{ icon: 'home', onPress: () => this.setState({ display: false }), color: '#fff' }}
                  centerComponent={{ text: 'Rocket League Stats', style: { color: '#fff' } }}
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
                      onPress={() => this.getUserFromID(item.id)}
                    />
                  )}
                  keyExtractor={item => item.id}
                />
                <Modal style={styles.modal}
                  animationType="slide"
                  transparent={false}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                    alert('Modal has been closed.');
                  }}>
                  <View style={{ marginTop: 22 }}>
                    <View style={styles.modal}>
                      <Image source={require('./loader.gif')} />
                      <Text style={styles.h3}>Fetching Data...</Text>
                    </View>
                  </View>
                </Modal>
                <TouchableHighlight onPress={() => Linking.openURL('http://documentation.rocketleaguestats.com/')}>
                  <Text style={styles.link}>Rocket League API provided by Rocket League Stats</Text>
                </TouchableHighlight>
              </ List>
            )
          }
        }
      }







