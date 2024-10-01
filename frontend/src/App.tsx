import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dot, IncomingMessage} from './types';

const App = () => {
  const [dots, setDots] = useState<Dot[]>([]);
  const [history, setHistory] = useState<Dot[]>([]);
  const [newDots, setNewDots] = useState<Dot | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onclose = () => {
      console.log('ws closed');
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    contextRef.current = context;

    ws.current.onmessage = (event) => {
      const decodedDraw = JSON.parse(event.data) as IncomingMessage;

      if (decodedDraw.type === 'DRAW_HISTORY') {
        setHistory((prevPixels) => [...prevPixels, ...decodedDraw.payload]);
      }

      if (decodedDraw.type === 'DRAW_DOTS') {
        setDots((prevState) => [...prevState, decodedDraw.payload]);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendDrawing = () => {
    if (!ws.current) return;

    ws.current.send(
      JSON.stringify({
        type: 'NEW_DOTS',
        payload: newDots,
      }),
    );
  };

  const finishDrawing = () => {
    sendDrawing();
  };

  const draw = ({nativeEvent}: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;

    const context = contextRef.current;
    if (!context) return;

    const {offsetX, offsetY} = nativeEvent;

    context.fillRect(offsetX, offsetY, 2, 2);
    setNewDots({x: offsetX, y: offsetY});
  };

  const drawDots = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;

    dots.forEach((dot) => {
      if (dot) {
        if (context) {
          context.fillRect(dot.x, dot.y, 2, 2);
        }
      }
    });
  }, [dots]);

  const drawOnStart = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;

    const context = contextRef.current;

    history.forEach((dot) => {
      if (dot) {
        if (context) {
          context.fillRect(dot.x, dot.y, 2, 2);
        }
      }
    });
  }, [history]);

  useEffect(() => {
    void drawOnStart();
  }, [drawOnStart]);

  useEffect(() => {
    void drawDots();
  }, [drawDots]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <canvas
        onMouseDown={draw}
        onMouseUp={finishDrawing}
        ref={canvasRef}
        width="1024"
        height="720"
        style={{border: '2px solid black'}}
      />
    </div>
  );
};

export default App;