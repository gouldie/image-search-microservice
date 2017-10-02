var mongodb = require('mongodb');
var express = require('express');
var imageSearch = require('node-google-image-search');
var app = express();

var MongoClient = mongodb.MongoClient;
var db_user = process.env.db_user;
var db_pass = process.env.db_pass;
var url = 'mongodb://' + db_user + ':' + db_pass + '@ds151554.mlab.com:51554/image-search';

app.get("/", function(request, response) {
  response.send("Pass a search term into /search/:term to search google images.")
})

app.get("/history", function(request, response) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err
    
    var results = db.collection("history").find().toArray(function(err, results) {
      results.sort(function(a,b) {
        return b.timestamp - a.timestamp
      })
      
      var trimmed = results.slice(0,9).map(function(e) {
        return {
          search: e.search,
          time: e.timestamp
        }
      })
      
      response.send(trimmed)
    })
  })
})

app.get("/search/:term", function(request, response) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err
    var results = imageSearch(request.params.term, function(results, err) {
      db.collection("history").insert({ search: request.params.term, timestamp: Date.now() }, function(err, res) {
        response.setHeader('Content-Type', 'application/json');
        response.send(results)
      })
    }, request.query.offset ? request.query.offset * 5 : 0, 1);
  });
})

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
