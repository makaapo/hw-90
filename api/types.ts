import { WebSocket } from 'ws';

export interface ActiveConnections {
  [id: string]: WebSocket;
}

export interface Dot {
  x: number;
  y: number;
}

export interface IncomingMessage {
  type: string;
  payload: Dot;
}