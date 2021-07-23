//dependencies
const express = require("express");
const { ExpressPeerServer } = require("peer");
const bcrypt = require("bcrypt");
const { setprop, getprop, onchange } = require("varkeeper");

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
  head: "<meta charset=\"UTF-8\" \/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\.0\" \/><meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\" \/><link href=\"https:\/\/unpkg\.com\/tailwindcss@\^2\/dist\/tailwind\.min\.css\" rel=\"stylesheet\"><title>Test Seite<\/title>",
  body: "<figure class=\"md:flex bg-gray-100 rounded-xl p-8 md:p-0\"><img class=\"w-32 h-32 md:w-48 md:h-auto md:rounded-none rounded-full mx-auto\" src=\"https:\/\/tailwindcss\.com\/_next\/static\/media\/sarah-dayan\.a8ff3f1095a58085a82e3bb6aab12eb2\.jpg\" alt=\"\"width=\"384\" height=\"512\"><div class=\"pt-6 md:p-8 text-center md:text-left space-y-4\"><blockquote><p class=\"text-lg font-semibold\">“Tailwind CSS is the only framework that I've seen scaleon large teams\. It’s easy to customize, adapts to any design,and the build size is tiny\.”<\/p><\/blockquote><figcaption class=\"font-medium\"><div class=\"text-cyan-600\">Sarah Dayan<\/div><div class=\"text-gray-500\">Staff Engineer, Algolia<\/div><\/figcaption><\/div><\/figure>",
};
global.html = html;

//generate checkHash
const generateCheck = async (html) => {
  try {
    global.checkHash = await bcrypt.hash(JSON.stringify(html), 1);
    console.log(global.checkHash);
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

onchange("peers", () => console.log(getprop("peers")))

//use routes
app.use("/peerserver", peerServer);
app.use("/", router);
