
import Thunderstorm from "../assets/Thunderstorm.gif";
import Rain from "../assets/Rain.gif";
import SnowDay from "../assets/Snow.gif";
import ClearDay from "../assets/ClearDay.gif";
import ClearNight from "../assets/ClearNight.gif";
import CloudsDay from "../assets/CloudsDay.gif";
import CloudsNight from "../assets/CloudsNight.gif";
import Haze from "../assets/Haze.gif";
import video from "../assets/video1.mp4";

const WeatherBackground = ({ condition }) => {
  const gifs = {
    Thunderstorm,
    Drizzle: Rain,
    Rain,
    Snow: SnowDay,
    Clear: { day: ClearDay, night: ClearNight },
    Clouds: { day: CloudsDay, night: CloudsNight },
    Mist: Haze,
    Smoke: Haze,
    Haze,
    Fog: Haze,
    default: video,
  };

  const background = (() => {
    if (!condition) return video;

    const asset = gifs[condition.main] || gifs.default;

    if (typeof asset === "object") {
      return condition.isDay ? asset.day : asset.night;
    }
    return asset;
  })();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {background === video ? (
        <video autoPlay loop muted className="w-full h-full object-cover pointer-events-none          animate-fade-in" >
          <source src={video} type="video/mp4" />
        </video>
      ) : (
        <img src={background} alt="weather background" className="w-full h-full object-cover opacity-20 pointer-events-none animate-fade-in"/>
      )}

      <div className="absolute inset-0 bg-black/30"></div>
    </div>
  );
};

export default WeatherBackground;
