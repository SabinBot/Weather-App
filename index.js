let temp = document.getElementById("temp"),
  humidity = document.querySelector(".humidity"),
  wind = document.querySelector(".windSpeed"),
  uv = document.querySelector(".uv");
  visibility = document.querySelector(".visibility"),
  tempUnit = document.querySelectorAll(".tempUnit"),
  precipitation = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  condition = document.getElementById("condition"),
  weatherCards = document.querySelector("#weatherCards"),
  searchInput = document.querySelector("#searchInput"),
  searchForm = document.querySelector("#search"),
  weatherCardsHourly = document.querySelector("#weatherCardsHourly");

function displayDateTime(timezone) {
  let now = new Date();
  let options = {
    timeZone: timezone,
    weekday: "long",
    hour: "numeric",
    hour12: false,
    minute: "2-digit",
  };
  let dateTime = now.toLocaleString("en-US", options);
  document.getElementById("dateTime").innerHTML = dateTime;
}
displayDateTime();


// Get weather from current position
let currentLocation = {
  latitude: 0,
  longitude: 0,
};

function getWeatherData(unit = "c") {
  navigator.geolocation.getCurrentPosition((position) => {
    currentLocation.latitude = position.coords.latitude;
    currentLocation.longitude = position.coords.longitude;

    fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=9d790bfccebc43a0911172128230504&q=${currentLocation.latitude},${currentLocation.longitude}&days=7&aqi=no&alerts=no`,
      {
        method: "GET",
        headers: {},
      }
    )
      .then((res) => res.json())
      .then((data) => {
        updateForecast(data, unit);
        let city = document.querySelector("#location");
        city.innerHTML = `${data.location.name}, ${data.location.region}, ${data.location.country}`;

        let current = data.current;
        let conditionIcon = current.condition.icon;
        let conditionIconDay = document.querySelector("#conditionIconDay");

        if (unit === "c") {
          temp.innerHTML = Math.round(current.temp_c);
        }

        wind.innerHTML = Math.round(current.wind_kph) + " km/h";
        updateWindSpeedStatus(current.wind_kph);
        uv.innerHTML = current.uv;
        updateUvStatus(current.uv);
        humidity.innerHTML = current.humidity + " %";
        updateHumidityStatus(current.humidity);
        visibility.innerHTML = current.vis_km + " km";
        updateVisibiltyStatus(current.vis_km);
        precipitation.innerHTML = "Precipitation " + current.precip_mm + " %";
        conditionIconDay.innerHTML = `<img src="${conditionIcon}" alt="Condition Icon">`;
        condition.innerHTML = current.condition.text;

        changeBackground(current.condition.code); // change background 
        
        console.log(data); 
        let hourlyData = data.forecast.forecastday[0].hour;
        let currentHour = new Date().getHours();

        for (let i = 0; i < hourlyData.length; i++) {
          if (parseInt(hourlyData[i].time.slice(-5, -3)) === currentHour) {
            let currentHourTemp = Math.round(hourlyData[i].temp_c);
            let currentHourIconCondition = hourlyData[i].condition.icon;
            let currentHourIconSrc = getIcon(currentHourIconCondition);

            let currentHourTempUnit = "&#176;C";

            let currentHourCard = document.createElement("div");
            currentHourCard.classList.add("card", "currentHour");

            currentHourCard.innerHTML = `
      <h2 class="hour">Now</h2>
      <div class="cardIcon">
        <img src="${currentHourIconSrc}" class="hourIcon" alt="" />
      </div>
      <div class="hourTemp">
        <h2 class="temp">${currentHourTemp}</h2>
        <span class="tempUnit">${currentHourTempUnit}</span>
      </div>
    `;

            weatherCardsHourly.innerHTML = "";
            weatherCardsHourly.appendChild(currentHourCard);
            break;
          }
        }

        updateHourlyForecast(data, unit);
      });
  });
}
getWeatherData();

// Forecast weather for 7 days
function updateForecast(data) {
  changeBackground(data.current.condition.code); // change background 
  displayDateTime(data.location.tz_id); // timezone
  weatherCards.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    let card = document.createElement("div");
    card.classList.add("card");

    let dayName = getDayName(data.forecast.forecastday[i].date);
    let dayTemp = Math.round(data.forecast.forecastday[i].day.avgtemp_c);

    let iconCondition = data.forecast.forecastday[i].day.condition.icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "&#176;C";

    card.innerHTML = `
        <h2 class="day-name">${dayName}</h2>
        <div class="cardIcon">
          <img src="${iconSrc}" class="day-icon" alt="" />
        </div>
        <div class="dayTemp">
          <h2 class="temp">${dayTemp}</h2>
          <span class="tempUnit">${tempUnit}</span>
        </div>
      `;

    weatherCards.appendChild(card);
  }
}
// Forecast for 24 hours
function updateHourlyForecast(data) {
  weatherCardsHourly.innerHTML = "";

  let hourlyForecast = data.forecast.forecastday[0].hour;
  let currentTime = new Date().getHours();
  let cardCounter = 0;

  for (let i = 0; i < 24; i++) {
    let card = document.createElement("div");
    card.classList.add("card");

    let hour = hourlyForecast[i].time.slice(-5, -3);
    let hourTemp = Math.round(hourlyForecast[i].temp_c);

    let iconCondition = hourlyForecast[i].condition.icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "&#176;C";

    card.innerHTML = `
        <h2 class="hour">${hour}:00</h2>
        <div class="cardIcon">
          <img src="${iconSrc}" class="hourIcon" alt="" />
        </div>
        <div class="hourTemp">
          <h2 class="temp">${hourTemp}</h2>
          <span class="tempUnit">${tempUnit}</span>
        </div>
      `;

    if (parseInt(hour) >= currentTime && cardCounter < 24) {
      weatherCardsHourly.appendChild(card);
      cardCounter++;
    } else if (i < currentTime && cardCounter < 24) {
      weatherCardsHourly.appendChild(card);
      cardCounter++;
    } else if (cardCounter >= 24) {
      break;
    }
  }
}

// Search cities
function searchCity(city, unit) {
  fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=9d790bfccebc43a0911172128230504&q=${city}&days=7&aqi=no&alerts=no`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((res) => res.json())
    .then((data) => {
      updateForecast(data, unit);
      let city = document.querySelector("#location");
      city.innerHTML = `${data.location.name}, ${data.location.region}, ${data.location.country}`;

      let current = data.current;
      let conditionIcon = current.condition.icon;
      let conditionIconDay = document.querySelector("#conditionIconDay");

      temp.innerHTML = Math.round(current.temp_c);

      wind.innerHTML = Math.round(current.wind_kph) + " km/h";
      updateWindSpeedStatus(current.wind_kph);
      uv.innerHTML = current.uv;
      updateUvStatus(current.uv);
      humidity.innerHTML = current.humidity + " %";
      updateHumidityStatus(current.humidity);
      visibility.innerHTML = current.vis_km + " km";
      updateVisibiltyStatus(current.vis_km);
      precipitation.innerHTML = "Precipitation " + current.precip_mm + " %";
      conditionIconDay.innerHTML = `<img src="${conditionIcon}" alt="Condition Icon">`;
      condition.innerHTML = current.condition.text;

      let hourlyData = data.forecast.forecastday[0].hour;
      let currentHour = new Date().getHours();

      for (let i = 0; i < hourlyData.length; i++) {
        if (parseInt(hourlyData[i].time.slice(-5, -3)) === currentHour) {
          let currentHourTemp = Math.round(hourlyData[i].temp_c);
          let currentHourIconCondition = hourlyData[i].condition.icon;
          let currentHourIconSrc = getIcon(currentHourIconCondition);

          let currentHourTempUnit = "&#176;C";

          let currentHourCard = document.createElement("div");
          currentHourCard.classList.add("card", "currentHour");

          currentHourCard.innerHTML = `
      <h2 class="hour">Now</h2>
      <div class="cardIcon">
        <img src="${currentHourIconSrc}" class="hourIcon" alt="" />
      </div>
      <div class="hourTemp">
        <h2 class="temp">${currentHourTemp}</h2>
        <span class="tempUnit">${currentHourTempUnit}</span>
      </div>
    `;
          weatherCardsHourly.innerHTML = "";
          weatherCardsHourly.appendChild(currentHourCard);
          break;
        }
      }
      updateHourlyForecast(data, unit);
    });
}
// button for search cities
searchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevents the default behavior of submit
  let location = searchInput.value;
  if (location === "") {
    return; // Exits the function if the input is empty
  }
  searchCity(location);
});

// Get days
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}
// Get icons

function getIcon(iconCode) {
  return `http:${iconCode}`;
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === 1003 || condition === 1006) {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === 1009 || condition === 1030) {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === 1063 || condition === 1183 || condition === 1186 || condition === 1189 || condition === 1192 || condition === 1195 || condition === 1240 || condition === 1243 || condition === 1246) {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === 1000) {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === 1003 || condition === 1006 || condition === 1009) {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, .5), rgba(0, 0, 0, .5) ),url(${bg})`;
}   

// Get windspeed status
function updateWindSpeedStatus(wind) {
  let windSpeedStatus = document.querySelector(".windSpeedStatus");

  if (wind <= 9) {
    windSpeedStatus.innerHTML = "Light breeze";
  } else if (wind <= 16) {
    windSpeedStatus.innerHTML = "Gentle breeze";
  } else if (wind <= 24) {
    windSpeedStatus.innerHTML = "Moderate breeze";
  } else {
    windSpeedStatus.innerHTML = " Fresh breeze";
  }
}

// Get UV status
function updateUvStatus(uv) {
  let uvStatus = document.querySelector(".uvStatus");

  if (uv <= 5) {
    uvStatus.innerHTML = "Low";
  } else if (uv <= 7) {
    uvStatus.innerHTML = "Moderate";
  } else {
    uvStatus.innerHTML = "High";
  }
}

// Get humidity status
function updateHumidityStatus(humidity) {
  let humidityStatus = document.querySelector(".humidityStatus");

  if (humidity <= 10) {
    humidityStatus.innerHTML = "Low";
  } else if (humidity <= 40) {
    humidityStatus.innerHTML = "Moderate";
  } else {
    humidityStatus.innerHTML = "High";
  }
}

// Get visibility status
function updateVisibiltyStatus(visibility) {
  let visibilityStatus = document.querySelector(".visibilityStatus");

  if (visibility <= 0.05) {
    visibilityStatus.innerHTML = "Dense Fog";
  } else if (visibility <= 0.15) {
    visibilityStatus.innerHTML = "Moderate Fog";
  } else if (visibility <= 0.25) {
    visibilityStatus.innerHTML = "Light Fog";
  } else if (visibility <= 1.35) {
    visibilityStatus.innerHTML = "Very Light Fog";
  } else if (visibility <= 2) {
    visibilityStatus.innerHTML = "Light Mist";
  } else if (visibility <= 5) {
    visibilityStatus.innerHTML = "Very Light Mist";
  } else if (visibility <= 10) {
    visibilityStatus.innerHTML = "Clear";
  } else {
    visibilityStatus.innerHTML = "Very Clear";
  }
}

// Favorite cities button
let favoriteBtn = document.querySelector(".favBtn");
favoriteBtn.addEventListener("click", addToFavorites);
let favoriteCities = document.querySelector(".favoriteCities");

function addToFavorites() {
  let currentCity = document.querySelector("#location").innerHTML;

// Check if there is already a ul element, and create one if not
  let ul = favoriteCities.querySelector("ul");
  if (!ul) {
    ul = document.createElement("ul");
    favoriteCities.appendChild(ul);
  }

// Verify if the city is already in favorites
  let cities = ul.querySelectorAll("li");
  for (let i = 0; i < cities.length; i++) {
    if (cities[i].innerHTML === currentCity) {
      return;
    }
  }

// Create a new li element and add it to the ul
  let li = document.createElement("li");
  li.innerHTML = currentCity;
  ul.appendChild(li);
}
let favCities = document.querySelector(".favCities");
favCities.addEventListener("click", showFavorites);

function showFavorites() {
  favoriteCities.style.display = "block";
}
// Event click outside the div to hide favorite cities
document.addEventListener("click", function (e) {
  // Check if the click happened outside the div
  if (!favoriteCities.contains(e.target) && !favCities.contains(e.target)) {
    favoriteCities.style.display = "none";
  }
});
