var express = require('express');
var path = require('path');
var app = express();
var excel = require('xlsx');
var bodyParser = require('body-parser');
var fs = require('fs');

var game_data = require('./games/game_data.json')
const cache_size = 10;

var game_cache = {
  "size": 0,
  "game_songs": {},
  "stack": []
};

app.use(bodyParser.json());



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

//LRU cache?
//MVP: no need to implement this now.
function check_cache(game, version, build){
  if(game_cache.game_songs.name == null){
    if(game_cache.size < cache_size){
      game_cache.size++;
      var filename = "./" + game + "/" + version + "/" + build + ".json";
      var obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
      game_cache.game_songs[name] = obj;
    }
  }
  return game_cache.game_songs[name];
}

//personal note: heroku has 10k limit for each postgres database, but i dont think
//there's a limit on how much i can make

//if i really want to host this for FREE, i need to get through some loopholes
//if this was purely json data and pulling data from it, i can use randomizer with ease
//todo later: make mental note somewhere else
function filter_object(obj, d_min, d_max, l_min, l_max){
  var new_obj = obj;

  //filter by difficulty, IF not default
  if(d_min != 0 || d_max != 0){
    if(d_max == 0){
      new_obj.filter(function(data){
        return data.difficulty >= d_min;
      })
    }
    else{
      new_obj.filter(function(data){
        return (data.difficulty >= d_min && data.difficulty <= d_max);
      })
    }
  }

  //filter by level, IF not default
  if(l_min != 0 || l_max != 0){
    if(l_max == 0){
      new_obj.filter(function(data){
        return data.level >= l_min;
      })
    }
    else{
      return (data.level >= l_min && data.level <= l_max);
    }
  }

  return new_obj;
}

app.get('/:game/:version/:build/random/', function(req, res, next){
  var count = req.body.count > 1 ? req.body.count : 1;
  var min_difficulty = req.body.difficulty != null ? req.body.difficulty.min : 0;
  var max_difficulty = req.body.difficulty != null ? req.body.difficulty.max : 0;
  var min_level = req.body.min != null ? req.body.min : 0; //integer
  var max_level = req.body.max != null ? req.body.max : 0; //integer
  var game = req.params.game;
  var version = req.params.version;
  var build = req.params.build;
  var obj = {};
  var song_obj = {};

  console.log("D Min: " + min_difficulty);
  console.log("D Max: " + max_difficulty);
  console.log("L Min: " + min_level);
  console.log("L Max: " + max_level);

  try{
      var filename = "./games/" + game + "/" + version + "/" + build + ".json";
      song_obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
  }
  catch(err){
    if(game_data.games[game] == null){
      console.log("case 1");
      obj = {
        status:{
          message: "Invalid game name",
          code: 401
        }
      }
      res.status(401);
    }

    else if(game_data.games[game].versions[version] == null){
      console.log("case 2");
      obj = {
        status:{
          message: "Invalid version name",
          code: 401
        }
      }
      res.status(401);
    }

    //have to filter builds and check here
    else if(game_data.games[game].versions[version].builds.filter(function(str){return build == str}).length == 0){
      obj = {
        status:{
          message: "Invalid build name",
          code: 401
        }
      }
      res.status(401);
    }
    else{
      obj = {
        status:{
          message: "Internal error, please contact administrator (File not found)",
          code: 500
        }
      }
      res.status(500)
    }
    res.json(obj);
    res.end();
    return;
  }


  console.log(song_obj.id);

  //need to cache the objects

  //FILTER results based on the params given

  //not really time consuming to generate
  var array = [];
  var length = song_obj.songs.length;
  for(var i = 0;  i < length; i++){
    array.push(i);
  }
  array = shuffle(array, length);
  obj = {
    count: 1,
    songs: []
  }
  for(var i = 0; i < 1; i++){
    obj.songs.push(song_obj.songs[array[0]]);
  }

  res.json(obj);
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
