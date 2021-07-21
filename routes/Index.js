const router = require("express").Router();
const { setprop, getprop } = require("varkeeper");

router.get("/", (req, res) => {
  res.render("Loader");
});

router.get("/get", (req, res) => {
  let peers = getprop("peers");
  if (peers.length === 0) res.json({ html: global.html, code: 1 });
  else res.json({ id: peers[0].id, code: 0 });
});

module.exports = router;
