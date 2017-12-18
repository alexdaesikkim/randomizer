import React from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

var createReactClass = require('create-react-class');

var App = createReactClass({
  render() {
    return (
      <div>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
        </div>
        <div className="content">
          <div className="container">
            <h5>API Documentation</h5>
            <ul className="collapsible" data-collapsible="accordion">
              <li>
                <div className="collapsible-header">Grab Random Song</div>
                <div className="collapsible-body">
                  <b>Entry Point:</b>
                  <br/>
                  <code>
                    GET /random/&#123;game&#125;/&#123;version&#125;/
                  </code>
                  <br/>
                  <br/>
                  <b>Query Parameters</b> (via object):
                  <table>
                    <thead>
                      <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Default Value</th>
                          <th>Description</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>count</td>
                        <td>Integer</td>
                        <td>1</td>
                        <td>Number of songs to return.</td>
                      </tr>
                      <tr>
                        <td>min_difficulty</td>
                        <td>Integer</td>
                        <td>-1</td>
                        <td>Lower difficulty cap on query*.</td>
                      </tr>
                      <tr>
                        <td>max_difficulty</td>
                        <td>Integer</td>
                        <td>-1</td>
                        <td>Upper difficulty cap on query*.</td>
                      </tr>
                      <tr>
                        <td>min_level</td>
                        <td>Integer</td>
                        <td>0</td>
                        <td>Minimum level, based on the game being queried.</td>
                      </tr>
                      <tr>
                        <td>max_level</td>
                        <td>Integer</td>
                        <td>0</td>
                        <td>Max level, based on the game being queried.</td>
                      </tr>
                      <tr>
                        <td>build</td>
                        <td>String</td>
                        <td>"latest"</td>
                        <td>Game build. Find accepted values via API call to game&#39;s information.</td>
                      </tr>
                      <tr>
                        <td>style</td>
                        <td>String</td>
                        <td>"all"</td>
                        <td>Play style. Accepted values: ["single", "double", "all"].</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    *Difficulty is based on numbers, with beginner being 0 and lowest difficulty (other than beginner) being 1.
                  </p>

                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

export default App;
