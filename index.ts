import express from 'express';
import {day7} from './7';
import { runInNewContext } from 'vm';

const app = express();

app.get('/', async (req, res, next) => {
  try {
    const solution: number = await day7();
    res.send('Solution 7: ' + solution);
  } catch (error) {
    return next(error);
  }
});

app.listen(8000, () => {
  console.log('App listening on http://localhost:8000')
});