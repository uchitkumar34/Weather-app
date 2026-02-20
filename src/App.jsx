import { useState, useEffect } from "react";
import WeatherBackground from "./components/WeatherBackground";
import {convertTemperature,getHumidityValue,  getWindDirection,getVisibilityValue,} from './components/Helper';
import {HumidityIcon,SunriseIcon, SunsetIcon,VisibilityIcon, WindIcon,} from "./components/Icon";

const App = () => {

  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");

  // api key
  const API_KEY = "13dcd7b112e314f57fb8d87f581c459b";
  // https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.log}&appid={API_KEY}&units=metric
  //   http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestions(city), 500);
      return () => clearTimeout(timer);
    }
    setSuggestion([]);
  }, [city, weather]);

  // fetch 5 location  suggesion from api and updates

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      res.ok ? setSuggestion(await res.json()) : setSuggestion([]);
    } catch (error) {
      setSuggestion([]);
    }
  };

  //this is fetch data from url
  const fetchWeatherData = async (URL, name = "") => {
    setError("");
    setWeather(null);

    try {
      const response = await fetch(URL);
      if (!response.ok)
        throw new Error((await response.json()).message || " City not found");
      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
      setSuggestion([]);
    } catch (error) {
      setError(error.message);
    }
  };

  // this function drevent form submittion city and data
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a valid city name");
      return;
    }
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`
    );
  };

  return (
    <div className="min-h-screen">
      {/* <WeatherBackground condition={getWeatherCondition} /> */}
      <WeatherBackground condition={getWeatherCondition()} />
      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border-white/30 relative z-10">
          <h1 className="text-4xl font-extrabold text-center mb-6">
            Weather App
          </h1>

          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                type="text"
                placeholder="Enter City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mb-3 p-3 rounded border-white bg-transparent border text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-200"
              />
              
              {suggestion.map((s) => (
                <button
                  key={`${s.lat}-${s.lon}`}
                  type="button"
                  className="block hover:bg-blue-700 px-4 py-2 text-sm text-left w-full cursor-pointer"
                  onClick={() =>
                    fetchWeatherData(
                      `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                      `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                    )
                  }
                >
                  {s.name}, {s.country} {s.state && `, ${s.state}`}
                </button>
              ))}


              <button
                type="submit"
                className=" bg-purple-700 hover:bg-blue-700 text-white cursor-pointer font-semibold py-2 px-4 rounded transition-colors "
              >
                Get Weather
              </button>
            </form>
          ) : (
            <div className="mt-6 text-center transition-opacity duration-300 ">
              <button
                onClick={() => {
                  setWeather(null), setCity("");
                }}
                className="bg-purple-700 hover:bg-blue-600 cursor-pointer text-white font-semibold py-1 px-3 rounded transition-colors "
              >
                New Search
              </button>
              <div className="flex justify-between items-center ">
                <h2 className="text-3xl font-bold"> {weather.name} </h2>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xl cursor-pointer font-semibold py-2 px-4 rounded transition-colors"
                  onClick={() => {
                    setUnit((u) => (u === "C" ? "F" : "C"));
                  }}
                >
                  &deg; {unit}
                </button>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="mx-auto py-4 animate-pulse "
              />
              <p className="text-4xl">
                {convertTemperature(weather.main.temp, unit)} &deg; {unit}
              </p>
              <p className="capitalize"> {weather.weather[0].description} </p>

              <div className="flex flex-wrap justify-around mt-6">
                {[
                  [
                    HumidityIcon, "Humidity", `${weather.main.Humidity}% (${getHumidityValue(weather.main.Humidity)})`,
                  ],
                  [
                    WindIcon, "Wind", `${weather.wind.speed} m/s ${weather.Wind ? `{${getWindDirection(weather.main.Humidity)}}` : ""} `,
                  ],
                  [
                    VisibilityIcon, "Visibility", getVisibilityValue(weather.Visibility),
                  ],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="flex flex-col items-center m-2" >
                    <Icon />
                    <p className="mt-1 font-semibold"> {label} </p>
                    <p className="text-sm"> {value} </p>
                  </div>
                ))}
                <div className="flex flex-wrap justify-around mt-6">
                  {[
                    [SunriseIcon, "sunrise", weather.sys.sunrise],
                    [SunsetIcon, "sunset", weather.sys.sunset],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex flex-col items-center m-2">
                      <p className="mt-1 font-semibold"> {label} </p>
                      <p className="text-sm">
                        {new Date(value * 1000).toLocaleTimeString("en-GB",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-sm">
                  <p>
                    <strong>Feels like:</strong>{" "}
                    {convertTemperature(weather.main.feels_like, unit)} &deg;
                    {unit}{" "}
                  </p>
                  <p>
                    <strong>Pressure</strong> {weather.main.pressure} hPa
                  </p>
                </div>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-center mt-4"> {error} </p>}
        </div>
      </div>
    </div>
  );
};

export default App;
