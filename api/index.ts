import expressWs from 'express-ws';
import express from 'express';
import cors from 'cors';
import {ActiveConnections, IncomingMessage, Dot} from './types';

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
  ws.send(JSON.stringify({type: 'WELCOME', payload: 'You are connected'}));
  ws.on('message', (message) => {
    console.log(message.toString());
    const parsedPixels = JSON.parse(message.toString()) as IncomingMessage;
    history.push(parsedPixels.payload);
    if (parsedPixels.type === 'DRAW_DOTS') {
      Object.values(activeConnections).forEach((connection) => {
        connection.send(JSON.stringify(history));
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