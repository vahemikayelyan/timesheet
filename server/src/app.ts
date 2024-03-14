import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const host = 'http://localhost';
const port = 3000;

// Use it before all route definitions
app.use(cors({ origin: `${host}:4200` }));

app.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Hello world!' });
});

app.listen(port, () => {
  console.log(`Server is running at ${host}:${port}`);
});
