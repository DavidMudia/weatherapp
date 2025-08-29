const API_KEY = "8c6fdeca9d81701da8114cb30a0d1bc1";

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');

const cityName = document.getElementById('cityName');
const description = document.getElementById('description');
const temp = document.getElementById('temp');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

window.weatherChart = null;

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});

async function getWeather(city) {
    try {
        // Current weather
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!currentRes.ok) {
            const errorData = await currentRes.json();
            throw new Error(errorData.message || 'City not found or invalid API key');
        }
        const currentData = await currentRes.json();
        displayCurrentWeather(currentData);

        // 5-day forecast
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!forecastRes.ok) {
            const errorData = await forecastRes.json();
            throw new Error(errorData.message || 'Forecast not found');
        }
        const forecastData = await forecastRes.json();
        displayForecastChart(forecastData);

    } catch (err) {
        alert(err.message);
    }
}

function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    description.textContent = data.weather[0].description;
    temp.textContent = data.main.temp.toFixed(1);
    humidity.textContent = data.main.humidity;
    wind.textContent = data.wind.speed;
}

function displayForecastChart(data) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    if (window.weatherChart instanceof Chart) {
        window.weatherChart.destroy();
    }

    // Take 5 days, one entry per day (around 12:00)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    const labels = dailyData.map(item => item.dt_txt.split(" ")[0]);
    const temps = dailyData.map(item => item.main.temp);

    window.weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temp (°C)',
                data: temps,
                borderColor: '#1e90ff',
                backgroundColor: 'rgba(30,144,255,0.2)',
                fill: true,
                tension: 0.4,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: false },
                x: { title: { display: true, text: 'Date' } }
            }
        }
    });
}
