import React from 'react';
import './App.css';
import $ from 'jquery';
import {Collapsible, CollapsibleItem} from 'react-materialize';

var createReactClass = require('create-react-class');

var App = createReactClass({
  getInitialState(){
    return{
      game_data: [],
      games: []
    }
  },

  componentDidMount(){
    var that = this;
    $.ajax({
      url: '/api/alpha/info/all',
      method: 'GET',
      success: function(data){
        that.setState({
          game_data: data,
          games: Object.keys(data.games)
        });
      },
      error: function(data){
        that.setState({
          errors:{
            error_messages: ["Please reload the page and try again. If error persists, please contact admin (AJAX return error)"],
            error_class: "form-error"
          }
        })
      }
    })
  },

  game_panel(game){
    var game_name = game.name;
    var game_versions = Object.keys(game.versions);
    var version_info = game_versions.map(function(key){
      var version = game.versions[key]
      var builds = version.builds;
      return(
        <CollapsibleItem header={version.name}>
          Supported builds: {builds}
        </CollapsibleItem>
      )
    });
    return(
      <CollapsibleItem header={game_name}>
        <Collapsible>
          {version_info}
        </Collapsible>
      </CollapsibleItem>
    )
  },

  render() {
    var games = this.state.games;
    var that = this;
    var game_information = games.map(function(key){
      console.log(key);
      console.log(that.state.game_data)
      if(that.state.game_data !== []){
        var game = that.state.game_data.games[key];
        return(
          <div>
            {that.game_panel(game)}
          </div>
        )
      }
      else return null;
    })
    return (
      <div>
        The application currently serves these games:
        <Collapsible>
          {game_information}
        </Collapsible>
      </div>
    );
  }
});

export default App;
