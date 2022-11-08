import { useRef, useState, useEffect } from "react";

export default function Canvas() {
  // game will be played on a 800 x 600 canvas
  const requestRef: any = useRef();
  const canvasRef: any = useRef();
  const previousTimeRef = useRef(null);
  const mousepos = useRef<any>([]);
  const ballpos = useRef<any>([400, 300]);
  const ballacc = useRef<any>([0, 0]);
  const ballvel = useRef<any>([0, 0]);
  const k = 1000;
  const ballmass = 0.5;
  const ballcharge = 2;
  const playercharge = useRef<number>(-4);
  const gameSize = [800, 600];
  const ran = useRef<boolean>(false);

  // draw a singular point, used as a particle. Essentially drawDot but with dx,dy = 0,0 ie. a 1x1 dot
  const drawPoint = (
    ctx: {
      fillStyle: any;
      fillRect: (arg0: any, arg1: any, arg2: number, arg3: number) => void;
    },
    pos: number[],
    size: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(pos[0] - size / 2, pos[1] - size / 2, size, size);
  };

  const drawCircle = (
    ctx: any,
    pos: number[],
    radius: number,
    color: string,
    text: string = ""
  ) => {
    ctx.beginPath();
    ctx.arc(...pos, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = "30px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, pos[0] - 9, pos[1] + 7);
  };

  const calculatePhysics = (dt: number) => {
    if (ballpos.current[0] > gameSize[0] || ballpos.current[0] < 0) {
      ballvel.current[0] = 0.9 * -ballvel.current[0];
      if (ballpos.current[0] > gameSize[0]) ballpos.current[0] -= 5;
      if (ballpos.current[0] > 0) ballpos.current[0] += 5;
    }
    if (ballpos.current[1] > gameSize[1] || ballpos.current[1] < 0) {
      ballvel.current[1] = 0.9 * -ballvel.current[1];
      if (ballpos.current[1] > gameSize[1]) ballpos.current[1] -= 5;
      if (ballpos.current[1] > 0) ballpos.current[1] += 5;
    }

    if (ballpos.current[0] == NaN || ballpos.current[1] == NaN) {
      ballpos.current = [400, 300];
      ballvel.current = [0, 0];
      ballacc.current = [0, 0];
    }
    const vectoracc =
      k *
      ballcharge *
      playercharge.current *
      (1 /
        Math.sqrt(
          (ballpos.current[0] - mousepos.current[0]) ** 2 +
            (ballpos.current[1] - mousepos.current[1]) ** 2
        )) *
      (1 / ballmass);
    const [x, y, z] = [
      ballpos.current[0] - mousepos.current[0],
      ballpos.current[1] - mousepos.current[1],
      Math.sqrt(
        (ballpos.current[0] - mousepos.current[0]) ** 2 +
          (ballpos.current[1] - mousepos.current[1]) ** 2
      ),
    ];
    ballacc.current = [vectoracc * (x / z), vectoracc * (y / z)];
    ballvel.current[0] += ballacc.current[0] * dt;
    ballvel.current[1] += ballacc.current[1] * dt;
    ballpos.current[0] += ballvel.current[0] * dt;
    ballpos.current[1] += ballvel.current[1] * dt;
  };

  const animate = (time: any) => {
    const ctx = canvasRef.current.getContext("2d");
    const [sx, sy] = [
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight,
    ];
    ctx.clearRect(0, 0, sx, sy);
    if (
      ballpos.current[0] &&
      ballpos.current[1] &&
      mousepos.current[0] &&
      mousepos.current[1]
    ) {
      calculatePhysics(0.01);
      // console.log(ballpos.current);
      if (previousTimeRef.current != undefined) {
        // draw function
        // console.log(mousepos.current);
        drawCircle(
          ctx,
          mousepos.current,
          16,
          playercharge.current > 0 ? "#FF0000" : "#FFFF00",
          playercharge.current > 0 ? "+" : "-"
        );
        drawCircle(ctx, ballpos.current, 8, "#FFFFFF");
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  // either page loaded or someone resized the window, let's redraw the grid
  const reset = () => {
    canvasRef.current.width = canvasRef.current.clientWidth;
    canvasRef.current.height = canvasRef.current.clientHeight;
    const ctx = canvasRef.current.getContext("2d");
    const [sx, sy] = [
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight,
    ];
    // clear the canvas
    ctx.clearRect(0, 0, sx, sy);
    console.log("grid rerendered");
  };

  useEffect(() => {
    // function to handle when mouse moves
    const handleWindowMouseMove = (event: any) => {
      const canvas = canvasRef.current;
      var rect = canvas.getBoundingClientRect();
      mousepos.current = [
        (canvas.width * (event.clientX - rect.left)) / rect.width,
        (canvas.height * (event.clientY - rect.top)) / rect.height,
      ];
    };
    try {
      // initial grid load
      reset();
    } catch {}
    // add listeners to watch when mouse moves and when window resizes for
    // improved performance vs onMouseMove
    const handleClick = (e: any) => {
      // console.log(e)
      if (e.code && e.code == "Space") {
        console.log(playercharge.current);
        playercharge.current = -playercharge.current;
      }
    };
    console.log("hello");
    if (!ran.current) {
      ran.current = true;
      window.addEventListener("keypress", handleClick);
    }

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("resize", reset);
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-white"
    ></canvas>
  );
}
