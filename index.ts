import express from 'express';
import {day4} from './4';
import { runInNewContext } from 'vm';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: number = day4();
    res.send('Solution 4: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});