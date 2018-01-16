var express = require('express');
var path = require('path');
var app = express();
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

app.use(express.static(path.join(__dirname, 'front-end/build')));

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


//todo: error check function and route everything to that.
function filter_songs(array, style, d_min, d_max, l_min, l_max){
  //filter by difficulty, if it is not the default value of -1
  if(d_min !== -1 || d_max !== -1){
    if(d_max === -1){
      array = array.filter(function(data){
        return data.difficulty >= d_min;
      })
    }
    else{
      array = array.filter(function(data){
        return (data.difficulty >= d_min && data.difficulty <= d_max);
      })
    }
  }

  //filter by level, if its not the default value of 0
  if(l_min !== 0 || l_max !== 0){
    if(l_max === 0){
      array = array.filter(function(data){
        return data.level >= l_min;
      })
    }
    else{
      array = array.filter(function(data){
        return (data.level >= l_min && data.level <= l_max);
      })
    }
  }

  if (style === "single" || style === "double"){
    array = array.filter(function(data){
      return (data.style === style)
    })
  }
  return array;
}

app.get('/api/alpha/random/:game/:version/', function(req, res, next){
  var count = req.query.count > 1 ? req.query.count : 1;
  var min_difficulty = req.query.min_difficulty != null ? req.query.min_difficulty : -1;
  var max_difficulty = req.query.max_difficulty != null ? req.query.max_difficulty : -1;
  var min_level = req.query.min_level != null ? req.query.min_level : 0;
  var max_level = req.query.max_level != null ? req.query.max_level : 0;
  var build = req.query.build != null ? req.query.build : "";
  var style = req.query.style != null ? req.query.style : "all";
  var north_america = req.query.north_america != null ? req.query.north_america : false;
  var game = req.params.game;
  var version = req.params.version;
  var obj = {};
  var song_obj = {};

  count = parseInt(count, 10);
  min_difficulty = parseInt(min_difficulty, 10);
  max_difficulty = parseInt(max_difficulty, 10);
  min_level = parseInt(min_level, 10);
  max_level = parseInt(max_level, 10);

  if(!build){
    try{
      build = game_data.games[game].versions[version].current;
    }
    catch(err){
      if(game_data.games[game] == null){
        obj = {
          status:{
            message: "Invalid game name",
            code: 401
          }
        }
        res.status(401);
      }
      else{
        obj = {
          status:{
            message: "Invalid version name",
            code: 401
          }
        }
        res.status(401);
      }
    }
  }
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

  //need to cache the objects

  //FILTER results based on the params given

  //not really time consuming to generate
  //how does it fare against using the actually array to sort?
  var songs = song_obj.songs;
  songs = filter_songs(songs, style, min_difficulty, max_difficulty, min_level, max_level);
  if(songs.length < count){
    //return error
  }

  if(game_data.games[game].versions[version].na_option){
    songs = songs.filter(function(data){
      return data.north_america === true
    })
  }

  songs = shuffle(songs, songs.length);


  obj = {
    id: song_obj.id,
    version: version,
    songs: []
  }


  for(var i = 0; i < count; i++){

    obj.songs.push(songs[i]);
  }

  res.json(obj);
  res.status(200);
  res.end();
  return;

});

app.get('/api/alpha/info/:game/:version/', function(){
  //get information on the version itself
});

app.get('/api/alpha/all/:game/:version/', function(){
  //show all versions available with the associated game
});

app.get('/api/alpha/info/:game/', function(){
  //get information on the game itself, as well as versions that comes along with it
});

app.get('/api/alpha/all/:game/', function(){
  //does it overlap with above?
});

app.get('/api/alpha/all/games/', function(){
  //show all games available for this API
});

app.get('/api/alpha/all/', function(req, res, next){
  //game_data.json
  res.json(game_data);
  res.status(200);
  res.end();
  return;
});
//for anything else, return 404



const port = process.env.PORT || 3001;

app.listen(port);
