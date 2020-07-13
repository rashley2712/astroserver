const express = require('express')
const vhost= require('vhost')
var astronomy = require('./astronomy.js')

const port = 3000

var astrofarm = express()

astrofarm.get('/', function(req, res) {
  // res.send('Welcome to AstroFarm')
  console.log(req.url)
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

  
astrofarm.use(express.static('/var/www/astrofarm'))


const app = express()
app.use(vhost('astrofarm.es', astrofarm))
app.use(vhost('astrofarm.eu', astrofarm))

app.get('/', (req, res) => res.redirect('/index.html'))
app.use(express.static('/var/www'))
app.listen(port, ()=> console.log('Example app listening on port',  port))


