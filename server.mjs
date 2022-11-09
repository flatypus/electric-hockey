import { Server, Socket } from "socket.io";
import express from "express";
import { createServer } from "http";

// npx nodemon ./server.mjs localhost 5000

const k = 1000;
const ballmass = 0.5;
const ballcharge = 2;

const calculatePhysics = (
  ballpos,
  ballvel,
  ballacc,
  playercharge,
  mousepos,
  gameSize
) => {
  const dt = 0.01;
  if (ballpos[0] > gameSize[0]) {
    ballpos[0] -= 5;
    ballvel[0] = -0.9 * Math.abs(ballvel[0]);
  }
  if (ballpos[0] < 0) {
    ballpos[0] += 5;
    ballvel[0] = 0.9 * Math.abs(ballvel[0]);
  }

  if (ballpos[1] > gameSize[1]) {
    ballpos[1] -= 5;
    ballvel[1] = -0.9 * Math.abs(ballvel[1]);
  }
  if (ballpos[1] < 0) {
    ballpos[1] += 5;
    ballvel[1] = 0.9 * Math.abs(ballvel[1]);
  }

  if (ballpos[0] == NaN || ballpos[1] == NaN) {
    ballpos = [400, 300];
    ballvel = [0, 0];
    ballacc = [0, 0];
  }

  // calculate collision between ball and player

  const vectoracc =
    k *
    ballcharge *
    playercharge *
    (1 /
      Math.sqrt(
        (ballpos[0] - mousepos[0]) ** 2 +
          (ballpos[1] - mousepos[1]) ** 2
      )) *
    (1 / ballmass);
  const [x, y, z] = [
    ballpos[0] - mousepos[0],
    ballpos[1] - mousepos[1],
    Math.sqrt(
      (ballpos[0] - mousepos[0]) ** 2 +
        (ballpos[1] - mousepos[1]) ** 2
    ),
  ];
  ballacc = [vectoracc * (x / z), vectoracc * (y / z)];
  ballvel[0] += ballacc[0] * dt;
  ballvel[1] += ballacc[1] * dt;
  ballpos[0] += ballvel[0] * dt;
  ballpos[1] += ballvel[1] * dt;
  return { ballpos, ballvel, ballacc, mousepos };
};

function socket({ io }) {
  console.log("starting server");
  io.on("connection", (socket) => {
    // When a user connects
    console.log(`A user has connected: ${socket.id}`);
    //When a user sends a message
    socket.on("player", async (data) => {
      console.log(data);
    });

    socket.on("playerData", async (data, callback) => {
      callback(calculatePhysics(...data));
      // console.log(calculatePhysics(...data))
    });
  });
}

const corsOrigin = "*";
const port = 5001;
const host = "localhost";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World! v0.1.0");
});

http.listen(port, host, () => {
  console.log(`Server v0.1.0 listening on http://${host}:${port}/`);
  socket({ io });
});
