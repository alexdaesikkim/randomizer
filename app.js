var express = require('express');
var path = require('path');
var app = express();
var excel = require('xlsx');

app.use(express.static(path.join(__dirname, 'guac-frontend/build')));

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


//this function is using excel, and grabing stuff one by one
//conver this so that i use json
//can use filter to get the data that I want
function grab_data(worksheet, row){
  var songname = worksheet[("A" + row)].v;
  var artist = worksheet[("B" + row)].v;
  var level = worksheet[("C" + row)].v;
  var difficulty = worksheet[("D" + row)].v;

  var obj = {
    name: songname,
    artist: artist,
    level: level,
    difficulty: difficulty
  }
  return obj;
}

app.get('/:game/:version:/random/', function(req, res, next){
  var count = req.params.count;
  var difficulty = req.params.difficulty;
  var min = req.params.min;
  var max = req.params.max;
  var game = req.params.game;
  var version = req.params.version;

  //should change this to json
  var filename = "guac_" + name + ".xlsx";

  try{
    var workbook = excel.readFile(filename);
  }
  catch(err){
    //remember to add msg and send it as part of the response
    console.log("File not found for game " + name);
    res.status(404);
    res.end();
    return;
  }

  if(min > max){
    res.status(401);
    res.end();
    return;
  }
  var total = 0;
  var offset = 0;
  var worksheet = workbook.Sheets[workbook.SheetNames[0]];
  var x = 1; //due to column title "total";
  for(x; x < req.params.min; x++){
    var cell = "F"+x;
    offset += worksheet[cell].v;
  }
  for(x; x <= req.params.max; x++){
    var cell = "F"+x;
    total += worksheet[cell].v;
  }

  var array = [];
  for(var i = 1;  i <= total; i++){
    array.push(i);
  }
  array = shuffle(array, total);

  var return_obj = {
    songs: []
  }
  for(var i = 0; i < count; i++){
    var obj = grab_data(worksheet, (array[i]+offset));
    return_obj.songs.push(obj);
  }
  console.log(return_obj.songs);
  console.log(count);
  res.json(return_obj);

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
