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
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search for a city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="p-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white focus:outline-none focus:border-blue-400 focus:bg-white/20 transition duration-200 font-medium"
              />
              
              {suggestion.length > 0 && (
                <div className="bg-white/5 rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                  {suggestion.map((s) => (
                    <button
                      key={`${s.lat}-${s.lon}`}
                      type="button"
                      className="block hover:bg-blue-500/30 px-4 py-3 text-sm text-left w-full cursor-pointer border-b border-white/5 last:border-b-0 transition duration-150"
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                          `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                        )
                      }
                    >
                      <p className="font-medium text-white">{s.name}</p>
                      <p className="text-xs text-gray-100">{s.country} {s.state && `• ${s.state}`}</p>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white cursor-pointer font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-lg mt-2"
              >
                Get Weather
              </button>
            </form>
          ) : (
            <div className="mt-8 text-center transition-opacity duration-300">
              <button
                onClick={() => {
                  setWeather(null), setCity("");
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 mb-4"
              >
                New Search
              </button>

              {/* Header with City and Unit Toggle */}
              <div className="flex justify-between items-center mb-6 bg-white/10 p-4 rounded-lg">
                <h2 className="text-4xl font-bold"> {weather.name} </h2>
                <button
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg cursor-pointer font-semibold py-2 px-5 rounded-lg transition-all duration-200"
                  onClick={() => {
                    setUnit((u) => (u === "C" ? "F" : "C"));
                  }}
                >
                  &deg; {unit}
                </button>
              </div>

              {/* Weather Icon and Temperature */}
              <div className="bg-white/10 rounded-lg p-6 mb-6">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto h-20 w-20 animate-bounce"
                />
                <p className="text-5xl font-bold mt-2">
                  {convertTemperature(weather.main.temp, unit)}&deg;
                </p>
                <p className="text-lg mt-2 capitalize text-white">
                  {weather.weather[0].description}
                </p>
              </div>

              {/* Main Weather Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  [
                    HumidityIcon, "Humidity", `${weather.main.humidity}%`,
                  ],
                  [
                    WindIcon, "Wind", `${weather.wind.speed} m/s`,
                  ],
                  [
                    VisibilityIcon, "Visibility", getVisibilityValue(weather.visibility),
                  ],
                ].map(([Icon, label, value]) => (
                  <div
                    key={label}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200 backdrop-blur"
                  >
                    <div className="flex justify-center mb-2">
                      <Icon />
                    </div>
                    <p className="font-semibold text-sm text-gray-100">{label}</p>
                    <p className="text-lg font-bold mt-1 text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Sunrise and Sunset */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  [SunriseIcon, "Sunrise", weather.sys.sunrise],
                  [SunsetIcon, "Sunset", weather.sys.sunset],
                ].map(([Icon, label, value]) => (
                  <div
                    key={label}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200 backdrop-blur"
                  >
                    <div className="flex justify-center mb-2">
                      <Icon />
                    </div>
                    <p className="font-semibold text-sm text-gray-100">{label}</p>
                    <p className="text-lg font-bold mt-1 text-white">
                      {new Date(value * 1000).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Additional Details */}
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-100">Feels Like</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {convertTemperature(weather.main.feels_like, unit)}&deg;
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-100">Pressure</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {weather.main.pressure} hPa
                    </p>
                  </div>
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
