// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});



var ElasticBackend = require('./elasticBackend');
var backend = new ElasticBackend('search-cheapobeer-ukmvohtyptblq4mwkatezajhca.us-west-2.es.amazonaws.com');

app.get("/backendStatus", function(req, res) {
  backend.status().then(function(error) {
    res.send(error);
  })
  .catch(function(error) {
    res.send(JSON.stringify(error));
  });
});


app.post('/importBeers', function(req, res) {
  function successCallback(beerJson) {
    console.log('Received beer json, has '+Object.keys(beerJson).length+" entries");
    res.json({beerCount: Object.keys(beerJson).length});
  }
  function errorCallback(e) {
    console.error("Error while fetching beers for import: "+JSON.stringify(e));
    res.status(500).json(e);
  }
  backend.indexBeers('https://beerdom.firebaseio.com', req.body.firebaseAuthToken, successCallback, errorCallback);
});

app.get('/beerCount', function(req,res) {
  backend.countBeers(function(error, response) {
    res.json(response);
  });
});


app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
  ];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});