import { Router, type Request, type Response } from "express";
const router = Router();

import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

// POST route to retrieve weather data for a city
// The city name is passed in the request body
router.post("/", async (req: Request, res: Response) => {
  const cityName = req.body.cityName;

  // Check if city name is provided in the request body
  if (!cityName) {
    return res.status(400).json({ msg: "City name is required" });
  }

  // GET weather data from city name
  try {
    // Get weather data for the provided city name using WeatherService
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // Save the searched city to search history using HistoryService
    await HistoryService.addCity(cityName);

    // Return the retrieved weather data as JSON
    return res.json(weatherData);
  } catch (err) {
    // Log any errors and return a 500 status code for server errors
    console.log(err);
    return res.status(500).json(err);
  }
});

// GET route to retrieve the search history of saved cities
router.get("/history", async (_req: Request, res: Response) => {
  try {
    // Get all saved cities from search history using HistoryService
    const savedCities = await HistoryService.getCities();

    // Return the saved cities as JSON
    return res.json(savedCities);
  } catch (err) {
    // Log any errors and return a 500 status code for server errors
    console.log(err);
    return res.status(500).json(err);
  }
});

// DELETE route to remove a city from the search history by its id
router.delete("/history/:id", async (req: Request, res: Response) => {
  try {
    // Check if city id is provided in the request parameters
    if (!req.params.id) {
      return res.status(400).json({ msg: "City id is required" });
    }
    // Remove the city with the given id from the search history
    await HistoryService.removeCity(req.params.id);

    // Return a success message indicating the city was removed
    return res.json({
      success: "City successfully removed from search history",
    });
  } catch (err) {
    // Log any errors and return a 500 status code for server errors
    console.log(err);
    return res.status(500).json(err);
  }
});

export default router;
