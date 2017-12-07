var express = require('express');
var path = require('path');
var app = express();
var excel = require('xlsx');
var bodyParser = require('body-parser');
var fs = require('fs');

var game_data = require('./games/game_data.json')

var game_cache = {
  "size": 0,
  "game_songs": {},
  "stack": []
};

app.use(bodyParser.json());

//LRU cache


//fisher-yates
function shuffle(array, size){
  for(var i = 0; i < size; i++){
    var j = Math.floor((Math.random() * (size-i)) + i);
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function check_cache(name){
  if(game_cache.name == null){

  }
}

//due to this being guac specific, some calls will be very specific to this case
//this code, if used elsewhere, would not work as well as it would
//i.e. selecting within range + level would require sql type call
//unless organized very well

//yes, this is framework for the 'master' random song generator that will come later
//but for now, i have deadline

//personal note: heroku has 10k limit for each postgres database, but i dont think
//there's a limit on how much i can make

//if i really want to host this for FREE, i need to get through some loopholes
//if this was purely json data and pulling data from it, i can use randomizer with ease
//todo later: make mental note somewhere else


app.get('/:game/:version/:build/random/', function(req, res, next){
  var count = req.body.count;
  var difficulty = req.body.difficulty;
  var min = req.body.min;
  var max = req.body.max;
  var game = req.params.game;
  var version = req.params.version;
  var build = req.params.build;
  var obj = {};


  if(game_data.games[game] == null){
    console.log("case 1");
    obj = {
      status:{
        message: "Invalid game name",
        code: 401
      }
    }
    res.status(401);
    res.json(obj);
    res.end();
    return;
  }

  if(game_data.games[game].versions[version] == null){
    console.log("case 2");
    obj = {
      status:{
        message: "Invalid version name",
        code: 401
      }
    }
    res.status(401);
    res.json(obj);
    res.end();
    return;
  }

  //have to filter builds and check here
  if(game_data.games[game].versions[version].builds.filter(function(str){return build == str}).length == 0){
    obj = {
      status:{
        message: "Invalid build name",
        code: 401
      }
    }
    res.status(401);
    res.json(obj);
    res.end();
    return;
  }

  var filename = "./" + game + "/" + version + "/" + build + ".json";
  var obj = JSON.parse(fs.readFileSync(filename, 'uft8'));
  //need to cache the objects
  console.log("case 4");
  res.status(200);
  res.end();
  return;

});

app.get('/:game/:version/info/', function(){
  //get information on the version itself
});

app.get('/:game/:version/all/', function(){
  //show all versions available with the associated game
});

app.get('/:game/info/', function(){
  //get information on the game itself, as well as versions that comes along with it
});

app.get('/:game/all/', function(){
  //does it overlap with above?
});

app.get('/all/', function(){
  //show all games available for this API
});
//for anything else, return 404


const port = process.env.PORT || 3001;

app.listen(port);
