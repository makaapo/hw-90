export interface Dot {
  x: number;
  y: number;
}
export interface IncomingDots {
  type: 'DRAW_HISTORY';
  payload: Dot[];
}

export interface IncomingHistory {
  type: 'DRAW_DOTS';
  payload: Dot;
}

export type IncomingMessage = IncomingDots | IncomingHistory;