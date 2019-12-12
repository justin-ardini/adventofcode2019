import express from 'express';
import {day11} from './11';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: string = await day11();
    res.send('Solution: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});