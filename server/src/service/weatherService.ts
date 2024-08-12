import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  cityName: string;
  date: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;

  constructor(
    cityName: string,
    date: string,
    temperature: number,
    description: string,
    icon: string,
    humidity: number,
    windSpeed: number
  ) {
    this.cityName = cityName;
    this.date = date;
    this.temperature = temperature;
    this.description = description;
    this.icon = icon;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;

  private apiKey?: string;

  private city?: string;

  constructor() {
    this.baseURL = process.env.WEATHER_API_BASE_URL || '';
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.city = '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      const locationData = await response.json();
      return locationData;

    } catch (err) {
      console.log('Error: ', err);
      return err;
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely&appid=${this.apiKey}`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    try {
      const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
      return this.destructureLocationData(locationData[0]);
    } catch (err) {
      console.log('Error: ', err);
      return err;
    }
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)
      );

      const weatherData = await response.json();
      return weatherData;
    } catch (err) {
      console.log('Error: ', err);
      return err;
    }
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    return new Weather(
      this.city!,
      new Date(response.current.dt * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      response.current.temp,
      response.current.weather[0].description,
      response.current.weather[0].icon,
      response.current.humidity,
      response.current.wind_speed
    );
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray: Weather[] = weatherData.map((instance) => {
      return new Weather (
        currentWeather.cityName,
        new Date(instance.dt * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        instance.temp.day,
        instance.weather[0].description,
        instance.weather[0].icon,
        instance.humidity,
        instance.wind_speed
      );
    });
    return forecastArray;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.city = city;

      const coordinates = await this.fetchAndDestructureLocationData() as Coordinates;

      const weatherData = await this.fetchWeatherData(coordinates);

      const currentWeather = this.parseCurrentWeather(weatherData);

      const forecast = this.buildForecastArray(currentWeather, weatherData.daily);

      return forecast;
    } catch (err) {
      console.log('Error: ', err);
      return err;
    }
  }
}

export default new WeatherService();
