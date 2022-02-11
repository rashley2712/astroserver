#!/usr/bin/env node

const express = require('express')
const vhost= require('vhost')
const drive = require('./drive.js');
const astronomy = require('./astronomy.js')
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const rootPath = "/var/www/astrofarm";
const sqlDBFile = "meteo.db";
const { spawn } = require('child_process');
const pug = require('pug');

var port = 3001;

var astrofarm = express();


astrofarm.post('/contact', function(request, response) {
	console.log("Received a contact post");
	// Save the data
	const data = JSON.parse(request.body.data);
	console.log(data);

	data.timeStamp = (new Date()).toUTCString();
	var logString = JSON.stringify(data) + "\n";
	const contactLog = path.join(rootPath, 'contacts.log');
	fs.appendFile(contactLog, logString, function (err) {
	  if (err) return console.log(err);
	  console.log('Updated', contactLog);
	});

	drive.makeEntry(data.name, data.email, data.message);
	response.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' });
    response.write(JSON.stringify(data));
    response.end();
	}
  
);

astrofarm.get('/lpmeteo', function(request, response) {

  // Capture the SQL command requested by the JS client 
  let command = request.query.cmd;
  if (command == null) {
    console.log("In lpmeteo... bad request detected. Sent back HTTP 400.");
    response.writeHead(400, { 'Content-Type': 'text/plain',  'Access-Control-Allow-Origin': '*' });
    response.write("Could not understand your request parameters.\n");
    response.write("You need to specify a 'cmd' parameter in the query string.");
    response.end();
    return;
  }

  LPdatabase = "LPmeteo/lpmeteo.db";
  let db = new sqlite3.Database(path.join(rootPath, LPdatabase), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      response.writeHead(500, { 'Content-Type': 'text/plain',  'Access-Control-Allow-Origin': '*' });
      response.write("The server had a problem connecting to the database.");
      response.write("Error: " + err.message);
      response.end();
      return console.error(err.message);
    } });

  let startDate = request.query.start;
  let endDate = request.query.end;
  console.log("start date:", startDate);
  
  // select distinct(date(Date)) from meteolog;
  console.log('Connected to the LP meteo SQLite database.');
  var sqlquery = "";
  switch(command) {
    case 'sql':
      sqlquery = request.query.sql.replace(/'/g, ''); 
      break;
    case 'temphumidity':
      sqlquery = "select temperature.Date as Date, temperature.value as temperature, humidity.value as humidity from temperature INNER JOIN humidity on humidity.Date = temperature.Date"; 
      if (startDate!=null && endDate!=null) sqlquery += ' WHERE temperature.Date > "' + startDate + '" AND temperature.Date < "' + endDate + '";';
      if (startDate==null && endDate!=null) sqlquery += ' WHERE temperature.Date < "' + endDate + '";';
      if (startDate!=null && endDate==null) sqlquery += ' WHERE temperature.Date > "' + startDate + '";';
      break;
    case 'dates': 
      sqlquery = "SELECT DISTINCT(substr(Date, 0, 9)) AS availableDate FROM temperature;";
      break;
    case 'wind':
      sqlquery = "SELECT * from wind";
      if (startDate!=null && endDate!=null) sqlquery += ' WHERE Date > "' + startDate + '" AND Date < "' + endDate + '";';
      if (startDate==null && endDate!=null) sqlquery += ' WHERE Date < "' + endDate + '";';
      if (startDate!=null && endDate==null) sqlquery += ' WHERE Date > "' + startDate + '";';
      break;
    case 'humiditystats':
      sqlquery = "select cast(value/10 as int)*10 as bin_floor, count(Date) as count from humidity group by bin_floor;";
      break;
    default:
      console.log("No valid query selected");
      response.writeHead(400, { 'Content-Type': 'text/plain',  'Access-Control-Allow-Origin': '*' });
      response.write("Request a valid 'cmd' type. { sql | temphumidity | dates | wind }. ");
      response.end();
      return;
  }
  console.log("Raw SQL query is: ", sqlquery);

  console.log(sqlquery); 
  db.all(sqlquery, [], returnJSON);
  db.close();

  
  function returnJSON(err, rows) {
    console.log("In process DB");
    var data = [];
    var count=0;
    for (row of rows) {
      data.push(row);
      count++;
    }
    console.log("Sent back", count, "rows.");
    response.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' });
    response.write(JSON.stringify(data, null, 2));
    response.end();
  }

  
});



const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(vhost('*.astrofarm.*', astrofarm))
app.use(vhost('astrofarm.*', astrofarm))
app.use(vhost('localhost', astrofarm))
app.use(vhost('thinkpad', astrofarm))

app.set('views', rootPath);
app.set('view engine', 'pug');
app.get('/', (req, res) => {
  console.log("testing pug");
  res.render('index.pug');
  // res.redirect("/index.html");
});



astrofarm.use(express.static(rootPath));

console.log(process.argv);
let requestedPort = parseInt(process.argv[2]);
if (isNaN(requestedPort)) {
  console.log("Invalid port requested. Using default:", port)
} else {
  port = requestedPort;
  console.log("Requested port is:", port);
}
app.listen(port, ()=> console.log('astroserver listening on port',  port));


