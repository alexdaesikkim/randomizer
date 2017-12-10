var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var sinobuz_new_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"

var options = {encoding: "EUC-JP", method: "GET", uri: "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"}

request(options, function(error, response, html){
  if(!error){
    var $ = cheerio.load(html);
    /*$('div.ie5').find('tbody').find('tr').each(function(i, element){
      var a = $(this).children();
      console.log(a);
    });*/
    var x = $('div.ie5').first().find('tbody').find('tr');
    //console.log(x[1].children[0]);
    var count = 0;
    console.log(x[0].children.length);
    console.log(x[1].children.length);
    var file = fs.createWriteStream('test.txt');
    file.on('error', function(err) {});
    x.each(function(i, element){
      var a = $(this).children();
      if(a.length == 11){
        var title = a[10].children[0].data;
        file.write(title + "\n");
        console.log(title);
        count++;
      };
    });
    file.end();

    console.log(count);

    //if 11 we know its one of the rows with song
    //disregard if there is less than 11 for this
    //ie5 is point of entry for div, that's the table
  }
})
