const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000
const path = require('path')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.setHeadersForSSE = function() {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
  }

  res.sseSend = function(data) {
    res.write("data: " + JSON.stringify(data) + "\n\n");
  }

  next()
})


const votes = {
  yes: 0,
  no: 0
}

const connections = []

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.get('/vote', function(req, res) {
  if (req.query.choice === 'yes')
    votes.yes++
  else
    votes.no++
  connections.forEach(conn => conn.sseSend(votes))
  res.sendStatus(200)
})

app.get('/stream', function(req, res) {
  res.setHeadersForSSE()
  res.sseSend(votes)
  connections.push(res)
})

app.listen(PORT, function() {
  console.log(`listening on http://localhost:${PORT}`)
})