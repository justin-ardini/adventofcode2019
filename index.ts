import express from 'express';
import {day9} from './9';
import { runInNewContext } from 'vm';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: string = await day9();
    res.send('Solution 9: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});