const funFacts = [
    "Did you know? The highest temperature on Earth was 56.7°C (134°F) in Death Valley, USA.",
    "The coldest temperature ever recorded was −89.2°C (−128.6°F) at Vostok Station, Antarctica.",
    "In Mawsynram, India, it rains more than anywhere else on Earth!",
    "Our planet is struck by lightning about 8 million times every day.",
    "The fastest winds on Earth occur inside tornadoes, reaching over 480 km/h (300 mph).",
    "A single hurricane can release the same energy as 10,000 nuclear bombs.",
    "Snowflakes always have six sides but no two are exactly alike.",
    "Rainbows can actually appear as full circles, but we usually see only half from the ground.",
    "The wettest inhabited place in the world is Meghalaya, India.",
    "On Jupiter, scientists believe it might rain diamonds.",
    "The eye of a hurricane is calm and clear, despite the chaos around it.",
    "Some frogs survive winter by freezing solid and thawing in spring!",
    "Deserts can be blazing hot by day and freezing cold at night.",
    "Raindrops aren't tear-shaped; they're more like hamburger buns as they fall.",
    "A heatwave can bend train tracks and melt roads.",
    "The largest hailstone ever recorded weighed about 1 kg (2.25 lbs)!",
    "In Antarctica, there are places where it hasn't rained for 2 million years.",
    "There are 'fire rainbows'—rare, colorful clouds caused by sunlight and ice crystals.",
    "Fog can be so thick in London that people once had to walk by feeling the curb with their feet.",
    "The word 'hurricane' comes from the Taino Native American word 'hurucane', meaning evil spirit of the wind."
];

const iconMap = {
    clear: "☀️",
    clouds: "☁️",
    rain: "🌧️",
    snow: "❄️",
    thunderstorm: "⛈️",
    mist: "🌫️",
    haze: "🌫️",
    drizzle: "🌦️",
    fog: "🌁",
    windy: "🌬️"
};

const suggestionData = {
    clear: { text: "It's a bright and sunny day. Stay hydrated and protect your skin with sunscreen!" },
    clouds: { text: "Overcast skies above. A perfect day for a cozy book or a walk in the park." },
    rain: { text: "Rain showers expected. Keep an umbrella handy and watch out for slippery roads." },
    snow: { text: "Snow is falling! Bundle up, wear boots, and enjoy the winter magic." },
    thunderstorm: { text: "Thunderstorms in the area. Stay indoors, unplug electronics, and stay safe!" },
    mist: { text: "Misty conditions detected. Turn on your headlights and drive slowly." },
    haze: { text: "Hazy outside. Limit outdoor activities and consider wearing a mask if sensitive." },
    drizzle: { text: "Light drizzle is in the air. A raincoat might be more practical than an umbrella." },
    fog: { text: "Foggy weather today. Use fog lights and keep a safe distance on the road." },
    windy: { text: "Strong winds blowing. Secure loose outdoor items and avoid cycling." },
    default: { text: "Enjoy your day, whatever the weather brings!" }
};

const bgImages = {
    clear: "images/clear.jpg",
    clouds: "images/clouds.jpg",
    rain: "images/rain.jpg",
    snow: "images/snow.jpg",
    thunderstorm: "images/thunderstorm.jpg",
    mist: "images/mist.jpg",
    haze: "images/haze.jpg",
    drizzle: "images/drizzle.jpg",
    fog: "images/fog.jpg",
    default: "images/default.jpg"
};

let funFactIndex = Math.floor(Math.random() * funFacts.length);
let funFactInterval = null;
let currentUnit = localStorage.getItem("weather-unit") || "metric";
let lastSearchType = null;
let lastCity = "";
let lastCoords = null;

function showGreeting() {
    document.getElementById("suggestion-message").textContent = funFacts[funFactIndex];
}

function rotateFunFact() {
    funFactInterval = setInterval(() => {
        funFactIndex = (funFactIndex + 1) % funFacts.length;
        if(document.getElementById("weather-result").style.display !== "flex") showGreeting();
    }, 25000);
}

showGreeting();
rotateFunFact();

function setUnitLabel() {
    document.getElementById("unit-label").textContent = currentUnit === "metric" ? "°C" : "°F";
    document.getElementById("unit-toggle").checked = (currentUnit === "imperial");
}

setUnitLabel();

document.getElementById("unit-toggle").addEventListener("change", function() {
    currentUnit = this.checked ? "imperial" : "metric";
    localStorage.setItem("weather-unit", currentUnit);
    setUnitLabel();
    if (lastSearchType === "city" && lastCity) {
        fetchWeatherData({ q: lastCity });
    } else if (lastSearchType === "coords" && lastCoords) {
        fetchWeatherData({ lat: lastCoords.lat, lon: lastCoords.lon });
    }
});

document.getElementById("geo-btn").addEventListener("click", function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            err => alert("Unable to get your location.")
        );
    } else {
        alert("Geolocation not supported.");
    }
});

document.getElementById("search-btn").addEventListener("click", () => getWeather());

document.getElementById("city-input").addEventListener("input", function() {
    hideWeather();
    showGreeting();
    const weatherBg = document.getElementById("weather-bg");
    weatherBg.style.display = "none";
    weatherBg.src = "";
});

function hideWeather() {
    document.getElementById("weather-result").style.display = "none";
    document.getElementById("weather-result").innerHTML = "";
    document.getElementById("forecast-result").style.display = "none";
    document.getElementById("forecast-result").innerHTML = "";
}

async function getWeather(opts = {}) {
    const city = document.getElementById("city-input").value.trim();
    if (!city && !opts.refreshOnly) {
        document.getElementById("weather-result").style.display = "flex";
        document.getElementById("weather-result").innerHTML = `
            <div style="width:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;">
                <img src="images/error.jpg" alt="Error" class="weather-error-img"/>
                <div style="color:#f88;font-weight:bold;">Please enter a city name!</div>
            </div>
        `;
        document.getElementById("forecast-result").style.display = "none";
        document.getElementById("forecast-result").innerHTML = "";
        document.getElementById("suggestion-message").textContent = "Please enter a city name to get started.";
        document.getElementById("weather-bg").style.display = "none";
        document.getElementById("weather-bg").src = "";
        lastSearchType = null;
        lastCity = "";
        lastCoords = null;
        return;
    }
    lastSearchType = "city";
    lastCity = city;
    lastCoords = null;
    fetchWeatherData({ q: city }, opts);
}

async function getWeatherByCoords(lat, lon) {
    lastSearchType = "coords";
    lastCoords = { lat, lon };
    lastCity = "";
    fetchWeatherData({ lat, lon });
}

async function fetchWeatherData(params, opts = {}) {
    const weatherBg = document.getElementById("weather-bg");
    const suggestionMessage = document.getElementById("suggestion-message");

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?${new URLSearchParams({
            ...params,
            appid: WEATHER_API_KEY,
            units: currentUnit
        })}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            document.getElementById("weather-result").style.display = "flex";
            document.getElementById("weather-result").innerHTML = `
                <div style="width:100%;">
                    <h3 id="location">${data.name}, ${data.sys.country}</h3>
                    <div id="main-icon">${iconMap[data.weather[0].main.toLowerCase()] || "🌦️"}</div>
                    <p id="description" style="font-size:1.04rem;margin-bottom:0.5em;">${data.weather[0].description}</p>
                    <div class="weather-info-cards" style="margin-top:10px;">
                        <div class="weather-card">
                            <span style="font-size:1.5em;display:block;margin-bottom:3px;">🌡️</span>
                            <strong>${data.main.temp}${currentUnit === "metric" ? "°C" : "°F"}</strong><br/>Temperature
                        </div>
                        <div class="weather-card">
                            <span style="font-size:1.5em;display:block;margin-bottom:3px;">💧</span>
                            <strong>${data.main.humidity}%</strong><br/>Humidity
                        </div>
                        <div class="weather-card">
                            <span style="font-size:1.5em;display:block;margin-bottom:3px;">💨</span>
                            <strong>${data.wind.speed} ${currentUnit === "metric" ? "m/s" : "mph"}</strong><br/>Wind Speed
                        </div>
                    </div>
                </div>
            `;

            let suggestionObj = suggestionData[data.weather[0].main.toLowerCase()] || suggestionData.default;
            suggestionMessage.textContent = suggestionObj.text;

            const bgSrc = bgImages[data.weather[0].main.toLowerCase()] || bgImages.default;
            weatherBg.src = bgSrc;
            weatherBg.style.display = "block";

            getForecast(data.coord.lat, data.coord.lon);
        } else {
            weatherBg.style.display = "none";
            weatherBg.src = "";
            document.getElementById("weather-result").style.display = "flex";
            document.getElementById("weather-result").innerHTML = `
                <div style="width:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;">
                    <img src="images/error.jpg" alt="Error" class="weather-error-img"/>
                    <div style="color:#f88;font-weight:bold;">City not found!</div>
                </div>
            `;
            document.getElementById("forecast-result").style.display = "none";
            document.getElementById("forecast-result").innerHTML = "";
            suggestionMessage.textContent = "Sorry, we couldn't find that city. Please check the spelling or try another location.";
        }
    } catch (error) {
        weatherBg.style.display = "none";
        weatherBg.src = "";
        document.getElementById("weather-result").style.display = "flex";
        document.getElementById("weather-result").innerHTML = `
            <div style="width:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;">
                <img src="images/error.jpg" alt="Error" class="weather-error-img"/>
                <div style="color:#f88;font-weight:bold;">Unable to fetch weather. Please try again later.</div>
            </div>
        `;
        document.getElementById("forecast-result").style.display = "none";
        document.getElementById("forecast-result").innerHTML = "";
        suggestionMessage.textContent = "Unable to fetch weather. Please try again later.";
    }
}

async function getForecast(lat, lon) {
    const forecastResult = document.getElementById("forecast-result");
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${currentUnit}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.list) {
            forecastResult.style.display = "none";
            forecastResult.innerHTML = "";
            return;
        }

        const days = {};
        data.list.forEach(item => {
            const dt = new Date(item.dt * 1000);
            const day = dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            if (!days[day] && dt.getHours() >= 11 && dt.getHours() <= 13) {
                days[day] = item;
            }
        });

        if (Object.keys(days).length < 5) {
            for (let item of data.list) {
                const dt = new Date(item.dt * 1000);
                const day = dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                if (!days[day]) days[day] = item;
                if (Object.keys(days).length >= 5) break;
            }
        }

        let html = "";
        Object.values(days).slice(0, 5).forEach(item => {
            const dt = new Date(item.dt * 1000);
            const day = dt.toLocaleDateString(undefined, { weekday: 'short' });
            const iconKey = item.weather[0].main.toLowerCase();
            html += `
                <div class="forecast-card">
                    <div class="forecast-date">${day}</div>
                    <div class="forecast-icon">${iconMap[iconKey] || "🌦️"}</div>
                    <div class="forecast-temp">${Math.round(item.main.temp)}${currentUnit === "metric" ? "°C" : "°F"}</div>
                </div>
            `;
        });

        forecastResult.innerHTML = html;
        forecastResult.style.display = "flex";
    } catch (e) {
        forecastResult.style.display = "none";
        forecastResult.innerHTML = "";
    }
}