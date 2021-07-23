//dependencies
const express = require("express");
const { ExpressPeerServer } = require("peer");
const bcrypt = require("bcrypt");
const { setprop, getprop } = require("varkeeper");
const { readFileSync } = require("fs");

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

//escape html to js string
function escapeHtml(html) {
  return html
    .replace(/[.*+?^"${}()\/|[\]\\]/g, "$&")
    .replace(/  /g, "")
    .replace(/\n/g, "");
}

//make escaped html file
setprop("html", {
  head: escapeHtml(readFileSync("./head.html", "utf-8")),
  body: escapeHtml(readFileSync("./body.html", "utf-8")),
});

//generate checkHash
const generateCheck = async (html) => {
  try {
    setprop("checksum", await bcrypt.hash(JSON.stringify(html), 1));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
generateCheck(getprop("html"));

//create express and peer server
let serverport = process.env.PORT || 3000;

const server = app.listen(serverport, () =>
  console.log(`Server running on ${serverport}`)
);
const peerServer = ExpressPeerServer(server);

//create array of peers
setprop("peers", []);

//add client to array on connection
peerServer.on("connection", (client) => {
  setprop("peers", [...getprop("peers"), { id: client.getId(), used: 0 }]);
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
