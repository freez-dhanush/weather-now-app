// netlify/functions/weather.js

require('dotenv').config();
const fetch = require('node-fetch');

exports.handler = async function(event) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const { q, lat, lon, units = "metric" } = event.queryStringParameters;

  let query = [];
  if (q) query.push(`q=${encodeURIComponent(q)}`);
  if (lat && lon) query.push(`lat=${lat}&lon=${lon}`);
  query.push(`appid=${API_KEY}`);
  query.push(`units=${units}`);

  const url = `https://api.openweathermap.org/data/2.5/weather?${query.join("&")}`;

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
      body: JSON.stringify({ error: "Failed to fetch weather data." })
    };
  }
};
