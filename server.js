var express = require('express');
var app = express();
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url = process.env.MONGOLAB_URI;

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    db.close();
  }
});

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(app.get('port'), function () {
  console.log('App listening on port ' + app.get('port'));
});
