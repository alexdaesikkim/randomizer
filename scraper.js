var fs = require('fs');
var songs = require('./sinobuz_test')
var request = require('request');
var cheerio = require('cheerio');
var jconv = require('jconv');

var sinobuz_new_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"

var options = {encoding: null, method: "GET", uri: "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"}
console.log(songs)
