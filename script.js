// funktion som hämtar koordinater för en stad
async function getCoordinates(city) {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0){
        throw new Error("Staden hittades ej, var vänlig försök igen!")
    }

    const latitude = geoData.results[0].latitude;
    const longitude = geoData.results[0].longitude;

    return {latitude,longitude};
}
// funktion som returnerar veckodagen från ett datum
function getDayOfWeek(dateString){
    const date = new Date(dateString);
    const days = ["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"];
    return days[date.getDay()];
}

// funktion som hämtar väderprognos för 7 dagar
async function getWeatherForecast(latitude, longitude) {
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`);
    const weatherData = await weatherResponse.json();
    return {
        daily: weatherData.daily,
        current: weatherData.current_weather.temperature
    };
}

//funktion som genererar väder-emojis baserat på stadens "weathercode" 
function getWeatherEmoji(weatherCode) {
    switch (true){
        case weatherCode === 0: return "☀️";
        case weatherCode === 1: return "🌤️";
        case weatherCode === 2: return "🌥️";
        case weatherCode === 3: return "☁️" ;
        case weatherCode >= 45 && weatherCode < 48: return "🌫️";
        case weatherCode >= 51 && weatherCode < 67: return "🌧️"; 
        case weatherCode >= 80 && weatherCode < 83: return "🌧️";
        case weatherCode >= 71 && weatherCode < 75: return "🌨️";
        case weatherCode === 85: return "🌨️";
        case weatherCode === 86: return "🌨️";
        case weatherCode === 77: return "❄️";
        case weatherCode >= 95 && weatherCode < 99 : return "🌩️"; // OM det blir nederbörd, kan den då ändra emoji här? det borde gå med "precipitation_sum"
        default: return "❓";
        
    }
}

// funktion som uppdaterar väderinformationen i HTML
function displayWeather(city, weatherData) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    const cityTitle = document.createElement("h2");
    cityTitle.textContent = `Prognos för: ${city}`;
    forecastContainer.appendChild(cityTitle);

    const currentTempElement = document.createElement("p");
    currentTempElement.className = "current-temperature";
    currentTempElement.textContent = `Nuvarande temperatur: ${weatherData.current}°C`;
    forecastContainer.appendChild(currentTempElement);

    weatherData.daily.time.forEach((date, index) => {
        const weatherCode = weatherData.daily.weathercode[index];
        const maxTemp = weatherData.daily.temperature_2m_max[index];
        const minTemp = weatherData.daily.temperature_2m_min[index];
        const emoji = getWeatherEmoji(weatherCode);
        const precipitation = weatherData.daily.precipitation_sum[index];
        const dayOfWeek = getDayOfWeek(date);

        console.log(`Datum: ${date}, WeatherCode: ${weatherCode}`);

        const dayElement = document.createElement("div");
        dayElement.className = "day";
        dayElement.innerHTML = `
            <h3>${dayOfWeek}</h3>
            <h3>${date}</h3>
            <p>Max: ${maxTemp}°C</p>
            <p>Min: ${minTemp}°C</p>
            <p>${emoji}</p>
            <p>${precipitation} mm</p>
        `;
        forecastContainer.appendChild(dayElement);
    });
}


// funktion som hanterar sökning från användaren
async function handleSearch(){
    const cityInput = document.getElementById("city-input");
    const city = cityInput.value;

    //
    if (!city){
        alert("Skriv in en stad!");
        return;
    }
    //
    try {
        const { latitude,longitude } = await getCoordinates(city);
        const weatherData = await getWeatherForecast(latitude,longitude);
        displayWeather(city, weatherData);
    } catch (error) {
        alert(error.message);
    }
}

//eventlistener för sökknappen
document.getElementById("search-button").addEventListener("click", handleSearch);