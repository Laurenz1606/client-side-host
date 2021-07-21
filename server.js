//dependencies
const express = require("express");
const { ExpressPeerServer } = require("peer");
const bcrypt = require("bcrypt");
const { setprop, getprop } = require("varkeeper");

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

//html prototype and set global
const html = {
  head: "<title>Loding done</title>",
  body: "Hallo<style>\*,\*::before,\*::after\{margin: 0;padding: 0;box-sizing: border-box;\}<\/style>",
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

//create express and peer server
let serverport = process.env.PORT;

const server = app.listen(serverport, () =>
  console.log(`Server running on ${serverport}`)
);
const peerServer = ExpressPeerServer(server);

//create array of peers
setprop("peers", []);

//add client to array on connection
peerServer.on("connection", (client) => {
  setprop("peers", [...getprop("peers"), { id: client.getId(), used: 0 }])
  console.log(getprop("peers"))
});

//remove client form array on disconnect
peerServer.on("disconnect", (client) => {
  setprop(
    "peers",
    //remove client from array and return it
    () => {
      let x = getprop("peers");
      x.splice(
        x.findIndex((peer) => peer.id === client.getId()),
        1
      );
      return x;
    }
  );
});

//use routes
app.use("/peerserver", peerServer);
app.use("/", router);
