import express from 'express';
import {day5} from './5';
import { runInNewContext } from 'vm';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: number = await day5();
    res.send('Solution 5: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});