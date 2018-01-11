import React from 'react';
import './Random.css';
import $ from 'jquery';

var game_data = require('./game_data.json');

var createReactClass = require('create-react-class');

var Random = createReactClass({
  getInitialState(){
    return{
      option: false,
      game_title: '',
      game_name: '',
      games: Object.keys(game_data.games),
      version_name: '',
      versions: [],
      build_name: 'Current',
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
      style: '',
      styles: [],
      song_num: 1,
      na_option: false,
      north_america: false,
      songs: [],
      orig_songs: [],
      undo_songs: [],
      redo_songs: [],
      status: "",
      errors:{
        error_message: "",
        error_class: ""
      }
    }
  },

  changeGame(event){
    var game = event.target.id;
    console.log("hi");
    console.log(game);
    for(var x = 0; x < this.state.games.length; x++){
      var g = this.state.games[x];
      console.log(this.state.games[x]);
      console.log(g);
      if(g === game){
        var styles = game_data.games[g].styles
        if(styles.length > 1) styles.push("all");
        var game_name = game.toUpperCase();
        console.log(game_name)
        this.setState({
          game_name: game_name,
          versions: Object.keys(game_data.games[g].versions),
          styles: game_data.games[g].styles
        })
      }
    }
  },

  changeVersion(event){
    var version = event.target.id;
    for(var v in this.state.versions){
      if(v === version){
        this.setState({
          version_name: version,
          builds: Object.keys(game_data.games[this.state.game_name].versions[v].builds),
          game_limits:{
            min_level: game_data.games[this.state.game_name].versions[v].level.min,
            max_level: game_data.games[this.state.game_name].versions[v].level.max,
            min_diff: game_data.games[this.state.game_name].versions[v].difficulty.min,
            max_diff: game_data.games[this.state.game_name].versions[v].difficulty.max
          },
          na_option: game_data.games[this.state.game_name].versions[v].na_option,
        })
      }
    }
  },

  changeManualBox(){
    this.setState({
      manual: !this.state.manual
    })
  },

  changeMinLevel(event){
    this.setState({
      min_level: event.target.value
    })
  },

  changeMaxLevel(event){
    this.setState({
      max_level: event.target.value
    })
  },

  changeMinDifficulty(event){
    this.setState({
      min_diff: event.target.value
    })
  },

  changeMaxDifficulty(event){
    this.setState({
      max_diff: event.target.value
    })
  },

  changeSongNum(event){
    this.setState({
      song_num: event.target.value
    })
  },

  handleRandomCall(){
    var that = this;
    var query = {
      count: that.state.song_num,
      min: that.state.min_diff,
      max: that.state.max_diff,
      min_level: that.state.min_level,
      max_level: that.state.max_level,
      north_america: that.state.north_america,
    }
    console.log(query);
    $.ajax({
      url: '/get_random_song/' + that.state.song_num + "/" + that.state.min_level + "/" + that.state.max_level + "/" + that.state.min_diff + "/" + that.state.max_diff,
      method: 'GET',
      success: function(data){
        var songs = data.songs;
        console.log(data);
        songs = songs.map(function(obj){
          var object = {
            name: obj.title,
            artist: obj.artist,
            bpm: obj.bpm,
            genre: obj.genre,
            level: obj.level,
            difficulty: obj.difficulty,
            version: obj.version
          }
          return object;
        })
        that.setState({
          songs: songs,
          orig_songs: songs,
          undo_songs: [],
          redo_songs: [],
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

  displayGameButton(){
    var that = this
    var games = this.state.games.map(function(obj){
      var game_name = obj.toUpperCase();
      return(
        <li key={"gameselect_"+ obj}><a id={obj} onClick={that.changeGame}>{game_name}</a></li>
      )
    });

    return(
      <div>
        <a className='dropdown-button btn' data-activates='game1'>{this.state.game_name === "" ? "Select Game" : this.state.game_name}</a>

        <ul id='game1' className='dropdown-content'>
          {games}
        </ul>
      </div>
    )
  },

  displayVersionButton(){
    var that = this;
    var versions = this.state.versions.map(function(obj){
      var version_name = obj.toUpperCase();
      console.log(version_name);
      return(
        <li key={"versionselect_" + obj}><a id={obj} onClick={that.changeVersion}>{version_name}</a></li>
      )
    });

    return(
      <div>
        <a className='dropdown-button btn' data-activates='version1'>{this.state.version_name === "" ? "Select Version" : this.state.version_name}</a>

        <ul id='version1' className='dropdown-content'>
          {versions}
        </ul>
      </div>
    )
  },

  displayLevelForm(){
    return(
      //form for min_level
      <div>
        <div>
          <div className="row">
            <div className="col s6">
              Min Level:
              <input type="number" className="form-control" value={this.state.min_level} onChange={this.changeMinLevel}></input>
            </div>
            <div className="col s6">
              Max Level:
              <input type="number" className="form-control" value={this.state.max_level} onChange={this.changeMaxLevel}></input>
            </div>
          </div>
          <div className="row">
            <div className="col s6">
              Min Difficulty:
              <input type="number" className="form-control" value={this.state.min_diff} onChange={this.changeMinDifficulty}></input>
            </div>
            <div className="col s6">
              Max Difficulty:
              <input type="number" className="form-control" value={this.state.max_diff} onChange={this.changeMaxDifficulty}></input>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col s12">
            Number of Songs:
            <input type="number" className="form-control" value={this.state.song_num} onChange={this.changeSongNum}></input>
          </div>
        </div>
        <button className="btn btn-primary" onClick={this.handleRandomCall}>Submit</button>
      </div>
    );
  },

  render() {
    var song_cards = this.state.songs.map(function(obj){
      return(
        <Song song={obj} key={obj.name + "_" + obj.difficulty} />
      )
    })
    return (
      <div className="App">
        <header className="App-header">
          <div className="container">
            <br/>
              <h3>{this.state.game_name}</h3>
            <br/>
            <div className="row">
              <div className="col s12">
                <button className="waves-effect waves-light btn-large red" onClick={this.changeManualBox}>Manual</button>
              </div>
            </div>
            <div className="row">
              <div className="col s4">
                {this.displayGameButton()}
              </div>
              <div className="col s4">
                {this.displayVersionButton()}
              </div>
            </div>
            {this.displayLevelForm()}
            <br/>
          </div>
        </header>
        <div className="row align-center">
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
      class: this.props.song.card_class
    }
  },

  render() {
    var difficulty = "";
    if(this.props.song.difficulty === 0) difficulty = "Beginner";
    if(this.props.song.difficulty === 1) difficulty = "Normal";
    if(this.props.song.difficulty === 2) difficulty = "Hyper";
    if(this.props.song.difficulty === 3) difficulty = "Another";
    if(this.props.song.difficulty === 4) difficulty = "Black Another";

    return (
        <div className="col s4 offset-s4">
          <div className="card-body white">
            <div className="card-content align-center">
              <br/>
              <h3>{this.props.song.name}</h3>
              <h5>{this.props.song.artist}</h5>
              <h5>{difficulty + " " + this.props.song.level}</h5>
              <h7>{this.props.song.genre}</h7>
              <br/>
              <h7>{"BPM: " + this.props.song.bpm}</h7>
              <h6>{this.props.song.version}</h6>
              <br/>
            </div>
          </div>
        </div>
    );
  }
});

export default Random;
