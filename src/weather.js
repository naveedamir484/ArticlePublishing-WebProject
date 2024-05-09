const https = require('https');


function getWeather(city, callback) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPEN_WEATHER_ID}&units=metric`;

    https.get(url, resp => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
            const weatherData = JSON.parse(data);
            const temp = weatherData.main?.temp || 25.0; 
            const url = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`; 
            callback(null, { temp, url });
        });
    }).on('error', err => callback(err, { temp: 25.0, 
                                          url: 'https://openweathermap.org/img/wn/01d@2x.png' 
                                        })); // Return default values if there is an error
}

module.exports = { getWeather };




