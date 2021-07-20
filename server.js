//dependencies
const express = require("express");
const { ExpressPeerServer } = require("peer");
const bcrypt = require("bcrypt");

//include dotenv in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//load routers
const router = require("./routes/Index");

//setup express app for ejs
const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//create express and peer server

//todo: add .env with fallback to 3000
let serverport = 3000;

const server = app.listen(serverport, () =>
  console.log(`Server running on ${serverport}`)
);
const peerServer = ExpressPeerServer(server);

//html prototype and set global
const html = {
  head: "<title>Loding done</title>",
  body: "Hallo",
};
global.html = html;

//generate checkHash
const generateCheck = async (html) => {
  try {
    global.checkHash = await bcrypt.hash(JSON.stringify(html), 10);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
generateCheck(html);


//create array of peers
const peers = [];

//add client to array on connection
peerServer.on("connection", (client) => {
  peers.push({ id: client.getId(), used: 0 });
  console.log(peers);
  global.peers = peers;
});

//remove client form array on disconnect
peerServer.on("disconnect", (client) => {
  for (var i = 0; i < peers.length; i++) {
    if (peers[i].id === client.getId()) {
      peers.splice(i, 1);
    }
  }
  console.log(peers);
  global.peers = peers;
});

//use routes
app.use("/peerserver", peerServer);
app.use("/", router);
