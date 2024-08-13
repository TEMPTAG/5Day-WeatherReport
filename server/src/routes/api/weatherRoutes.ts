import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const cityName = req.body.cityName;

  if (!cityName) {
    return res.status(400).json({ msg: 'City name is required' });
  }

  // TODO: GET weather data from city name
  try {
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // TODO: save city to search history
    await HistoryService.addCity(cityName);

    return res.json(weatherData);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {  try {
    const savedCities = await HistoryService.getCities();
    return res.json(savedCities);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {  try {
    if (!req.params.id) {
      return res.status(400).json({ msg: 'City id is required' });
    }
    await HistoryService.removeCity(req.params.id);
    return res.json({ success: 'City successfully removed from search history'});
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export default router;
