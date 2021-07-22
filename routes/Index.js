const router = require("express").Router();
const { setprop, getprop } = require("varkeeper");

router.get("/", (req, res) => {
  res.render("Loader");
});

router.get("/get", (req, res) => {
  let peers = getprop("peers");
  // let peers = [];
  if (peers.length === 0) res.json({ html: global.html, code: 1 });
  else {
    peers.sort((a, b) => a.used - b.used);
    peers[0].used = peers[0].used + 1;
    setprop("peers", peers);
    res.json({ id: peers[0].id, checksum: global.checkHash, code: 0 });
  }
});

module.exports = router;
