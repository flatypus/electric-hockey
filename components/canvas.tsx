import { useRef, useState, useEffect, useMemo } from "react";
import Socket from "socket.io-client";
import Router from "next/router";

export default function Canvas() {
  const socket = useMemo(() => Socket("http://localhost:5001"), []);
  // game will be played on a 800 x 600 canvas
  const requestRef: any = useRef();
  const canvasRef: any = useRef();
  const previousTimeRef = useRef(null);
  const mousepos = useRef<any>([]);
  const ballpos = useRef<any>([400, 300]);
  const ballacc = useRef<any>([0, 0]);
  const ballvel = useRef<any>([0, 0]);
  const playercharge = useRef<number>(-64);
  const gameSize = [800, 600];
  const ran = useRef<boolean>(false);
  const socketId = useRef<string>("");

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

  socket.on("connect", () => {
    socketId.current = socket.id;
    socket.emit("playerInRoom", [Router.query.id]);
  });

  socket.on("redraw", (data: any) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, gameSize[0], gameSize[1]);
    const [playerData, ballposition] = data;
    drawCircle(ctx, ballposition, 8, "#FFFFFF");
    for (const player in playerData) {
      const item = playerData[player];
      if (item.mousepos && item.playercharge) {
        drawCircle(
          ctx,
          item.mousepos,
          16,
          item.playercharge > 0 ? "#FF0000" : "#FFFF00",
          item.playercharge > 0 ? "+" : "-"
        );
      }
    }
  });

  const animate = (time: any) => {
    const ctx = canvasRef.current.getContext("2d");
    const [sx, sy] = [
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight,
    ];
    if (
      ballpos.current[0] &&
      ballpos.current[1] &&
      mousepos.current[0] &&
      mousepos.current[1] &&
      Router.query.id
    ) {
      socket.emit("updatePlayerData", [
        Router.query.id,
        mousepos.current,
        playercharge.current,
      ]);
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
      try {
        var rect = canvas.getBoundingClientRect();
        mousepos.current = [
          (canvas.width * (event.clientX - rect.left)) / rect.width,
          (canvas.height * (event.clientY - rect.top)) / rect.height,
        ];
      } catch {}
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
        playercharge.current = -playercharge.current;
      }
    };
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
