var elasticsearch = require('elasticsearch');
var request = require('request-promise');

function getJson(url) {
  var options = {
    uri: url,
    json: true
  };
  console.log("Fetching url: "+url);
  return request(options);
}

var ElasticBackend = function(elasticHost) {
  this.hostName = elasticHost;
  this.client = new elasticsearch.Client({
    host: this.hostName,
    log: 'trace',
    port: 443,
    protocol: 'https'
  });
};

ElasticBackend.prototype.status = function() {
  return this.client.ping({
    // ping usually has a 3000ms timeout 
    requestTimeout: 3000
  });
};

ElasticBackend.prototype.countBeers = function(callback) {
  this.client.count({index: 'beers'}, callback);  
};

ElasticBackend.prototype.indexBeers = function(firebaseUrl, firebaseAuthToken, successCallback, errorCallback) {
  var url = firebaseUrl+'/beers.json?shallow=false&auth='+firebaseAuthToken;
  //https://beerdom.firebaseio.com//beers.json?shallow=false&auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0NjgwODUxNDIsImV4cCI6MTQ2ODA4ODc0MiwiYWRtaW4iOnRydWUsInYiOjB9.U7yWkcpvdEarqXsd03szuMsIdEVZaxsv898lsFPxPEw 
  var self = this;
  return getJson(url)
  .then(function(beerJson) {
    console.log("Retrieved beers from firebase, found "+Object.keys(beerJson).length+" beers");
    var bulkIndex = [];
    for (var property in beerJson) {
      if (beerJson.hasOwnProperty(property)) {
        bulkIndex.push({index: {_index: 'beers', _type: 'beer', _id: property}});
        bulkIndex.push(beerJson[property]);
        //console.log("Indexing beer with id="+property+", json="+JSON.stringify(beerJson[property]));
        //self.indexBeer(property, beerJson[property]);
        //console.log("Finished indexing beer with id="+property);
      }
    }
    self.client.bulk({body: bulkIndex}, function(err, resp) {
      if(err) {
        console.log("Failed to bulk index beers: "+err);
        errorCallback(err);
      }
      else successCallback(resp);
      
    })
    successCallback(beerJson);
  })
  .catch(errorCallback);
};

ElasticBackend.prototype.indexBeer = function(id, json) {
  console.log("indexBeer("+id+")");
  this.client.index({
    index: 'beers',
    type: 'beer',
    id: id,
    body: json
  }, function(error, response) {
    if(error) console.log(`error indexing beer id=${id}, json=`+JSON.stringify(json)+', error='+error);
    else console.log(response);
  })
};

module.exports = ElasticBackend;
