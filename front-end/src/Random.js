import React from 'react';
import './Random.css';
import $ from 'jquery';
import {Input, Button, Icon} from 'react-materialize';

var game_data = require('./game_data.json');

var createReactClass = require('create-react-class');

var Random = createReactClass({
  getInitialState(){
    return{
      panel: true,
      game_title: 'Bemani Randomizer',
      game_name: '',
      games: Object.keys(game_data.games),
      version_name: '',
      versions: [],
      build_name: '',
      builds: [],
      game_limits:{
        min_level: 0,
        max_level: 0,
        min_diff: -1,
        max_diff: -1
      },
      min_level: 0,
      max_level: 0,
      min_diff: 0,
      max_diff: 0,
      diff_list: [],
      style: '',
      styles: [],
      song_num: 1,
      na_option: false,
      north_america: false,
      songs: [],
      undo_bans: [],
      status: "",
      errors:{
        error_message: "",
        error_class: ""
      }
    }
  },

  changeGame(event){
    var game = event.target.value;
    if(game !== ''){
      for(var x = 0; x < this.state.games.length; x++){
        var g = this.state.games[x];
        if(g === game){
          var styles = game_data.games[g].styles;
          var versions = Object.keys(game_data.games[g].versions);
          var version_list = [];
          for(var i = 0; i < versions.length; i++){
            var key = versions[i];
            var version = game_data.games[g].versions[key];
            var pair = [];
            pair.push(key);
            pair.push(version.name);
            version_list.push(pair);
          }
          version_list.reverse();
          if(styles.length > 1 && styles[styles.length-1] !== "all") styles.push("all");
          this.setState({
            game_name: game,
            game_title: 'Bemani Randomizer',
            version_name: '',
            build_name: '',
            builds: [],
            style: '',
            game_limits:{
              min_level: 0,
              max_level: 0,
              min_diff: -1,
              max_diff: -1
            },
            min_level: 0,
            max_level: 0,
            min_diff: 0,
            max_diff: 0,
            versions: version_list,
            songs: []
          })
        }
      }
    }
  },

  changeVersion(event){
    var version = event.target.value;
    for(var x = 0; x < this.state.versions.length; x++){
      var v = this.state.versions[x][0];
      if(v === version){
        var builds = game_data.games[this.state.game_name].versions[v].builds;
        builds = builds.sort().reverse(); //time consuming? but small array so shouldn't matter
        var build_name = builds[0];
        var diff_list = game_data.games[this.state.game_name].versions[v].difficulty.list
        if(this.state.game_name === 'sdvx' && version === 'iv') diff_list = ["Novice", "Advanced", "Exhaust", "Maximum", "INF/GRV/HVN"]
        var game_title = game_data.games[this.state.game_name].name + " " + game_data.games[this.state.game_name].versions[v].name;
        this.setState({
          version_name: version,
          builds: builds,
          build_name: build_name,
          styles: game_data.games[this.state.game_name].styles,
          style: game_data.games[this.state.game_name].styles[0],
          game_title: game_title,
          game_limits:{
            min_level: game_data.games[this.state.game_name].versions[v].level.min,
            max_level: game_data.games[this.state.game_name].versions[v].level.max,
            min_diff: game_data.games[this.state.game_name].versions[v].difficulty.min,
            max_diff: game_data.games[this.state.game_name].versions[v].difficulty.max
          },
          min_level: game_data.games[this.state.game_name].versions[v].level.min,
          max_level: game_data.games[this.state.game_name].versions[v].level.max,
          min_diff: game_data.games[this.state.game_name].versions[v].difficulty.min,
          diff_list: diff_list,
          max_diff: game_data.games[this.state.game_name].versions[v].difficulty.max,
          na_option: game_data.games[this.state.game_name].versions[v].na_option,
          panel: true
        })
      }
    }
  },

  errorCheck(){
    //do this to enable the submit button, instead of throwing errors
    //is it possible to have icon next to it for popup saying what's wrong?
    if(this.state.min_level > this.state.max_level){

    }
    if(this.state.min_level < this.state.game_limits.min_level){

    }
    if(this.state.max_level < this.state.game_limits.max_level){

    }
    if(this.state.min_diff > this.state.max_diff){

    }

  },

  changeBuild(event){
    var build = event.target.value;
    this.setState({
      build_name: build
    })
  },

  changeStyle(event){
    var style = event.target.value;
    this.setState({
      style: style
    })
  },

  changeMinLevel(event){
    this.setState({
      min_level: parseInt(event.target.value, 10)
    })
  },

  changeMaxLevel(event){
    this.setState({
      max_level: parseInt(event.target.value, 10)
    })
  },

  changeMinDifficulty(event){
    this.setState({
      min_diff: parseInt(event.target.value, 10)
    })
  },

  changeMaxDifficulty(event){
    this.setState({
      max_diff: parseInt(event.target.value, 10)
    })
  },

  changeSongNum(event){
    this.setState({
      song_num: parseInt(event.target.value, 10)
    })
  },

  changeNASettings(){
    this.setState({
      north_america: !this.state.north_america
    })
  },

  handleRandomCall(){
    var that = this;
    var build = this.state.build_name;
    if(build.endsWith("(Current)")){
      build = build.slice(0,-9);
    }
    var query = {
      count: that.state.song_num,
      build: build,
      min_difficulty: that.state.min_diff,
      max_difficulty: that.state.max_diff,
      min_level: that.state.min_level,
      max_level: that.state.max_level,
      style: that.state.style,
      north_america: that.state.north_america,
    }
    $.ajax({
      url: '/api/alpha/random/' + that.state.game_name + "/" + that.state.version_name + "/",
      method: 'GET',
      data: query,
      success: function(data){
        var raw_songs = data.songs;
        var songs = [];
        var styles = that.state.styles;
        for(var i = 0; i < raw_songs.length; i++){
          var style = styles.length == 1 ? "" : raw_songs[i].style;
          var object = {
            id: i,
            name: raw_songs[i].title,
            artist: raw_songs[i].artist,
            bpm: raw_songs[i].bpm,
            genre: raw_songs[i].genre,
            source: raw_songs[i].source,
            level: raw_songs[i].level,
            style: style,
            difficulty: raw_songs[i].difficulty,
            version: raw_songs[i].version,
            active: true
          }
          songs.push(object);
        }

        that.setState({
          songs: songs,
          panel: false,
          undo_bans: [],
          status: ""
        });
      },
      error: function(data){
        that.setState({
          error_message: "There was an error. Please try reloading the page or tweet @supernovamaniac for support",
          error_class: "alert-danger"
        })
      }
    })
  },

  displayTopPanel(){
    var that = this;
    var games = this.state.games.map(function(obj){
      var game_name = obj.toUpperCase();
      return(
        <option value={obj} key={"gameselect_"+obj}>{game_name}</option>
      )
    });
    var versions = this.state.versions.map(function(obj){
      var version_name = obj[1].toUpperCase();
      return(
        <option value={obj[0]} key={"versionselect_" + obj[0]}>{version_name}</option>
      )
    });
    var builds = this.state.builds.map(function(obj){
      var build = obj;
      if(build === game_data.games[that.state.game_name].versions[that.state.version_name].current){
        build = build + "(Current)";
      }
      return(
        <option value={obj} key={"buildselect_" + obj}>{build}</option>
      );
    });
    var styles = this.state.styles.map(function(obj){
      var style = obj.toUpperCase();
      return(
        <option value={obj} key={"styleselect_" + obj}>{style}</option>
      )
    });

    //need to work on version button (if done more than once, it doesn't change back to select version
    //since "" is only set with defaultvalue. see if there's a way to change its value onChange of game_name)
    if(this.state.panel){
      return(
        <div className="row">
          <Input s={6} m={3} type='select' label="Game" defaultValue={this.state.game_name === '' ? "" : this.state.game_name} onChange={this.changeGame}>
            <option value="" key={"gaemselect_default"} disabled>Select Game</option>
            {games}
          </Input>
          <Input s={6} m={3} type='select' label="Version" defaultValue={this.state.version_name === '' ? "" : this.state.version_name} onChange={this.changeVersion}>
            <option value="" key={"versionselect_default"} disabled>{this.state.game_name === '' ? "" : "Select Version"}</option>
            {versions}
          </Input>
          <Input s={6} m={3} type='select' label="Build" defaultValue={this.state.build_name === '' ? '' : this.state.build_name} onChange={this.changeBuild}>
            {builds}
          </Input>
          <Input s={6} m={3} type='select' label="Play Style" defaultValue={this.state.style === '' ? '' : this.state.style} onChange={this.changeStyle}>
            {styles}
          </Input>
        </div>
      );
    }
    else return null;

  },

  displaySubmitButton(){
    if(this.state.songs.length === 0){
      return(
        <div>
          <button className="btn btn-primary" onClick={this.handleRandomCall}>Grab Songs</button>
        </div>
      );
    }
    else return(
      <div>
        <button className="btn btn-primary" onClick={this.handleRandomCall}>Grab Songs</button>
        &ensp;&ensp;
        <button className="btn btn-primary" onClick={this.changePanelToggle}>Close Form</button>
      </div>
    );
  },

  displayNATab(){
    if(this.state.na_option){
      return(
        <Input name='na_option' type='checkbox' label='NA Ver' onChange={this.changeNASettings}/>
      )
    }
    else return(
      <Input name='na_option' type='checkbox' label='NA Ver' disabled='disabled'/>
    )
  },

  displayLevelForm(){
    if(this.state.version_name !== ''){
      var that = this;
      var levels = [];
      for(var i = 0; i < this.state.game_limits.max_level; i++){
        levels.push(i+1);
      };

      var min_level_dropdown = levels.map(function(l){
        return(
          <option value={l} key={"min_level_" + l}>{l}</option>
        )
      });

      var max_level_dropdown = levels.map(function(l){
        return(
          <option value={l} key={"max_level_"+l}>{l}</option>
        )
      });
      var diff_ids = [];
      var diff_names = [];
      for(var i = 0; i < this.state.diff_list.length; i++){
        diff_ids.push(i);
        diff_names.push(i);
      };
      //sdvx edgecase
      if(this.state.diff_list.length-1 !== this.state.game_limits.max_diff){
        diff_ids[diff_ids.length-1] = this.state.game_limits.max_diff;
      }

      var min_diff_dropdown = diff_names.map(function(d){
        return(
          <option value={d} key={"min_diff_" + d}>{that.state.diff_list[parseInt(d, 10)]}</option>
        )
      });

      var max_diff_dropdown = diff_names.map(function(d){
        return(
          <option value={diff_ids[d]} key={"max_diff_" + d}>{that.state.diff_list[parseInt(d, 10)]}</option>
        )
      });

      return(
        <div>
          <div className="row">
            <Input s={6} l={1} label="Min Lvl" type='select' defaultValue={this.state.min_level} onChange={this.changeMinLevel}>
              {min_level_dropdown}
            </Input>
            <Input s={6} l={1} label="Max Lvl" type='select' defaultValue={this.state.max_level} onChange={this.changeMaxLevel}>
              {max_level_dropdown}
            </Input>
            <Input s={6} l={3} label="Min Difficulty" type='select' defaultValue={this.state.min_diff} onChange={this.changeMinDifficulty}>
              {min_diff_dropdown}
            </Input>
            <Input s={6} l={3} label="Max Difficulty" type='select' defaultValue={this.state.max_diff} onChange={this.changeMaxDifficulty}>
              {max_diff_dropdown}
            </Input>
            <Input s={6} l={2} label="# of Songs" defaultValue={this.state.song_num} onChange={this.changeSongNum}></Input>
            <div className="col s6 l2">
              <br/>
              {this.displayNATab()}
            </div>
          </div>
          {this.displaySubmitButton()}
        </div>
      );
    }
    else return null;
  },

  //Toggle-Panel
  changePanelToggle(){
    this.setState({
      panel: !this.state.panel
    })
  },

  //changing props will change child value at the same time
  //NOT sure if this is react way of doing things. but in this case, it works
  undoBans(){
    if(this.state.undo_bans.length > 0){
      var songs = this.state.songs;
      var undos = this.state.undo_bans;
      var num = undos.pop();
      songs[num].active = true;
      this.setState({
        songs: songs,
        undo_bans: undos
      })
    }
  },

  handleBans(num){
    var songs = this.state.songs;
    songs[num].active = false;
    console.log(songs)
    var undos = this.state.undo_bans;
    undos.push(num);
    this.setState({
      songs: songs,
      undo_bans: undos
    })
  },

  resetSongs(){
    var songs = this.state.songs;
    songs.map(function(obj){
      obj.active = true;
      return obj;
    })
    this.setState({
      songs: songs,
      undo_bans: []
    })
  },

  topPanelToggle(){
    if(this.state.panel){
      return(
        <div>
          {this.displayLevelForm()}
          <br/>
        </div>
      );
    }
    else{
      return(
        <div>
          <div className="row">
            <a className="waves-effect waves-light btn blue" onClick={this.changePanelToggle}>Open Form</a>
            &ensp;
            <a className={"waves-effect waves-light btn " + (this.state.undo_bans.length > 0 ? "deep-orange darken-4" : "disabled")}
              onClick={this.undoBans}>{"Undo Ban (" + this.state.undo_bans.length + ")"}</a>
            &ensp;
            <a className="waves-effect waves-light btn" onClick={this.resetSongs}>Reset</a>
          </div>
          <br/>
        </div>
      )
    }
  },

  render() {
    var that = this;
    var song_cards = this.state.songs.map(function(obj){
      return(
        <Song song={obj} game={that.state.game_name} version={that.state.version_name} difficulties={game_data.games[that.state.game_name].versions[that.state.version_name].difficulty.list} ban = {that.handleBans} key={obj.name + "_" + obj.difficulty} />
      )
    })
    return (
      <div>
        <header>
          <nav className="black">
            <div className="container">
              <div className="nav-wrapper">
                <a href="#" className="brand-logo">Alpha Test</a>
                <ul id="nav-mobile" className="right hide-on-med-and-down">
                  <li><a href="sass.html">Randomizer</a></li>
                </ul>
              </div>
            </div>
          </nav>
        </header>
        <div>
          <div className="Form-panel">
            <div className="container">
              <div className="row">
                <text className="title-text">{this.state.game_title}</text>
              </div>
              {this.displayTopPanel()}
              {this.topPanelToggle()}
            </div>
          </div>
        </div>
        <div className="Song-container">
          {song_cards}
        </div>
        <br/>
      </div>
    );
  }
});

var Song = createReactClass({

  diff_return(difficulty){
    var diff_string = this.props.difficulties[difficulty];
    var class_name = "card-";
    var classes = []
    if(this.props.game === 'ddr') classes = ['blue', 'yellow', 'red', 'green', 'purple']
    if(this.props.game === 'iidx') classes = ['green', 'blue', 'yellow', 'red', 'darkred']
    if(this.props.game === 'sdvx') classes = ['purple', 'yellow', 'red', 'gray', 'pink', 'orange', 'lightblue']
    if(this.props.game === 'popn') classes = ['blue', 'green', 'yellow', 'red']
    if(this.props.game === 'rb') classes = ['green', 'yellow', 'red', 'white']
    if(this.props.game === 'museca') classes = ['green', 'yellow', 'red']
    if(this.props.game === 'gc') classes = ['blue', 'yellow', 'red', 'gray']
    if(this.props.game === 'jubeat') classes = ['green', 'yellow', 'red']
    class_name += classes[difficulty]
    var object = {
      diff_string: diff_string,
      class_name: class_name,
    }
    return object;
  },

  changeActiveClass(){
    this.props.ban(this.props.song.id);
  },

  render() {
    var object = this.diff_return(this.props.song.difficulty);
    var difficulty = object.diff_string;
    var card_class = object.class_name;
    var url = "https://www.google.com/search?q=" + this.props.song.name + "+" + this.props.song.version
    var style = this.props.song.style.charAt(0).toUpperCase() + this.props.song.style.slice(1);

    var card_class = this.props.song.active ? object.class_name : "Song-card card-out"
    return (
      <div className={"Song-card " + card_class}>
        <h5>{this.props.song.name}</h5>
        <h6>{this.props.song.artist}</h6>
        <h6>{style + " " + difficulty + " "} {this.props.song.level}</h6>
        <h6>{this.props.song.genre}</h6>
        <h6>{"BPM: " + this.props.song.bpm}</h6>
        <h6>{this.props.song.version}</h6>
        <div>
        <a href={url} target="_blank"><i className="small material-icons">search</i></a>
        &ensp;&ensp;
        <i className="small material-icons" onClick={this.changeActiveClass}>block</i>
        </div>
      </div>
    );
  }
});

export default Random;
