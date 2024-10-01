export interface Dots {
  x: number;
  y: number;
  color: 'black';
}
export interface IncomingDots {
  type: 'DRAW_DOTS';
  payload: Dots[];
}