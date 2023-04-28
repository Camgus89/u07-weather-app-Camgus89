import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudRain, faSnowflake } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [sunriseTime, setSunriseTime] = useState('');
  const [sunsetTime, setSunsetTime] = useState('');
  const [unit, setUnit] = useState('metric'); // default to Celsius
  const [forecastData, setForecastData] = useState(null);
  const [hourlyForecastData, setHourlyForecastData] = useState([]);
  const [userLocation, setUserLocation] = useState(false); // add userLocation state variable
  const [currentDate, setCurrentDate] = useState(''); // add currentDate state variable


  function Footer() {
    return (
      <footer>
        camilla.gustafsson@chasacademy.se
      </footer>
    );
  }

  // Add this code to get the user's current location
  useEffect(() => {
    const success = async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=adbed9b5fb5da9cbb6ba03b8a3c85042`;
      try {
        const response = await axios.get(url);
        setData(response.data);
        setUserLocation(true); // set userLocation to true after getting user's location
      } catch (error) {
        console.log("An error occurred:", error);
      }
    };

    const error = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    // check if userLocation is false before getting user's location
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  }, [unit, userLocation]); // add userLocation to useEffect dependencies

  // Add this code to update the current date
  useEffect(() => {
    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      week: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    const date = new Date();
    setCurrentDate(date.toLocaleString('en-EN', options));
  }, []);

  const getForecastData = async () => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&units=metric&appid=adbed9b5fb5da9cbb6ba03b8a3c85042`;
    try {
      const response = await axios.get(url);
      setForecastData(response.data);
      setHourlyForecastData(response.data.list.slice(0, 5 * 8)); // get 5 days of hourly forecast data
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

  const getWeatherIcon = (condition, unit) => {
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
  }, [data, unit]);

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
        <div className="current-date">{currentDate}</div>
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
            <button className="change" onClick={toggleUnit}>{unit === 'imperial' ? 'Switch to Celsius' : 'Switch to Fahrenheit'}</button>
          </div>
          <div className="description">
            {data?.weather && <p>{data.weather[0].main}</p>}
          </div>
          <div className="icon">
            {data?.weather && getWeatherIcon(data.weather[0].main)}
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
          <hr></hr>
          <p>Daily weather</p>
          <div className="hourly-forecast">
            {hourlyForecastData.map((forecast) => (
              <div className="hourly-forecast-item" key={forecast.dt}>
                <p>{new Date(forecast.dt * 1000).toLocaleTimeString()}</p>
                <div>{getWeatherIcon(forecast.weather[0].main)}</div>
                <p>{`${unit === 'metric' ? forecast.main.temp.toFixed() : (forecast.main.temp * 1.8 + 32).toFixed()}${unit === 'metric' ? '°C' : '°F'}`}</p>
                <p>{`${forecast.wind.speed} m/s`}</p>
                <p>{`${forecast.main.humidity}%`}</p>
              </div>

            ))}

          </div>
        </div>
        <hr></hr>
        <div className='sunrise'>
          {sunriseTime && <p>Sunrise time: {sunriseTime}</p>}
          <div className='sunset'>
            {sunsetTime && <p>Sunset time: {sunsetTime}</p>}
          </div>
        </div>
        <hr></hr>
        <p>Weekly weather</p>
        <div className='forecast'>
          <Forecast />

        </div>
        <hr></hr>
        <div className='footer'>
          <Footer />
        </div>
      </div>

    </div>

  );
};

export default App;

