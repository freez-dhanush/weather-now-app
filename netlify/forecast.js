// netlify/functions/forecast.js

require('dotenv').config();
const fetch = require('node-fetch');

exports.handler = async function(event) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const { lat, lon, units = "metric" } = event.queryStringParameters;

  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Latitude and Longitude required." })
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch forecast data." })
    };
  }
};
