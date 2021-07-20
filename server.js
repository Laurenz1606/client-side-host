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
global.html = html

//generate checkHash
const generateCheck = async (html) => {
  try {
    global.checkHash = await bcrypt.hash(JSON.stringify(html), 10);
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
};
generateCheck(html);

//use routes
app.use("/peerserver", peerServer);
app.use("/", router);
