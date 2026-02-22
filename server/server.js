const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://positive-cat-production-611e.up.railway.app",
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://positive-cat-production-611e.up.railway.app",
    methods: ["GET", "POST"]
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("Utilizador conectado:", socket.id);

  socket.on("updateLocation", (coords) => {
    users[socket.id] = coords;
    io.emit("usersUpdate", users);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("usersUpdate", users);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Servidor a correr");
});