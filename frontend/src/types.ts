export interface Dot {
  x: number;
  y: number;
}
export interface IncomingHistory {
  type: 'DRAW_DOTS';
  payload: Dot;
}

export interface IncomingDots {
  type: 'DRAW_HISTORY';
  payload: Dot[];
}

export interface IncomingWelcomeMessage {
  type: 'WELCOME';
  payload: string;
}
export type IncomingMessage =
  | IncomingDots
  | IncomingWelcomeMessage
  | IncomingHistory;