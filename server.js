var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/:date', function (req, res) {
  var date;
  if (checkIfInteger(req.params.date)) {
    date = new Date(parseInt(req.params.date) * 1000);
    res.send({ "unix": parseInt(req.params.date), "natural": getNaturalDate(date) });
  } else if (Date.parse(req.params.date)) {
    date = new Date(Date.parse(req.params.date));
    res.send({ "unix": Date.parse(req.params.date) / 1000, "natural": getNaturalDate(date) });
  } else {
    res.send({ "unix": null, natural: null });
  }
});

app.listen(app.get('port'), function () {
  console.log('App listening on port ' + app.get('port'));
});

function getNaturalDate(date) {
  var natural = date.toDateString().split(" ");
  switch (natural[1]) {
    case "Jan":
    natural[1] = "January";
    break;
    case "Feb":
    natural[1] = "February";
    break;
    case "Mar":
    natural[1] = "March";
    break;
    case "Apr":
    natural[1] = "April";
    break;
    case "Jun":
    natural[1] = "June";
    break;
    case "Jul":
    natural[1] = "July";
    break;
    case "Aug":
    natural[1] = "August";
    break;
    case "Sep":
    natural[1] = "September";
    break;
    case "Oct":
    natural[1] = "October";
    break;
    case "Nov":
    natural[1] = "November";
    break;
    case "Dec":
    natural[1] = "December";
    break;
  }
  return natural = natural[1] + " " + natural[2] + ", " + natural[3];
}

function checkIfInteger(string) {
  var isInteger = true;
  string = string.split("");
  for (var i = 0; i < string.length; i++) {
    if (isNaN(string[i])) {
      isInteger = false;
    }
  }
  return isInteger;
}
