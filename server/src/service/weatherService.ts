import dotenv from "dotenv";
dotenv.config();

// Define an interface for the Coordinates object to hold latitude and longitude
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object to store weather details
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  // Constructor to initialize the Weather object with weather details
  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    // Format the date and assign values to the instance
    this.city = city;
    this.date = new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// WeatherService class handles API calls and processes weather data
class WeatherService {
  // Base URL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private city?: string;

  // Constructor initializes the base URL and API key from environment variables
  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.API_KEY || "";
    this.city = "";
  }

  // Fetch location data (coordinates) from the OpenWeather API based on city name
  private async fetchLocationData(query: string) {
    // Check if the API key is missing
    if (!this.apiKey) {
      throw new Error("API key is missing. Please add a valid API key.");
    }

    try {
      const response = await fetch(query); // Make API request

      // Check for invalid API key (status code 401)
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your API key.");
      }

      // Check for other errors, such as 404 or 500
      if (!response.ok) {
        throw new Error(`Error fetching location data: ${response.statusText}`);
      }

      const locationData = await response.json(); // Parse the response JSON
      return locationData;
    } catch (err) {
      // Log any errors encountered during the fetch
      console.log("Error: ", err);
      return err;
    }
  }

  // Destructure the coordinates from the location data
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // Build the API query to fetch the geocode (coordinates) based on the city name
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
  }

  // Build the API query to fetch the weather data using the coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Fetch and destructure the location data to get the coordinates for the city
  private async fetchAndDestructureLocationData() {
    try {
      const locationData = await this.fetchLocationData(
        this.buildGeocodeQuery() // Get location data
      );
      return this.destructureLocationData(locationData[0]); // Extract coordinates
    } catch (err) {
      // Log any errors encountered during the process
      console.log("Error: ", err);
      return err;
    }
  }

  // Fetch the weather data using the coordinates from the location data
  private async fetchWeatherData(coordinates: Coordinates) {
    // Check if the API key is missing
    if (!this.apiKey) {
      throw new Error("API key is missing. Please add a valid API key.");
    }

    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)); // Make API request for weather data

      // Check for invalid API key (status code 401)
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your API key.");
      }

      // Check for other errors, such as 404 or 500
      if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }

      const weatherData = await response.json(); // Parse the weather data
      return weatherData;
    } catch (err) {
      // Log any errors encountered during the fetch
      console.log("Error: ", err);
      return err;
    }
  }

  // Parse the current weather from the API response
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

  // Build an array of Weather objects for the 5-day forecast
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    // Filter weather data to get the forecast for 12:00 PM each day
    const noonData = weatherData.filter((instance) =>
      instance.dt_txt.includes("12:00:00")
    );

    // Map each instance to a new Weather object and return an array of forecasts
    const forecastArray: Weather[] = noonData.slice(0, 5).map((instance) => {
      return new Weather(
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

  // Main method to fetch weather data for a city, including current weather and 5-day forecast
  async getWeatherForCity(city: string) {
    try {
      this.city = city; // Set the city name

      // Fetch and destructure location data to get the coordinates
      const coordinates =
        (await this.fetchAndDestructureLocationData()) as Coordinates;

      // Fetch weather data using the coordinates
      const weatherData = await this.fetchWeatherData(coordinates);

      // Parse the current weather data
      const currentWeather = this.parseCurrentWeather(weatherData);

      // Build the 5-day forecast array
      const forecast = this.buildForecastArray(
        currentWeather,
        weatherData.list
      );

      // Return an array with the current weather followed by the forecast
      return [currentWeather, ...forecast];
    } catch (err) {
      // Log any errors encountered during the process
      console.log("Error: ", err);
      return err;
    }
  }
}

// Export an instance of WeatherService for use in other parts of the application
export default new WeatherService();
