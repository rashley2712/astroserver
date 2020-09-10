const express = require('express')
const vhost= require('vhost')
const astronomy = require('./astronomy.js')
const bodyParser = require('body-parser');
const fs = require('fs');

const port = 80

var astrofarm = express()

astrofarm.post('/upload', function(request, response) {
  console.log("Received a post");
  // Save the data
  const data = request.body;

  var logString = ""
  for (line of data.logData) {
    console.log(line);
    logString+=line+"\n";
  }
  const logFilename = '/var/www/astrofarm/meteo.log';
  fs.appendFile(logFilename, logString, function (err) {
    if (err) return console.log(err);
    console.log('Updated', logFilename);
  });
  response.send("SUCCESS");
})

astrofarm.get('/', function(req, res) {
  // res.send('Welcome to AstroFarm')
  console.log("received a GET for", req.url)
  res.redirect('/index.html')
  })

astrofarm.get('/moonphase', function(req, res) {
  astronomy.moon(null, writeout)					
  function writeout(err, data) {
    res.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' })
    res.write(data)
    res.end()
  }
})

astrofarm.get('/sun', function(req, res) {
  astronomy.sun(null, writeout)					
  function writeout(err, data) {
    res.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' })
    res.write(data)
    res.end()
  }
})

astrofarm.get('/info', function(req, res) {
  astronomy.info(null, writeout)
  function writeout(err, data) {
    res.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' })
    res.write(data)
    console.log(data)
    res.end()
  }
})
  
astrofarm.use(express.static('/var/www/astrofarm'))


const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(vhost('astrofarm.*', astrofarm))

app.get('/', (req, res) => res.redirect('/index.html'))
app.use(express.static('/var/www'))
app.listen(port, ()=> console.log('astroserver listening on port',  port))


