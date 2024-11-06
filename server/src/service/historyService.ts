import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

// Define a City class to represent a city with name and id properties
class City {
  name: string;
  id: string;

  // Constructor to initialize the City object with name and a unique id
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// HistoryService class handles reading and writing cities to the searchHistory.json file
class HistoryService {
  // Method to read data from the searchHistory.json file
  // Opens the file with 'a+' flag to create it if it doesn't exist
  private async read() {
    return await fs.readFile("db/searchHistory.json", {
      flag: "a+",
      encoding: "utf-8",
    });
  }

  // Method to write updated cities array to the searchHistory.json file
  // Converts the cities array into a JSON string and writes it to the file
  private async write(cities: City[]) {
    return await fs.writeFile(
      "db/searchHistory.json",
      JSON.stringify(cities, null, "\t")
    );
  }

  // Method to get the list of cities from the searchHistory.json file
  // Reads the file, parses it, and returns an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let parsedCities: City[];

      // Try to parse the file contents; if parsing fails, return an empty array
      try {
        parsedCities = JSON.parse(cities) || [];
      } catch (err) {
        // Log the error if parsing fails and return an empty array as fallback
        console.error("Error parsing JSON data from searchHistory.json:", err);
        parsedCities = [];
      }

      return parsedCities;
    });
  }

  // Method to add a new city to the search history
  // It checks if the city already exists before adding and assigns a unique id to the city
  async addCity(city: string) {
    if (!city) {
      // Throw an error if the city name is blank
      throw new Error("City cannot be blank");
    }

    // Create a new City object with a unique id
    const newCity: City = { name: city, id: uuidv4() };

    return await this.getCities()
      .then((cities) => {
        // Check if the city already exists in the history
        if (cities.find((index) => index.name === city)) {
          return cities; // Return the existing cities if the city is already present
        }
        // Add the new city to the list of cities
        return [...cities, newCity];
      })
      .then((updatedCities) => this.write(updatedCities)) // Write the updated cities list to the file
      .then(() => newCity); // Return the newly added city
  }

  // BONUS: Method to remove a city from the search history by its id
  // Filters out the city with the specified id and writes the updated list back to the file
  async removeCity(id: string) {
    return await this.getCities()
      .then((cities) => cities.filter((city) => city.id !== id)) // Remove the city with matching id
      .then((updatedCities) => this.write(updatedCities)); // Write the updated cities list to the file
  }
}

// Export an instance of HistoryService for use in other parts of the application
export default new HistoryService();
