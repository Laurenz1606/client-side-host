const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("Loader");
});

router.get("/get", (req, res) => {
  res.json({ hash: global.checkHash, html: global.html, code: 1 });
});

module.exports = router;
