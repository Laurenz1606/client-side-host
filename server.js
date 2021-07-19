const express = require('express')
const { ExpressPeerServer } = require('peer');
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('')
})

const server = app.listen(3000 ,() => {
  console.log(`Listening on port 3000`)})

const peerServer = ExpressPeerServer(server);

app.use('/peerserver', peerServer);