//npm install -S appmetrics-dash
//require('appmetrics-dash').monitor();

var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

var game_data = require('./games/game_data.json')
const cache_size = 5;

//lfu cache
function Node(data){
  this.data = data;
  this.next = null;
  this.prev = null;
}

function Linkedlist(){
  this._size = 0;
  this.head = null;
  this.tail = null;
}

Linkedlist.prototype = {
  add: function(value){
    var node = new Node(value);

    if(this._size > 0){
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    else{
      this.head = node;
      this.tail = node;
    }
    this._size++;
    return node;
  },
  remove: function(node){
    if(node === this.head && node === this.tail){
      this.head = null;
      this.tail = null;
    }
    if(node === this.head){
      this.head = this.head.next;
      this.head.prev = null;
    }
    else if(node === this.tail){
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    else{
      var prev = node.prev;
      var next = node.next;
      prev.next = next;
      next.prev = prev;
    }
    node = null;
    this._size--;
    return;
  },
  remove_last_used: function(){
    var node = this.head;
    var key = node.data;
    this.head = this.head.next;
    this.head.prev = null;
    this._size--;
    node = null;
    return key;
  }
}

var game_cache = {
  "size": cache_size,
  "songs": {},
  "lfu_check": new Linkedlist()
};

function grab_data_cache(game, version, build){
  var key = game + "_" + version + "_" + build;
  if(game_cache.songs[key] != null){
    if(game_cache.lfu_check._size > 1){
      var node = game_cache.songs[key].node;
      game_cache.lfu_check.remove(node);
      game_cache.songs[key].node = game_cache.lfu_check.add(key);
    }
    return game_cache.songs[key].data;
  }
  else{
    if(game_cache.size == game_cache.lfu_check._size){
      var remove_key = game_cache.lfu_check.remove_last_used()
      console.log(remove_key);
      delete game_cache.songs[remove_key];
    }
    var node = game_cache.lfu_check.add(key);
    try{
        var filename = "./games/" + game + "/" + version + "/" + build + ".json";
        song_obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
    }
    catch(err){
      var obj = {
        status:{
          message: "Internal Error. Please contact admin",
          code: 500
        }
      }
      return obj;
    }

    var obj = {
      "node": node,
      "data": song_obj
    }
    game_cache.songs[key] = obj;
    return obj.data;
  }
}

//fisher-yates algorithm
function shuffle(array, size){
  for(var i = 0; i < size; i++){
    var j = Math.floor((Math.random() * (size-i)) + i);
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

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

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'front-end/build')));

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

  if(game_data.games[game] == null){
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
  else if(game_data.games[game].versions[version] == null){
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

  if(!build) build = game_data.games[game].versions[version].current;

  else{
    builds = game_data.games[game].versions[version].builds
    if(!builds.includes(build)){
      console.log(build)
      console.log(builds)
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
  }

  var song_obj = grab_data_cache(game, version, build);

  if(song_obj.status != null){
    res.status(song_obj.status.code)
    res.json(song_obj);
    res.end();
    return;
  }

  //need to cache the objects

  //FILTER results based on the params given

  //not really time consuming to generate
  //how does it fare against using the actually array to sort?
  var songs = song_obj.songs;
  songs = filter_songs(songs, style, min_difficulty, max_difficulty, min_level, max_level);

  if(game_data.games[game].versions[version].na_option){
    songs = songs.filter(function(data){
      return data.north_america === true
    })
  }

  if(songs.length < count){
    count = songs.length
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

app.get('/api/alpha/info/:game/:version/current', function(req, res, next){
  var obj = {
    current: game_data.games[req.params.game].versions[req.params.version].current
  }
  res.json(obj);
  res.status(200);
  res.end();
})

app.get('/api/alpha/info/:game/:version/builds', function(req, res, next){
  //returns list of builds available
  var obj = {
    builds: game_data.games[req.params.game].versions[req.params.version].builds
  };
  res.json(obj);
  res.status(200);
  res.end();
})

app.get('/api/alpha/info/:game/:version/', function(req, res, next){
  //still need errorcheck
  var game = req.params.game;
  var version = req.params.version;
  var version_obj = game_data.games[game].versions[version];
  var obj = {
    name: version_obj.name,
    difficulty: version_obj.difficulty,
    level: version_obj.level,
    na_option: version_obj.level
  }
  res.json(obj);
  res.status(200);
  res.end();
});

app.get('/api/alpha/list/:game/versions/', function(req, res, next){
  //still need errorcheck
  var game = req.params.game;
  var versions = [];
  for(var key in game_data.games[game].versions){
    versions.push(key);
  }
  var obj = {
    versions: versions
  }
  res.json(obj);
  res.status(200);
  res.end()
});

app.get('/api/alpha/info/:game/', function(req, res, next){
  var game_obj = game_data.games[game];
  var obj = {
    name: game_obj.name,
    styles: game_obj.styles
  }
  res.json(obj);
  res.status(200);
  res.end();
});

app.get('/api/alpha/list/games/', function(req, res, next){
  var games = [];
  for(var key in game_data.games){
    games.push(key);
  }
  var obj = {
    games: games
  }
  res.json(obj);
  res.status(200);
  res.end();
});

app.get('*', function(req, res){
  res.send('Page not found', 404);
  res.end();
});

const port = process.env.PORT || 3001;

app.listen(port);
