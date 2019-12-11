import express from 'express';
import {day10} from './10';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: string = await day10();
    res.send('Solution: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});