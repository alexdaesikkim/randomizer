import React from 'react';
import './Random.css';
import $ from 'jquery';
import {Input, Button, Modal} from 'react-materialize';

var createReactClass = require('create-react-class');

var Random = createReactClass({
  getInitialState(){
    /*
      things needed for next beta:
      1. weighted selection
      2. custom selection
      this.state.weight_list: list of weights. if option is true, this is used to select the diff first.
      this.state.weight_option: true if yes, false if no
    */
    return{
      game_data: [],
      panel: true,
      game_title: 'Loading...',
      game_name: '',
      games: [],
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
      card_draw: false,
      card_draw_panel: false,
      protect: false,
      protect_count: 2,
      cd_song_num: 0,
      cd_form_num: 1,
      cd_curr_num: 0,
      grabbed_songs: [],
      songs: [],
      bans: [],
      weight: false,
      weight_lvl: 0,
      weight_dist: [],
      tiebreaker: false,
      errors:{
        error_messages: [],
        error_class: "no-error"
      }
    }
  },

  componentDidMount(){
    var that = this;
    $.ajax({
      url: '/api/alpha/info/all',
      method: 'GET',
      success: function(data){
        that.setState({
          game_title: 'Randomizer',
          game_data: data,
          games: Object.keys(data.games)
        });
      },
      error: function(data){
        that.setState({
          errors:{
            error_messages: ["Please reload the page and try again. If error persists, please contact admin (could not connect to back-end)"],
            error_class: "form-error"
          }
        })
      }
    })
  },

  //weight_form

  weightCalculation(){
    var weights = this.state.weight_dist
    var total = 0;
    for(var x = 0; x < weights.length(); x++){
      total += weights[x];
    }
    var random_num = Math.floor(Math.random() * total);
    for(var y = 0; y < weights.length(); y++){
      if(random_num < 0){
        return y;
      }
    }
  },

  changeGame(event){
    var game = event.target.value;
    if(game !== ''){
      for(var x = 0; x < this.state.games.length; x++){
        var g = this.state.games[x];
        if(g === game){
          var styles = this.state.game_data.games[g].styles;
          var versions = Object.keys(this.state.game_data.games[g].versions);
          var version_list = [];
          for(var i = 0; i < versions.length; i++){
            var key = versions[i];
            var version = this.state.game_data.games[g].versions[key];
            var pair = [];
            pair.push(key);
            pair.push(version.name);
            version_list.push(pair);
          }
          version_list.reverse();
          if(styles.length > 1 && styles[styles.length-1] !== "all") styles.push("all");
          this.setState({
            game_name: game,
            game_title: 'Randomizer',
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
            card_draw: false,
            card_draw_panel: false,
            protect: false,
            cd_song_num: 0,
            cd_curr_num: 0,
            cd_form_num: 1,
            protect_count: 2,
            song_num: 1,
            versions: version_list,
            grabbed_songs: [],
            songs: [],
            bans: [],
            weight: false
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
        var builds = this.state.game_data.games[this.state.game_name].versions[v].builds;
        builds = builds.sort().reverse(); //time consuming? but small array so shouldn't matter
        var build_name = builds[0];
        var diff_list = this.state.game_data.games[this.state.game_name].versions[v].difficulty.list
        if(this.state.game_name === 'sdvx' && version === 'iv') diff_list = ["Novice", "Advanced", "Exhaust", "Maximum", "INF/GRV/HVN"]
        var game_title = this.state.game_data.games[this.state.game_name].name + " " + this.state.game_data.games[this.state.game_name].versions[v].name;
        this.setState({
          version_name: version,
          builds: builds,
          build_name: build_name,
          styles: this.state.game_data.games[this.state.game_name].styles,
          style: this.state.game_data.games[this.state.game_name].styles[0],
          game_title: game_title,
          game_limits:{
            min_level: this.state.game_data.games[this.state.game_name].versions[v].level.min,
            max_level: this.state.game_data.games[this.state.game_name].versions[v].level.max,
            min_diff: this.state.game_data.games[this.state.game_name].versions[v].difficulty.min,
            max_diff: this.state.game_data.games[this.state.game_name].versions[v].difficulty.max
          },
          min_level: this.state.game_data.games[this.state.game_name].versions[v].level.min,
          max_level: this.state.game_data.games[this.state.game_name].versions[v].level.max,
          min_diff: this.state.game_data.games[this.state.game_name].versions[v].difficulty.min,
          diff_list: diff_list,
          max_diff: this.state.game_data.games[this.state.game_name].versions[v].difficulty.max,
          na_option: this.state.game_data.games[this.state.game_name].versions[v].na_option,
          panel: true
        }, function(){
          this.changeWeightLimits()
        })
      }
    }
  },

  errorCheck(){
    var error_messages = []
    if(this.state.min_level > this.state.max_level){
      error_messages.push("Min level cannot be higher than max level")
    }
    if(this.state.min_level < this.state.game_limits.min_level){
      error_messages.push("Min level should not fall under the game's level range")
    }
    if(this.state.max_level > this.state.game_limits.max_level){
      error_messages.push("Max level should not exceed the game's level range")
    }
    if(this.state.min_level > this.state.game_limits.max_level){
      error_messages.push("Min level should not exceed the game's level range")
    }
    if(this.state.max_level < this.state.game_limits.min_level){
      error_messages.push("Max level should not fall under the game's level range")
    }
    if(this.state.min_diff > this.state.max_diff){
      error_messages.push("Min difficulty cannot be higher than max difficulty")
    }
    if(this.state.song_num > 100){
      if(this.state.song_num === 573) error_messages.push("Nice try")
      else error_messages.push("Exceeds the cap for number of songs to be grabbed (100)")
    }
    if(this.state.song_num <= 0){
      error_messages.push("Number of songs should be positive integer")
    }
    if(this.state.cd_form_num <= 0){
      error_messages.push("Number of songs to play should be positive integer")
    }
    if(this.state.song_num <= this.state.cd_form_num && this.state.card_draw){
      error_messages.push("Number of songs to play cannot exceed or equal the number of songs to be grabbed")
    }
    if(error_messages.length > 0){
      console.log(error_messages)
      this.setState({
        errors:{
          error_messages: error_messages,
          error_class: "form-error"
        }
      })
      return true;
    }
    return false;

  },

  changeWeightLimits(){
    var array_size = 1 + (this.state.max_level - this.state.min_level)
    var array = []
    for(var x = 0; x < array_size; x++){
      array.push(10);
    }
    this.setState({
      weight_dist: array
    })
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
    }, function(){
      this.changeWeightLimits()
    })
  },

  changeMaxLevel(event){
    this.setState({
      max_level: parseInt(event.target.value, 10)
    }, function(){
      this.changeWeightLimits()
    })
    //change the weight here
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

  changeCardDrawNum(event){
    this.setState({
      cd_form_num: parseInt(event.target.value, 10)
    })
  },

  changeNASettings(){
    this.setState({
      north_america: !this.state.north_america
    })
  },

  changeCardDrawSettings(){
    this.setState({
      card_draw: !this.state.card_draw
    })
  },

  changeProtectSettings(){
    this.setState({
      protect: !this.state.protect
    })
  },

  handleRandomCall(){
    if(!this.errorCheck()){
      var that = this;
      var build = this.state.build_name;
      if(build.endsWith("(Current)")){
        build = build.slice(0,-9);
      }
      var array = this.state.weight ? this.state.weight_dist : []
      var query = {
        count: that.state.song_num,
        build: build,
        min_difficulty: that.state.min_diff,
        max_difficulty: that.state.max_diff,
        min_level: that.state.min_level,
        max_level: that.state.max_level,
        style: that.state.style,
        north_america: that.state.north_america,
        weights: array
      }
      $.ajax({
        url: '/api/alpha/random/' + that.state.game_name + "/" + that.state.version_name + "/",
        method: 'GET',
        data: query,
        success: function(data){
          var raw_songs = data.songs;
          var grabbed_songs = [];
          var styles = that.state.styles;
          for(var i = 0; i < raw_songs.length; i++){
            var style = styles.length === 1 ? "" : raw_songs[i].style;
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
              protect: false,
              active: true
            }
            grabbed_songs.push(object);
          }

          that.setState({
            panel: false,
            bans: [],
            grabbed_songs: grabbed_songs,
            songs: [],
            cd_curr_num: grabbed_songs.length,
            card_draw_panel: that.state.card_draw,
            protect_count:that.state.protect ? 2 : 0,
            cd_song_num: that.state.cd_form_num,
            errors:{
              error_messages: [],
              error_class: "no-error"
            }
          });
        },
        error: function(data){
          that.setState({
            errors:{
              error_messages: [],
              error_class: "no-error"
            }
          })
        }
      })
    }
  },

  displayFormErrorPanel(){
    var errors = this.state.errors.error_messages.map(function(obj){
      return(
        <h6>-{obj}</h6>
      )
    })
    return(
      <div className={this.state.errors.error_class}>
        <div className="col s12 m6 offset-m3">
          <h5>{this.state.errors.error_messages.length} error(s) prevented the form from submitting</h5>
          {errors}
        </div>
      </div>
    )
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
      if(build === that.state.game_data.games[that.state.game_name].versions[that.state.version_name].current){
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
        <div>
          <div className="row">
            {this.displayFormErrorPanel()}
          </div>
          <div className="row">
            <Input s={6} m={3} type='select' label="Game" value={this.state.game_name === '' ? "" : this.state.game_name} onChange={this.changeGame}>
              <option value="" key={"gaemselect_default"} disabled>Select Game</option>
              {games}
            </Input>
            <Input s={6} m={3} type='select' label="Version" value={this.state.version_name === '' ? "" : this.state.version_name} disabled={this.state.game_name === '' ? true : false} onChange={this.changeVersion}>
              <option value="" key={"versionselect_default"} disabled>{this.state.game_name === '' ? "" : "Select Version"}</option>
              {versions}
            </Input>
            <Input s={6} m={3} type='select' label="Build" value={this.state.build_name === '' ? '' : this.state.build_name} disabled={this.state.build_name === '' ? true : false} onChange={this.changeBuild}>
              {builds}
            </Input>
            <Input s={6} m={3} type='select' label="Play Style" value={this.state.style === '' ? '' : this.state.style} disabled={this.state.style === '' ? true : false} onChange={this.changeStyle}>
              {styles}
            </Input>
          </div>
        </div>
      );
    }
    else return null;

  },

  displayDetailedOptionModal(){
    return(
      <Modal header='Advanced Options' trigger={<Button>Advanced Options</Button>}>
        <div className="row">
          <Input name='cd_option' type='checkbox' label='Card Draw' checked={this.state.card_draw} onChange={this.changeCardDrawSettings}></Input>
          <Input name='protect_option' type='checkbox' label='Protect 2 Songs' checked={this.state.protect} onChange={this.changeProtectSettings}></Input>
          <Input name='weight_option' type='checkbox' label='Use Weights' checked={this.state.weight} onChange={this.changeWeightSettings}></Input>
          {this.displayNATab()}
        </div>
        <div className="row">
          <Input s={6} l={2} type='number' label="# to Grab" defaultValue={this.state.song_num} value={this.state.song_num} onChange={this.changeSongNum}></Input>
          {this.displayCardDraw()}
        </div>
        <div className="row">
          {this.displayWeightForm()}
        </div>
      </Modal>
    )
  },

  displayWeightForm(){
    var forms = this.state.weight_dist.length;
    var array = this.state.weight_dist;
    var that = this;
    if(this.state.weight){
      var forms = array.map(function(value, index){
        return(
          <Input s={2} m={1} name={'weight_'+index} key={'key_'+index} id={index.toString()} label={"Lvl " + (index + that.state.min_level).toString()} onChange={that.changeWeight} defaultValue={value}></Input>
        )
      })
      return forms;
    }
    else{
      var forms = array.map(function(value, index){
        return(
            <Input s={2} m={1} name={'weight_'+index} key={'key_'+index} id={index.toString()} label={"Lvl " + (index + that.state.min_level).toString()} defaultValue={value} disabled></Input>
        )
      })
      return forms;
    };
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
        <Input name='na_option' type='checkbox' label='NA Ver' checked={this.state.north_america} onChange={this.changeNASettings}/>
      )
    }
    else return(
      <Input name='na_option' type='checkbox' label='NA Ver' disabled='disabled'/>
    )
  },

  displayCardDraw(){
    if(this.state.card_draw){
      return(
        <Input s={6} l={2} name='cd_num' type='number' defaultValue={this.state.cd_form_num} label='# to Play' onChange={this.changeCardDrawNum}></Input>
      )
    }
    else return(
      <Input s={6} l={2} name='cd_num' type='number' defaultValue={1} label='# to Play' disabled></Input>
    )
  },

  changeWeight(event){
    var array = this.state.weight_dist;
    console.log(event.target.id)
    array[parseInt(event.target.id, 10)] = parseInt(event.target.value, 10);
    this.setState({
      weight_dist: array
    })
  },


  changeWeightSettings(){
    this.setState({
      weight: !this.state.weight
    })
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
      for(var j = 0; j < this.state.diff_list.length; j++){
        diff_ids.push(j);
        diff_names.push(j);
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
            <Input s={6} l={2} label="Min Lvl" type='select' defaultValue={this.state.min_level} onChange={this.changeMinLevel}>
              {min_level_dropdown}
            </Input>
            <Input s={6} l={2} label="Max Lvl" type='select' defaultValue={this.state.max_level} onChange={this.changeMaxLevel}>
              {max_level_dropdown}
            </Input>
            <Input s={6} l={3} label="Min Diff" type='select' defaultValue={this.state.min_diff} onChange={this.changeMinDifficulty}>
              {min_diff_dropdown}
            </Input>
            <Input s={6} l={3} label="Max Diff" type='select' defaultValue={this.state.max_diff} onChange={this.changeMaxDifficulty}>
              {max_diff_dropdown}
            </Input>
            <Input s={6} l={2} type='number' label="# to Grab" defaultValue={this.state.song_num} value={this.state.song_num} onChange={this.changeSongNum}></Input>
          </div>
          <div className="row">
            {this.displayDetailedOptionModal()}
            {this.displaySubmitButton()}
          </div>
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

  undo(){
    if(this.state.protect === true){
      //case where protect phase is happening
      var grabbed_songs = this.state.grabbed_songs;
      var songs = this.state.songs;
      var song = songs.pop();
      grabbed_songs[song.id].protect = false;
      this.setState({
        grabbed_songs: grabbed_songs,
        songs: songs,
        protect_count: this.state.protect_count + 1
      })
    }
    else if(this.state.bans.length > 0){
      var grabbed_songs = this.state.grabbed_songs;
      var bans = this.state.bans;
      var num = bans.pop();
      grabbed_songs[num].active = true;
      this.setState({
        grabbed_songs: grabbed_songs,
        bans: bans,
        cd_curr_num: this.state.cd_curr_num+1,
        card_draw_panel: true
      });
    }
  },

  handleReDraw(num){
    var grabbed_songs = this.state.grabbed_songs;
    var song = grabbed_songs[num];
  },

  handleProtect(num){
    var grabbed_songs = this.state.grabbed_songs;
    grabbed_songs[num].protect = true;
    grabbed_songs[num].active = false;
    var songs = this.state.songs;
    var song = Object.assign({}, grabbed_songs[num]);
    song.active = true;
    songs.push(song);
    var protect_count = this.state.protect_count-1;
    this.setState({
      grabbed_songs: grabbed_songs,
      songs: songs,
      protect_count: protect_count
    })
  },

  handleBans(num){
    var grabbed_songs = this.state.grabbed_songs;
    var songs = this.state.songs;
    grabbed_songs[num].active = false;
    var bans = this.state.bans;
    bans.push(num);
    var cd_curr_num = this.state.cd_curr_num-1;
    if(cd_curr_num === this.state.cd_song_num){
      for(var x = 0; x < grabbed_songs.length; x++){
        if(grabbed_songs[x].active === true){
          var song = Object.assign({}, grabbed_songs[x]);
          songs.push(song);
          grabbed_songs[x].active = false;
        }
      }
    }
    this.setState({
      grabbed_songs: grabbed_songs,
      songs: songs,
      bans: bans,
      cd_curr_num: cd_curr_num,
      card_draw_panel: !(cd_curr_num === this.state.cd_song_num)
    })
  },

  resetSongs(){
    var grabbed_songs = this.state.grabbed_songs;
    grabbed_songs.map(function(obj){
      obj.active = true;
      obj.protect = false;
      return obj;
    })
    var songs = [];
    this.setState({
      songs: songs,
      grabbed_songs: grabbed_songs,
      bans: [],
      cd_curr_num: songs.length,
      protect_count: (this.state.protect ? 2 : 0),
      card_draw_panel: true
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
          <div>
            <button className="btn btn-primary" onClick={this.changePanelToggle}>Open Form</button>
          </div>
          <br/>
        </div>
      )
    }
  },

  menuButton(){
      if(!this.state.panel){
        return(
          <div>
            <Button floating fab='horizontal' fabClickOnly={true} icon='menu' className='gray' large style={{bottom: '25px', right: '25px'}}>
              <Button floating icon='undo' className={this.state.songs.length > 0 ? "deep-orange darken-4" : "disabled"} onClick={this.undo}/>
              <Button floating icon='replay' className={this.state.songs.length > 0 ? "blue" : "disabled"} onClick={this.resetSongs}/>
            </Button>
          </div>
        )
      }
  },

  protectPanel(){
    return(
      <div className="Protect-panel">
        <h4>Protect Phase</h4>
        <h5>{(this.state.protect_count) + " more song(s) to protect"}</h5>
      </div>
    )
  },

  banPanel(){
      return(
            <div className={"Ban-panel"}>
              <h4>Ban Phase</h4>
              <h5>{(this.state.cd_curr_num-this.state.cd_song_num) + " more song(s) to ban"}</h5>
            </div>
      )
  },

  infoPanel(){
    return(
      <div className="Info-panel">
        <h4>Song(s) to be Played</h4>
      </div>
    )
  },

  render() {
    var that = this;
    var grabbed_song_cards = this.state.grabbed_songs.map(function(obj){
      return(
        <Song song={obj} protect_panel={that.state.protect_count > 0} card_draw_panel={that.state.card_draw_panel} game={that.state.game_name} version={that.state.version_name} difficulties={that.state.game_data.games[that.state.game_name].versions[that.state.version_name].difficulty.list} protect = {that.handleProtect} ban = {that.handleBans} key={obj.name + "_" + obj.difficulty} />
      )
    })
    var song_cards = this.state.songs.map(function(obj){
      return(
        <Song song={obj} protect_panel={false} card_draw_panel={false} game={that.state.game_name} version={that.state.version_name} difficulties={that.state.game_data.games[that.state.game_name].versions[that.state.version_name].difficulty.list} key={obj.name + "_" + obj.difficulty} />
      )
    })
    return (
      <div>
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
        {this.state.grabbed_songs.length > 0 ? (this.state.protect_count > 0 ? this.protectPanel() : (this.state.cd_curr_num !== this.state.cd_song_num ? this.banPanel() : null)) : null}
        <div className="Song-container">
          {grabbed_song_cards}
        </div>
        {this.state.grabbed_songs.length > 0 ? this.infoPanel() : null}
        <div className="Song-container">
          {song_cards}
        </div>
        {this.menuButton()}
        <br/>
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
    if(this.props.game === 'sdvx') classes = ['purple', 'yellow', 'red', 'white', 'pink', 'orange', 'lightblue']
    if(this.props.game === 'popn') classes = ['blue', 'green', 'yellow', 'red']
    if(this.props.game === 'rb') classes = ['green', 'yellow', 'red', 'white']
    if(this.props.game === 'museca') classes = ['green', 'yellow', 'red']
    if(this.props.game === 'groovecoaster') classes = ['blue', 'yellow', 'red', 'gray']
    if(this.props.game === 'jubeat') classes = ['green', 'yellow', 'red']
    if(this.props.game === 'crossbeats') classes = ['blue', 'green', 'yellow', 'red', 'purple']
    if(this.props.game === 'danevo') classes = ['white']
    class_name += classes[difficulty]
    var object = {
      diff_string: diff_string,
      class_name: class_name,
    }
    return object;
  },

  changeBanClass(){
    this.props.ban(this.props.song.id);
  },

  changeProtectClass(){
    this.props.protect(this.props.song.id);
  },

  card_ban(){
    var url = "https://www.google.com/search?q=" + this.props.song.name + "+" + this.props.song.version + "+" + this.props.game
    if(this.props.protect_panel && !this.props.song.protect){
      return(
        <div>
          <a href={url} target="_blank"><i className="small material-icons">search</i></a>
          &ensp;&ensp;
          <i className="small material-icons" onClick={this.changeProtectClass}>check_circle_outline</i>
        </div>
      )
    }
    else if(this.props.card_draw_panel && !this.props.song.protect){
      return(
        <div>
          <a href={url} target="_blank"><i className="small material-icons">search</i></a>
          &ensp;&ensp;
          <i className="small material-icons" onClick={this.changeBanClass}>block</i>
        </div>
      )
    }
    else return(
      <div>
        <a href={url} target="_blank"><i className="small material-icons">search</i></a>
      </div>
    )
  },

  render() {
    var object = this.diff_return(this.props.song.difficulty);
    var difficulty = this.props.game === 'danevo' ? "Level " : object.diff_string + " ";
    var style =  this.props.song.style.charAt(0).toUpperCase() + this.props.song.style.slice(1)+ " ";
    var card_class = this.props.song.active ? object.class_name : "Song-card card-out"
    var level = (this.props.song.game === 'guitar' || this.props.song.game === 'drum') ? this.props.song.level/100.00 : this.props.song.level;
    return (
      <div className={"Song-card " + card_class}>
        <h5>{this.props.song.name}</h5>
        <h6>{this.props.song.artist}</h6>
        <h6>{style + difficulty} {this.props.song.level}</h6>
        <h6>{this.props.song.genre}</h6>
        <h6>{"BPM: " + this.props.song.bpm}</h6>
        <h6>{this.props.song.version}</h6>
        <div>
          {this.card_ban()}
        </div>
      </div>
    );
  }
});

export default Random;
