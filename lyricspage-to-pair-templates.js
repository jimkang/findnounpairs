var request = require('request');
var through2 = require('through2');
var split = require('split');
var createNounfinder = require('nounfinder');
var config = require('./config');

if (process.argv.length < 3) {
  console.log('Usage: node lyricspage-to-pair-templates <lyrics page url>');
  process.exit();
}

var url = process.argv[2];

var nounfinder = createNounfinder({
  wordnikAPIKey: config.wordnikAPIKey
});

function createAndedNounStream() {
  var syllablizeThroughStream = through2({
      objectMode: true
    },
    lineToAndedNounTemplate
  );

  return syllablizeThroughStream;  
}

function createAndedNounStream() {
  var syllablizeThroughStream = through2({
      objectMode: true
    },
    lineToAndedNounTemplate
  );

  return syllablizeThroughStream;  
}

var andedWordsRegex = /(\w+)\sand\s(\w+)/;

function lineToAndedNounTemplate(line, enc, callback) {
  var stream = this;
  var line = line.toLowerCase();

  if (line.indexOf(' and ') !== -1) {
    var matches = andedWordsRegex.exec(line);
    
    if (matches && matches.length > 1) {
      nounfinder.getNounsFromText(
        matches[0] + ' ' + matches[1], checkNouns        
      );
    }
    else {
      callback();
    }
  }
  else {
    callback();
  }

  function checkNouns(error, nouns) {
    if (error) {
      console.log(error);
    }
    else if (nouns.length === 2) {
      var template = line.replace(nouns[0], '%s');
      template = template.replace(nouns[1], '%s');
      stream.push('"' + template + '",\n');
    }
    callback();
  }  
}

// var url = 'http://ohhla.com/anonymous/2_pac/eyezonme/calilove.2pc.txt';

request(url)
  .pipe(split())
  .pipe(createAndedNounStream())
  .pipe(process.stdout);
