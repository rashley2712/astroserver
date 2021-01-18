#!/usr/bin/env node

const express = require('express')
const vhost= require('vhost')
const astronomy = require('./astronomy.js')
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const rootPath = "/var/www/astrofarm";
const sqlDBFile = "meteo.db";

var port = 3001;

var astrofarm = express();

function updateImageFilelist() {
  // Scans the skycam folder to re-generate the JSON list of skycam images
  const folderPath = '/var/www/astrofarm/skycam';
  const JSONFilename = 'skycam.json'
  fs.readdir(folderPath, function(err, files) {
    if (err!=null) {console.log("Error!", err); return;}
    console.log("Files in", folderPath);
    var fileList = [];
    for (file of files) {
      if (file.includes(".jpg")) fileList.push(file);
    }
  
    var skycamData = {};
    var availableDates = [];
    for (file of fileList) {
      let datePortion = file.substring(0, 8);
      if (!availableDates.includes(datePortion)) availableDates.push(datePortion);
    }
    fileList.sort();
    fileList.reverse();
    // console.log("all dates:", availableDates);
    skycamData.dates = availableDates;
    skycamData.mostRecent = fileList[0];
    skycamData.files = fileList;
    fileJSON = JSON.stringify(skycamData, null, 2);
    fs.writeFile(path.join(folderPath, JSONFilename), fileJSON, function (err) {
      if (err) return console.log(err);
      console.log('Updated', JSONFilename);
    });
  });

}
  

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, '/var/www/astrofarm/skycam/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      //cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      cb(null, file.originalname);
    }
});

astrofarm.post('/upload', function(request, response) {
  console.log("Received a post");
  // Save the data
  const data = request.body;

  var logString = ""
  for (line of data.logData) {
    console.log(line.trim());
    logString+=line.trim()+"\n";
  }
  const logFilename = path.join(rootPath, 'meteo.log');
  fs.appendFile(logFilename, logString, function (err) {
    if (err) return console.log(err);
    console.log('Updated', logFilename);
  });
  // also update the sqlite db
  let db = new sqlite3.Database(path.join(rootPath, sqlDBFile), sqlite3.OPEN_READWRITE, (err, data) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the test SQlite database.');
  });

  for (line of data.logData) {
    var fields = line.trim().split('|');
    console.log(fields);
    sqlquery = "INSERT INTO meteolog VALUES ('" + fields[0].toString() + "', " + parseFloat(fields[1]) + ", " + parseFloat(fields[2]) + ", " + parseFloat(fields[3]) + ", " + parseFloat(fields[4]) + ", " + parseFloat(fields[5]) + ", " + parseFloat(fields[6]) + ");";
    console.log(sqlquery); 
    db.run(sqlquery);
  }
  
  db.close();
  response.send("SUCCESS");
})

astrofarm.post('/imageUpload', function(req, res) {
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage}).single('skycam');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        console.log(req.file)
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send("SUCCESS");
        updateImageFilelist();
    });
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
    res.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' });
    res.write(data);
    console.log(data);
    res.end();
  }
})

astrofarm.get('/meteolog', function(req, res) {
  let db = new sqlite3.Database(path.join(rootPath, sqlDBFile), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return console.error(err.message);
    } });

  // select distinct(date(Date)) from meteolog;
  console.log('Connected to the test SQlite database.');
  let startDate = req.query.start;
  let endDate = req.query.end;
  console.log("start date:", startDate);
  
  function makeSQL(startDate, endDate) {
    if (startDate == null && endDate==null) return 'SELECT * from meteolog;';
    if (startDate == null && endDate!=null) return 'SELECT * from meteolog WHERE Date < "' + endDate + '";';
    if (startDate.includes("dates")) return "SELECT DISTINCT(date(Date)) AS availableDate FROM meteolog;";
    if (endDate==null) return 'SELECT * from meteolog WHERE Date > "' + startDate + '";';
    return 'SELECT * from meteolog WHERE Date > "' + startDate + '" AND Date < "' + endDate + '";';
  }
  var sqlquery = makeSQL(startDate, endDate);

  console.log(sqlquery); 
  db.all(sqlquery, [], processDB);
  db.close();

  
  function processDB(err, rows) {
    console.log("In process DB");
    var data = [];
    var count=0;
    for (row of rows) {
      data.push(row);
      count++;
    }
    console.log("Sent back", count, "rows.");
    res.writeHead(200, { 'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*' });
    res.write(JSON.stringify(data, null, 2));
    res.end();
  }

  
});


astrofarm.post('/diagnostics', function(request, response) {
  const data = request.body;

  var logString = ""
  console.log(data);
  response.send("SUCCESS");
  var logString = JSON.stringify(data) + "\n";
  const logFilename = path.join(rootPath, 'diagnostics.log');
  fs.appendFile(logFilename, logString, function (err) {
    if (err) return console.log(err);
    console.log('Updated', logFilename);
  });
  // also update the sqlite db
  
})

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


astrofarm.use(express.static(rootPath));


const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(vhost('*.astrofarm.*', astrofarm))
app.use(vhost('astrofarm.*', astrofarm))
app.use(vhost('localhost', astrofarm))

app.get('/', (req, res) => {
	res.send("Hello world");
});

	// => res.redirect('/index.html'))
app.use(express.static('/var/www'));
console.log(process.argv);
let requestedPort = parseInt(process.argv[2]);
if (isNaN(requestedPort)) {
  console.log("Invalid port requested. Using default:", port)
} else {
  port = requestedPort;
  console.log("Requested port is:", port);
}
app.listen(port, ()=> console.log('astroserver listening on port',  port));


