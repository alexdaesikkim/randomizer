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
    for(var x = 0; x < this.state.games.length; x++){
      var g = this.state.games[x];
      if(g === game){
        var styles = game_data.games[g].styles
        if(styles.length > 1) styles.push("all");
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
          styles: game_data.games[g].styles,
          songs: []
        })
      }
    }
  },

  changeVersion(event){
    var version = event.target.id;
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
          na_option: game_data.games[this.state.game_name].versions[v].na_option,
        })
      }
    }
  },

  changeBuild(event){
    var build = event.target.id;
    this.setState({
      build_name: build
    })
  },

  changeStyle(event){
    var style = event.target.id;
    this.setState({
      style: style
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
    var build = this.state.build_name;
    if(build.endsWith("(Current)")){
      build = build.slice(0,-9);
    }
    console.log(build);
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
      url: '/random/' + that.state.game_name + "/" + that.state.version_name + "/",
      method: 'GET',
      data: query,
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
      return(
        <li key={"versionselect_" + obj}><a id={obj} onClick={that.changeVersion}>{version_name}</a></li>
      )
    });

    return(
      <div>
        <a className={this.state.game_name === "" ? 'dropdown-button btn disabled' : 'dropdown-button btn'} data-activates='version1'>{this.state.version_name === "" ? "SELECT VERSION" : this.state.version_name}</a>

        <ul id='version1' className='dropdown-content'>
          {versions}
        </ul>
      </div>
    )
  },

  displayBuildButton(){
    var that = this;
    var builds = this.state.builds.map(function(obj){
      var build = obj;
      if(build === game_data.games[that.state.game_name].versions[that.state.version_name].current){
        build = build + "(Current)";
      }
      return(
        <li key={"buildselect_" + obj}><a id={obj} onClick={that.changeBuild}>{build}</a></li>
      );
    })
    return(
      <div>
        <a className={this.state.version_name === "" ? 'dropdown-button btn disabled' : 'dropdown-button btn'} data-activates='builds1'>{this.state.version_name === "" ? "BUILD" : this.state.build_name}</a>

        <ul id='builds1' className='dropdown-content'>
          {builds}
        </ul>
      </div>
    )
  },

  displayStyleButton(){
    var styles = this.state.styles.map(function(obj){
      var style = obj.toUpperCase();
      return(
        <li key={"styleselect_" + obj}><a id={obj}>{style}</a></li>
      )
    })

    return(
      <div>
        <a className={this.state.version_name === "" ? 'dropdown-button btn disabled' : 'dropdown-button btn'} data-activates='style1'>{this.state.version_name === "" ? "STYLE" : (this.state.style).toUpperCase()}</a>

        <ul id='style1' className='dropdown-content'>
          {styles}
        </ul>
      </div>
    )
  },

  displayLevelForm(){
    if(this.state.version_name !== ''){
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
          <button className="btn btn-primary" onClick={this.handleRandomCall}>Grab Songs</button>
        </div>
      );
    }
    else return null;
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
            <br/>
            <div className="row">
              <div className="col s3">
                {this.displayGameButton()}
              </div>
              <div className="col s3">
                {this.displayVersionButton()}
              </div>
              <div className="col s3">
                {this.displayBuildButton()}
              </div>
              <div className="col s3">
                {this.displayStyleButton()}
              </div>
            </div>
            <div className="row">
              <h3>{this.state.game_title}</h3>
            </div>
            {this.displayLevelForm()}
            <br/>
          </div>
        </header>
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
      class: this.props.song.card_class
      active: true;
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
      class_name: class_name
    }
    return object;
  },

  changeActiveClass(){
    this.setState({
      active: !active
    })
  }

  render() {
    var object = this.diff_return(this.props.song.difficulty);
    var difficulty = object.diff_string;
    var card_class = object.class_name;
    return (
      <div className={"Song-card " + card_class}>
        <h5>{this.props.song.name}</h5>
        <h6>{this.props.song.artist}</h6>
        <h6>{difficulty + " " + this.props.song.level}</h6>
        <h7>{this.props.song.genre}</h7>
        <br/>
        <h7>{"BPM: " + this.props.song.bpm}</h7>
        <br/>
        <h7>{this.props.song.version}</h7>
        <br/>
      </div>
    );
  }
});

export default Random;
