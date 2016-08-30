var express = require('express');
var app = express();
var mongodb = require('mongodb');
var assert = require('assert');
var chance = require('chance').Chance();
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI;

MongoClient.connect(url, function(err, db) {
  assert.equal(err, null);
  console.log("Connected correctly to server.");
  db.close();
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var insertDocument = function(db, domain, scheme, randomHash) {
   db.collection('urls').insertOne({
      "url" : {
         "old" : scheme + domain,
         "short" : "localhost:5000/" + randomHash
      }
   });
};

function isUrlValid(domain, scheme) {
  var wwwDots = domain.substr(4).match(/\./g) === null ? [] : domain.substr(4).match(/\./g);
  var dots = domain.match(/\./g);
  var randomHash = chance.hash({ length: 6 });
  if (domain.substr(0, 4) === 'www.' && wwwDots.length === 1 && domain.substr(4, 1) !== '.') {
    MongoClient.connect(url, function(err, db) {
      assert.equal(err, null);
      insertDocument(db, domain, scheme, randomHash);
    });
    return { "original_url": scheme + domain, "short_url": "localhost:5000/" + randomHash };
  } else if (domain.substr(0, 4) !== 'www.' && dots.length === 1 && domain.substr(0, 1) !== '.') {
    MongoClient.connect(url, function(err, db) {
      assert.equal(err, null);
      insertDocument(db, domain, scheme, randomHash);
    });
    return { "original_url": scheme + domain, "short_url": "localhost:5000/" + randomHash };
  } else {
    return { "error": "not a valid url" };
  }
}

app.get('/https?://' + ':domain', function(req, res) {
  var scheme = req.originalUrl.substr(1, 5) === 'https' ? 'https://' : 'http://';
  MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);
    db.collection('urls').findOne({ "url.old": req.originalUrl.substr(1) }, function (err, doc) {
      assert.equal(err, null);
      if (doc) {
        console.log(doc.url);
      } else {
        res.send(isUrlValid(req.params.domain, scheme));
      }
      db.close();
    });
  });
});

app.listen(5000, function() {
  console.log('App listening on port ' + 5000);
});
