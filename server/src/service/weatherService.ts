import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;


  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;

  private apiKey?: string;

  private city?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
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
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
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
      response.city.name,
      response.list[0].dt_txt,
      response.list[0].weather[0].icon,
      response.list[0].weather[0].description,
      response.list[0].main.temp,
      response.list[0].wind.speed,
      response.list[0].main.humidity
    );
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const noonData = weatherData.filter((instance) => instance.dt_txt.includes('12:00:00'));
    const forecastArray: Weather[] = noonData.slice(0, 5).map((instance) => {
      return new Weather (
        currentWeather.city,
        instance.dt_txt,
        instance.weather[0].icon,
        instance.weather[0].description,
        instance.main.temp,
        instance.wind.speed,
        instance.main.humidity
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

      const forecast = this.buildForecastArray(currentWeather, weatherData.list);

      return [currentWeather, ...forecast];
    } catch (err) {
      console.log('Error: ', err);
      return err;
    }
  }
}

export default new WeatherService();
