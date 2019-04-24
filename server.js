'use strict';
require('dotenv').config();

const superagent = require('superagent');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000,
  WEATHER_API_KEY = process.env.WEATHER_API_KEY,
  GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
// CREATE LOCATION ROUTE
app.get('/location', (req, res) => {
  try {
    // STORE THE USER'S QUERY-TURNED-LOCATION-OBJECT IN LOCATIONDATA
    const locationData = searchToLatLong(req.query.data, res);
  } catch(err) {
    errorHandler(res, 500, 'Please enter a valid location!');
  }
});

// CREATE WEATHER ROUTE
app.get('/weather', (req, res) => {
  try {
    // STORE THE USER'S QUERY LOCATION
    const weatherData = getWeather(req, res);
  } catch(err) {
    errorHandler(res, 500, 'Please enter a valid location!');
  }
});

// CREATE A NEW LOCATION OBJECT FOR THE USER'S QUERY
const searchToLatLong = (request, response) => {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request}&key=${WEATHER_API_KEY}`;
  return superagent.get(url)
    .then(res => {
      response.send(new Location(request, res));
    }).catch(error => {
      response.status(500).send('Please enter a valid location!');
    });
};

function Location(query, res) {
  this.query = query,
  this.formatted_query = res.body.results[0].formatted_address,
  this.latitude = res.body.results[0].geometry.location.lat,
  this.longitude = res.body.results[0].geometry.location.lng;
}

// RETURN ALL WEATHER RECORDS FOR THE USER'S LOCATION QUERY
const getWeather = (request, response) => {
  // const darkskyData = require('./data/darksky.json');
  let url = `https://api.darksky.net/forecast/7095b5fd7653232a5682864d8a0a6bbc/${request.query.lat},${request.query.lng}`;
  return superagent.get(url)
    .then(res => {
      console.log(res.body);
      const weatherSummaries =[];
      res.body.daily.data.forEach(day => {
        weatherSummaries.push(new Weather(day));
      });
      // response.send(new Location(request, res));
      response.send(weatherSummaries);
    }).catch(error => {
      response.status(500).send('Please enter a valid location!');
    });
  
  // const weatherSummaries = darkskyData.daily.data.map(day => new Weather(day));
  // return weatherSummaries;
};

function Weather(day) {
  this.forecast = day.summary,
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

app.listen(PORT, () => console.log(`App is up and running on ${PORT}`));

const errorHandler = (res, status, message) => res.send({ status, message });
