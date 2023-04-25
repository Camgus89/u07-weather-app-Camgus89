import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudRain, faSnowflake, faWind } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [sunriseTime, setSunriseTime] = useState('');
  const [sunsetTime, setSunsetTime] = useState('');
  const [unit, setUnit] = useState('metric'); // default to Celsius
  const [forecastData, setForecastData] = useState(null);

  const getForecastData = async () => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&units=${unit}&appid=adbed9b5fb5da9cbb6ba03b8a3c85042`;
    try {
      const response = await axios.get(url);
      setForecastData(response.data);
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };

  const searchLocation = async (event) => {
    if (event.key === 'Enter') {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=adbed9b5fb5da9cbb6ba03b8a3c85042`;
      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.log('An error occurred:', error);
      }
      setLocation('');
    }
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return <FontAwesomeIcon icon={faSun} />;
      case 'Clouds':
        return <FontAwesomeIcon icon={faCloud} />;
      case 'Rain':
      case 'Drizzle':
        return <FontAwesomeIcon icon={faCloudRain} />;
      case 'Snow':
        return <FontAwesomeIcon icon={faSnowflake} />;
      default:
        return <FontAwesomeIcon icon={faSun} />;
    }
  };

  useEffect(() => {
    if (data && data.sys && data.weather) {
      getForecastData();
      const sunriseDate = new Date(data.sys.sunrise * 1000);
      const sunsetDate = new Date(data.sys.sunset * 1000);
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      const formattedSunrise = sunriseDate.toLocaleTimeString('en-US', options);
      const formattedSunset = sunsetDate.toLocaleTimeString('en-US', options);
      setSunriseTime(formattedSunrise);
      setSunsetTime(formattedSunset);
    }
  }, [data]);

<div className="forecast">
  {forecastData && forecastData.list.slice(0, 5).map((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const icon = getWeatherIcon(forecast.weather[0].main);
    const temperature = unit === 'metric' 
      ? `${forecast.main.temp.toFixed()} °C`
      : `${(forecast.main.temp * 9 / 5 + 32).toFixed()} °F`;
    return (
      <div className="forecast-item" key={forecast.dt}>
        <p>{dayOfWeek}</p>
        <div>{icon}</div>
        <p>{temperature}</p>
      </div>
    );
  })}
</div>

const Forecast = () => {
  if (!forecastData) {
    return null;
  }

  const options = {
    weekday: 'long',
    hour: 'numeric',
    hour12: true
  };

  return (
    <div className="forecast">
      {forecastData.list.map((item, index) => {
        if (index % 8 !== 0) {
          return null;
        }

        const date = new Date(item.dt * 1000);
        const formattedDate = date.toLocaleDateString('en-US', options);
        const icon = getWeatherIcon(item.weather[0].main);

        return (
          <div className="forecast-item" key={item.dt}>
            <div>{formattedDate}</div>
            <div>{icon}</div>
            <div>
              {unit === 'metric'
                ? `${item.main.temp.toFixed()} °C`
                : `${(item.main.temp * 9 / 5 + 32).toFixed()} °F`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

  return (
<div className="app">
  <div className="search">
    <div className='change'>
      Choose degree:
      <button className="unit-btn" onClick={toggleUnit}>
        {unit === "metric" ? "Fahrenheit" : "Celsius"}
      </button>
    </div>
    <input
      value={location}
      onChange={(event) => setLocation(event.target.value)}
      onKeyPress={searchLocation}
      placeholder='Enter Location'
      type="text" />
  </div>
  <div className="container">
    <div className="top">
      <div className="location">
        <p>{data?.name}</p>
      </div>
      <div className="temp">
        {data?.main && (
          <h1>
            {unit === 'metric'
              ? `${data.main.temp.toFixed()} °C`
              : `${(data.main.temp * 9 / 5 + 32).toFixed()} °F`}
          </h1>
        )}
      </div>
      <div className="description">
      {data?.weather && <p>{data.weather[0].main}</p>}
      </div>
      <div className="icon">
        {data?.weather && getWeatherIcon(data.weather[0].main)}
      </div>
    </div>
    <div className='sunrise'>
      {sunriseTime && <p>Sunrise time: {sunriseTime}</p>}
      <div className='sunset'>
        {sunsetTime && <p>Sunset time: {sunsetTime}</p>}
      </div>
    </div>
    {data?.name !== undefined &&
      <div className="bottom">
        <div className="feels">
          {data?.main && (
            <p className='bold'>
              {unit === 'metric'
                ? `${data.main.feels_like.toFixed()} °C`
                : `${(data.main.feels_like * 9 / 5 + 32).toFixed()} °F`}
            </p>
          )}
          <p>Feels Like</p>
        </div>
        <div className="humidity">
          {data?.main && <p className='bold'>{data.main.humidity}%</p>}
          <p>Humidity</p>
        </div>
        <div className="wind">
          {data?.wind && <p className='bold'>{data.wind.speed.toFixed()} {unit === 'metric' ? 'KPH' : 'MPH'}</p>}
          <p>Wind Speed</p>
        </div>
      </div>
    }
    <div className='forecast'>
      <Forecast />
    </div>
  </div>
</div>
      
  );
};

export default App;

