import express from 'express';
import {day2} from './2';
import { runInNewContext } from 'vm';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: number = await day2();
    res.send('Solution 2: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});