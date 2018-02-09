import React from 'react';
import './App.css';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var App = createReactClass({
  getInitialState(){
    return{
      game_data: []
    }
  },

  componentDidMount(){
    console.log("HI");
  },

  render() {
    return (
      <div>
        The application currently serves these games:
      </div>
    );
  }
});

export default App;
