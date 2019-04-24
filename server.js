'use strict';

const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000;

// CREATE LOCATION ROUTE
app.get('/location', (req, res) => {
  try {
    // STORE THE USER'S QUERY-TURNED-LOCATION-OBJECT IN LOCATIONDATA
    const locationData = searchToLatLong(req.query.data);
    // RETURN THE LOCATION OBJECT
    res.send(locationData);
  } catch(err) {
    errorHandler(res, 500, 'Please enter a valid location!');
  }
});

// CREATE WEATHER ROUTE
app.get('/weather', (req, res) => {
  try {
    // STORE THE USER'S QUERY LOCATION
    const weatherData = getWeather();
    res.send(weatherData);
  } catch(err) {
    errorHandler(res, 500, 'Please enter a valid location!');
  }
});

// CREATE A NEW LOCATION OBJECT FOR THE USER'S QUERY
const searchToLatLong = query => {
  const geoData = require('./data/geo.json');
  const location = new Location(query, geoData);
  return location;
};

function Location(query, res) {
  this.query = query,
  this.formatted_query = res.results[0].formatted_address,
  this.latitude = res.results[0].geometry.location.lat,
  this.longitude = res.results[0].geometry.location.lng;
}

// RETURN ALL WEATHER RECORDS FOR THE USER'S LOCATION QUERY
const getWeather = () => {
  const darkskyData = require('./data/darksky.json');
  const weatherSummaries = [];

  darkskyData.daily.data.forEach(day => {
    weatherSummaries.push(new Weather(day));
  });

  return weatherSummaries;
};

function Weather(day) {
  this.forecast = day.summary,
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

app.listen(PORT, () => console.log(`App is up and running on ${PORT}`));

const errorHandler = (res, status, message) => res.send({ status, message });
