var express = require('express');
var path = require('path');
var app = express();
var excel = require('xlsx');
var bodyParser = require('body-parser');
var fs = require('fs');

var PythonShell = require('python-shell');

var game_data = require('./games/game_data.json')
const cache_size = 10;

var game_cache = {
  "size": 0,
  "game_songs": {},
  "stack": []
};
app.use(bodyParser.urlencoded({extended: false}));
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
      console.log("hit");
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

app.get('/random/:game/:version/', function(req, res, next){
  console.log("get request");
  console.log(req.body);
  var count = req.body.count > 1 ? req.body.count : 1;
  var min_difficulty = req.body.min_difficulty != null ? req.body.min_difficulty : -1;
  var max_difficulty = req.body.max_difficulty != null ? req.body.max_difficulty : -1;
  var min_level = req.body.min_level != null ? req.body.min_level : 0;
  var max_level = req.body.max_level != null ? req.body.max_level : 0;
  var build = req.body.build != null ? req.params.build : "";
  var style = req.body.style != null ? req.body.style : "all";
  var game = req.params.game;
  var version = req.params.version;
  var obj = {};
  var song_obj = {};
  console.log(count);
  console.log(min_level);
  console.log(max_level);
  console.log(min_difficulty);
  console.log(max_difficulty);
  console.log(style);
  console.log(build);

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
  console.log("build is "+ build);
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
  songs = shuffle(songs, song_obj.songs.length);
  songs = filter_songs(songs, style, min_difficulty, max_difficulty, min_level, max_level)

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

app.get('/info/:game/:version/', function(){
  //get information on the version itself
});

app.get('/all/:game/:version/', function(){
  //show all versions available with the associated game
});

app.get('/info/:game/', function(){
  //get information on the game itself, as well as versions that comes along with it
});

app.get('/all/:game/', function(){
  //does it overlap with above?
});

app.get('/all/', function(){
  //show all games available for this API
});
//for anything else, return 404

//solely for testing purposes
app.get('/scrape/sinobuz/', function(){
  PythonShell.run('scraper.py', function (err) {
    if (err) throw err;
    console.log('finished');
  });

})


const port = process.env.PORT || 4001;

app.listen(port);
