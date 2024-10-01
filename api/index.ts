import expressWs from 'express-ws';
import express from 'express';
import cors from 'cors';
import {ActiveConnections, Dot, IncomingDots} from './types';

const app = express();
expressWs(app);
const port = 8000;
app.use(cors());
const router = express.Router();
const activeConnections: ActiveConnections = {};
const history: Dot[] = [];
router.ws('/canvas', (ws, _req) => {
  const id = crypto.randomUUID();
  console.log('Client connected id= ', id);
  activeConnections[id] = ws;
  ws.send(JSON.stringify({type: 'DRAW_HISTORY', payload: history}));
  ws.send(JSON.stringify({type: 'WELCOME', payload: 'You are connected'}));
  ws.on('message', (message) => {
    console.log(message.toString());
    const parsedDots = JSON.parse(message.toString()) as IncomingDots;
    history.push(parsedDots.payload);
    if (parsedDots.type === 'NEW_DOTS') {
      Object.values(activeConnections).forEach((connection) => {
        const outgoing = {
          type: 'DRAW_DOTS',
          payload: parsedDots.payload,
        };
        connection.send(JSON.stringify(outgoing));
      });
    }
  });
  ws.on('close', () => {
    console.log('Client disconnected, ', id);
    delete activeConnections[id];
  });
});
app.use(router);
app.listen(port, () => {
  console.log('Server online on port ', port);
});