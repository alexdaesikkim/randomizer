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
      game_title: '',
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
      song_state: [],
      orig_list: [],
      undo_list: [],
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
          var styles = game_data.games[g].styles
          if(styles.length > 1 && styles[styles.length-1] !== "all") styles.push("all");
          this.setState({
            game_name: game,
            game_title: '',
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
            versions: Object.keys(game_data.games[g].versions),
            songs: []
          })
        }
      }
    }
  },

  changeVersion(event){
    var version = event.target.value;
    for(var x = 0; x < this.state.versions.length; x++){
      var v = this.state.versions[x];
      if(v === version){
        var game_title = game_data.games[this.state.game_name].name + " " + game_data.games[this.state.game_name].versions[v].name;
        var builds = game_data.games[this.state.game_name].versions[v].builds;
        builds.sort(function(a, b){
          return(b-a);
        })
        var build_name = builds[0]+"(Current)";
        this.setState({
          game_title: game_title,
          version_name: version,
          builds: builds,
          build_name: build_name,
          styles: game_data.games[this.state.game_name].styles,
          style: this.state.styles[0],
          game_limits:{
            min_level: game_data.games[this.state.game_name].versions[v].level.min,
            max_level: game_data.games[this.state.game_name].versions[v].level.max,
            min_diff: game_data.games[this.state.game_name].versions[v].difficulty.min,
            max_diff: game_data.games[this.state.game_name].versions[v].difficulty.max
          },
          min_level: game_data.games[this.state.game_name].versions[v].level.min,
          max_level: game_data.games[this.state.game_name].versions[v].level.max,
          min_diff: game_data.games[this.state.game_name].versions[v].difficulty.min,
          max_diff: game_data.games[this.state.game_name].versions[v].difficulty.max,
          diff_list: game_data.games[this.state.game_name].versions[v].difficulty.list,
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
    console.log("triggered");
    console.log(parseInt(event.target.value, 10))
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
        for(var i = 0; i < raw_songs.length; i++){
          var object = {
            id: i,
            name: raw_songs[i].title,
            artist: raw_songs[i].artist,
            bpm: raw_songs[i].bpm,
            genre: raw_songs[i].genre,
            source: raw_songs[i].source,
            level: raw_songs[i].level,
            style: raw_songs[i].style,
            difficulty: raw_songs[i].difficulty,
            version: raw_songs[i].version,
            active: true
          }
          songs.push(object);
        }

        that.setState({
          songs: songs,
          orig_songs: songs,
          panel: false,
          undo_songs: [],
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
      var version_name = obj.toUpperCase();
      return(
        <option value={obj} key={"versionselect_" + obj}>{version_name}</option>
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

    //need to work on disabling some buttons again
    return(
      <div className="row">
        <Input s={6} m={3} type='select' label="Game" onChange={this.changeGame}>
          <option value="" key={"gaemselect_default"} disabled selected>Select Game</option>
          {games}
        </Input>
        <Input s={6} m={3} type='select' label="Version" onChange={this.changeVersion}>
          <option value="" key={"versionselect_default"} disabled selected>Select Version</option>
          {versions}
        </Input>
        <Input s={6} m={3} type='select' label="Build" onChange={this.changeBuild}>
          {builds}
        </Input>
        <Input s={6} m={3} type='select' label="Style" onChange={this.changeStyle}>
          {styles}
        </Input>
      </div>
    );

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

  displayLevelForm(){
    if(this.state.version_name !== ''){
      var that = this;
      var levels = [];
      for(var i = 0; i < this.state.game_limits.max_level; i++){
        levels.push(i+1);
      }

      var min_level_dropdown = levels.map(function(l){
        return(
          <option value={l} key={"min_level_" + l}>{l}</option>
        )
      })

      var max_level_dropdown = levels.map(function(l){
        return(
          <option value={l} key={"max_level_"+l}>{l}</option>
        )
      })
      var diffs = [];
      for(var i = 0; i < this.state.game_limits.max_diff+1; i++){
        diffs.push(i);
      }

      var min_diff_dropdown = diffs.map(function(d){
        return(
          <option value={d} key={"min_diff_" + d}>{that.state.diff_list[parseInt(d, 10)]}</option>
        )
      })

      var max_diff_dropdown = diffs.map(function(d){
        return(
          <option value={d} key={"max_diff_" + d}>{that.state.diff_list[parseInt(d, 10)]}</option>
        )
      })

      return(
        <div>
          <div className="row">
            <Input s={6} m={3} label="Min Level" type='select' defaultValue={this.state.min_level} onChange={this.changeMinLevel}>
              {min_level_dropdown}
            </Input>
            <Input s={6} m={3} label="Max Level" type='select' defaultValue={this.state.max_level} onChange={this.changeMaxLevel}>
              {max_level_dropdown}
            </Input>
            <Input s={6} m={3} label="Min Difficulty" type='select' defaultValue={this.state.min_diff} onChange={this.changeMinDifficulty}>
              {min_diff_dropdown}
            </Input>
            <Input s={6} m={3} label="Max Difficulty" type='select' defaultValue={this.state.max_diff} onChange={this.changeMaxDifficulty}>
              {max_diff_dropdown}
            </Input>
          </div>
          <div className="row">
          </div>
          <div className="row justify-content-center">
            <div className="col s12">
              Number of Songs:
              <input type="number" className="form-control" value={this.state.song_num} onChange={this.changeSongNum}></input>
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
  //undo
  undoBans(){

  },
  //hacky way at the moment since original code+design doesn't make way for pretty way of fixing at the moment
  resetSongList(){
    this.setState({
      songs: this.state.orig_songs
    })
  },

  resetSongs(){
    this.setState({
      songs: []
    }, this.resetSongList)
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
            <a className="waves-effect waves-light btn disabled">Undo Ban</a>
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
        <Song song={obj} game={that.state.game_name} key={obj.name + "_" + obj.difficulty} />
      )
    })
    return (
      <div>
        <header className="Top-panel">
          <div className="container">
            {this.displayTopPanel()}
          </div>
        </header>
        <div className="Form-panel">
          <div className="container">
            <div className="row">
              <h3>{this.state.game_title}</h3>
            </div>
            {this.topPanelToggle()}
          </div>
        </div>
        <div className="Song-container center">
          {song_cards}
        </div>
        <br/>
      </div>
    );
  }
});

var Song = createReactClass({
  getInitialState(){
    return{
      game: this.props.game,
      class: this.props.song.card_class,
      active: this.props.song.active
    }
  },

  diff_return(difficulty){
    var diff_string = "";
    var class_name = "card-";
    switch(difficulty){
        case 0:
          if(this.props.game === 'ddr') {
            diff_string = "Beginner";
            class_name += "blue";
          }
          if(this.props.game === 'iidx') {
            diff_string = "Beginner";
            class_name += "green";
          }
        break;
        case 1:
          if(this.props.game === 'ddr') {
            diff_string = "Basic";
            class_name += "yellow";
          }
          if(this.props.game === 'iidx') {
            diff_string = "Normal";
            class_name += "blue";
          }
          if(this.props.game === 'jubeat') {
            diff_string = "Basic";
            class_name += "green";
          }
        break;
        case 2:
          if(this.props.game === 'ddr') {
            diff_string = "Difficult";
            class_name += "red";
          }
          if(this.props.game === 'iidx') {
            diff_string = "Hyper";
            class_name += "yellow";
          }
          if(this.props.game === 'jubeat') {
            diff_string = "Advanced";
            class_name += "yellow";
          }
        break;
        case 3:
          if(this.props.game === 'ddr') {
            diff_string = "Heavy";
            class_name += "green";
          }
          if(this.props.game === 'iidx') {
            diff_string = "Another";
            class_name += "red";
          }
          if(this.props.game === 'jubeat') {
            diff_string = "Extreme";
            class_name += "red";
          }
        break;
        default:
          if(this.props.game === 'ddr') {
            diff_string = "Challenge";
            class_name += "purple";
          }
          if(this.props.game === 'iidx') {
            diff_string = "Black Another";
            class_name += "darkred";
          }
        break;
    }
    var object = {
      diff_string: diff_string,
      class_name: class_name,
    }
    return object;
  },

  changeActiveClass(){
    this.setState({
      active: !this.state.active
    })
  },

  render() {
    var object = this.diff_return(this.props.song.difficulty);
    var difficulty = object.diff_string;
    var card_class = object.class_name;
    var url = "https://www.google.com/search?q=" + this.props.song.name + "+" + this.props.song.version
    var style = this.props.song.style.charAt(0).toUpperCase() + this.props.song.style.slice(1);

    if(this.state.active){
      return (
        <div className={"Song-card " + card_class}>
          <h5>{this.props.song.name}</h5>
          <h6>{this.props.song.artist}</h6>
          <h6>{style + " " + difficulty + " " + this.props.song.level}</h6>
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
    else{
      return (
        <div className={"Song-card card-out"}>
        </div>
      );
    }
  }
});

export default Random;
