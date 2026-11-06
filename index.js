const getWeatherData = async () => {
  try {
    const res = await fetch(
      "https://pub-54904ef3b9374b6c9f80cf1763a31f5b.r2.dev/cc-datas/weather-data.json",
    );

    if (!res.ok) {
      console.log("Дата авахад алдаа гарлаа");
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Дата авахад алдаа гарлаа", error);
    return null;
  }
};
const parseWeather = (rawData) => {
  if (!rawData) return;

  const taskOne = {
    city: rawData.location.name,
    country: rawData.location.country,
    current: {
      temp: rawData.current.temp_c,
      condition: rawData.current.condition.text,
      humidity: rawData.current.humidity,
      airQuality: {
        pm2_5: rawData.current.air_quality.pm2_5,
        pm10: rawData.current.air_quality.pm10,
        o3: rawData.current.air_quality.o3,
        no2: rawData.current.air_quality.no2,
        so2: rawData.current.air_quality.so2,
        co: rawData.current.air_quality.co,
      },
    },
  };

    const secondStep = {
      forecast: rawData.forecast.forecastday.slice(0, 3).map((day) => {
        return {
          date: day.date,

          min: day.day.mintemp_c ?? day.day.minTemp,
          max: day.day.maxtemp_c ?? day.day.maxTemp,

          condition: day.day.condition.text,
        };
      }),
    };

    const thirdStep = {
      today: (() => {
        const hours = rawData.forecast.forecastday[0].hour;

        const validHours = hours.filter(
          (hour) => hour.temp_c !== null || hour.feelslike_c !== null,
        );

        const avgTemp =
          validHours.reduce((sum, hour) => {
            return sum + (hour.temp_c ?? hour.feelslike_c);
          }, 0) / validHours.length;

        const maxWind = Math.max(
          ...hours.map((hour) => (hour.wind_kph) ?? 0),
        );

        const precipTotal = hours.reduce((sum, hour) => {
          return sum + ((hour.precip_mm) ?? 0);
        }, 0);

        return {
          date: rawData.forecast.forecastday[0].date,
          avgTemp: validHours.length ? Math.round(avgTemp * 10) / 10 : null,
          maxWind,
          precipTotal: Math.round(precipTotal * 10) / 10,
        };
      })(),
    };
  return {
    task_1: taskOne,
    task_2: secondStep,
    task_3: thirdStep,
  };
};

const main = async () => {
  const rawData = await getWeatherData();

  console.dir(parseWeather(rawData), { depth: 20 });
};

main();
