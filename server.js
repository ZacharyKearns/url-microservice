var express = require('express');
var app = express();
var mongodb = require('mongodb');
var assert = require('assert');
var chance = require('chance').Chance();
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI;

app.set('port', (process.env.PORT || 5000));

MongoClient.connect(url, function (err, db) {
  assert.equal(err, null);
  console.log("Connected correctly to server.");
  db.close();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var insertDocument = function (db, domain, scheme, randomHash) {
   db.collection('urls').insertOne({
      "url" : {
         "original" : scheme + domain,
         "short" : "https://url-ms.herokuapp.com/" + randomHash
      }
   });
};

function isUrlValid (domain, scheme) {
  var wwwDots = domain.substr(4).match(/\./g) === null ? [] : domain.substr(4).match(/\./g);
  var dots = domain.match(/\./g);
  var randomHash = chance.hash({ length: 6 });
  if (domain.substr(0, 4) === 'www.' && wwwDots.length === 1 && domain.substr(4, 1) !== '.') {
    MongoClient.connect(url, function (err, db) {
      assert.equal(err, null);
      insertDocument(db, domain, scheme, randomHash);
    });
    return { "original_url": scheme + domain, "short_url": "https://url-ms.herokuapp.com/" + randomHash };
  } else if (domain.substr(0, 4) !== 'www.' && dots.length === 1 && domain.substr(0, 1) !== '.') {
    MongoClient.connect(url, function (err, db) {
      assert.equal(err, null);
      insertDocument(db, domain, scheme, randomHash);
    });
    return { "original_url": scheme + domain, "short_url": "https://url-ms.herokuapp.com/" + randomHash };
  } else {
    return { "error": "not a valid url" };
  }
}

app.get('/https?://' + ':domain', function (req, res) {
  var scheme = req.originalUrl.substr(1, 5) === 'https' ? 'https://' : 'http://';
  res.send(isUrlValid(req.params.domain, scheme));
});

app.get('/:hash', function (req, res) {
  MongoClient.connect(url, function (err, db) {
    assert.equal(err, null);
    db.collection('urls').findOne({ "url.short": "https://url-ms.herokuapp.com/" + req.params.hash }, function (err, doc) {
      assert.equal(err, null);
      if (doc) {
        res.redirect(doc.url.original);
      } else {
        res.send({ "error": "not a valid url" });
      }
      db.close();
    });
  });
});

app.get('*', function (req, res){
  res.send({ "error": "not a valid url" });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
