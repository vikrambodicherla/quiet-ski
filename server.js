var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');

app.use(bodyParser.urlencoded({extended: false}));

function getWeather(location, callback) {
  var locationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyBeJaqPCYy78TOh_3hBl8GiIqO0PIZWAxE';
  request(locationUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var locResponse = JSON.parse(body);
      var locationLatLng = locResponse.results[0].geometry.location;
      var locationLabel = locResponse.results[0].formatted_address;
      
      var weatherUrl = 'https://api.darksky.net/forecast/4310e25a69b15674b9ae3abc58ad1971/' + locationLatLng.lat + ',' + locationLatLng.lng + '?exclude=minutely,hourly,flags';
      request(weatherUrl, function(error, response, body) {
        if(!error && response.statusCode == 200) {
          var weatherResponse = JSON.parse(body);
          var response = 'At ' + locationLabel + ', it is now ' + weatherResponse.currently.summary + ' at ' + weatherResponse.currently.apparentTemperature + 'F. Today will be ' + weatherResponse.daily.data[0].summary + ' with a maximum of ' + weatherResponse.daily.data[0].apparentTemperatureMax + 'F and a mimimum of ' + weatherResponse.daily.data[0].apparentTemperatureMin + 'F';
          callback(undefined, response);
        }
        else {
          callback(error);
        }
      });      
    }
    else {
      callback(error)
    }
  });
}

app.post("/request", function(request, response) {
  var requestBody = request.body.Body;
  console.log("Request: " + requestBody);
  
  var requestType = requestBody.substr(0, requestBody.indexOf(' ')).toLowerCase();
  var responseVal;
  
  if(requestBody.includes("weather")) {
    var location;
    if(requestBody != 'weather') {
      location = requestBody.substr(requestBody.indexOf(' ') + 1);
    }  
    else {
      location = request.body.FromZip;
    }

    console.log('Location: ' + location);
    
    if(location != undefined && location != '') {
      getWeather(location, function(err, resp) {
        console.log('Response: ' + resp);
        if(err) {
          responseVal = "<Response><Message>I am sorry, the world is falling flat. Help Vikram!</Message></Response>";
        }
        else {
          responseVal = "<Response><Message>" + resp + "</Message></Response>";
        }
        response.send(responseVal);
      });
    }
    else {
      responseVal = "<Response><Message>What location do you want weather for?</Message></Response>";
      response.send(responseVal);
    }
  }
  else {
    responseVal = "<Response><Message>I am sorry, I don't know how to help with that</Message></Response>";
    response.send(responseVal);
  }
}); 
 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
 
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});