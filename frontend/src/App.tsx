import React, {useEffect, useRef, useState} from 'react';
import {IncomingDots, Dots} from './types';

const App = () => {
  const [dots, setDots] = useState<Dots[]>([]);
  const [newDots, setNewDots] = useState<Dots | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');
    ws.current.addEventListener('close', () => console.log('ws closed'));
    ws.current.addEventListener('message', (event) => {
      const decodedMessage = JSON.parse(event.data) as IncomingDots;
      if (decodedMessage.type === 'DRAW_DOTS') {
        setDots(decodedMessage.payload);
      }
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    contextRef.current = context;
    void drawOnStart();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const drawOnStart = () => {
    if (!contextRef.current || !canvasRef.current) return;
    const context = contextRef.current;
    dots.forEach((dot) => {
      if (context) {
        context.fillStyle = dot.color;
        context.fillRect(dot.x, dot.y, 1, 1);
      }
    });
  };

  const sendMessage = () => {
    if (!ws.current) return;
    ws.current.send(
      JSON.stringify({
        type: 'NEW_DOTS',
        payload: newDots,
      }),
    );
  };
  const startDrawing = ({nativeEvent}: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return;
    const {offsetX, offsetY} = nativeEvent;
    setIsDrawing(true);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };
  const finishDrawing = () => {
    if (!contextRef.current) return;
    setIsDrawing(false);
    contextRef.current.closePath();
    const canvas = canvasRef.current;
    if (!canvas) return;
  };
  const draw = ({nativeEvent}: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    const {offsetX, offsetY} = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    setNewDots({x: offsetX, y: offsetY, color: 'black'});
    sendMessage();
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        width="1024"
        height="768"
        style={{border: '1px solid black'}}
      />
    </div>
  );
};

export default App;