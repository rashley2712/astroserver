const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
/*fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  console.log(JSON.parse(content));
  authorize(JSON.parse(content), writeContact);
});*/

var name = "New Person";
var email = "contact@gmail.com";
var message = "Let me know when you are open.";

//makeEntry(name, email, message);

function makeEntry(name, email, message) {
	entry = { name: name, email: email, message: message};
	fs.readFile('credentials.json', gotCredentials);
}

function main() {
	// Goes through the token creation steps.
	makeEntry("test", "test@gmail.com", "Testing authentication to Google Drive.");
}

if (require.main === module) {
	main();
  }

var credentials = null;
var auth = null;

// var getCredentials = fs.readFile('credentials.json', gotCredentials);

function gotCredentials(err, content) {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Google Sheets API.
	credentials = JSON.parse(content);
	console.log(credentials);
	authorize(credentials, authorized);
}

function authorized(oAuth2Client) {
	auth = oAuth2Client;
	console.log("Now authorized...");
	writeContact(auth, entry, done);
}


function done(status) {
	console.log("All done.");
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


/**
 * Writes a new entry the sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
 function writeContact(auth, entry, callback) {
	const sheets = google.sheets({version: 'v4', auth});
	let now = new Date().toUTCString();
	var JSONpayload = {
		spreadsheetId: '1xzKz0h2CtZ7yzaS_8xFVtcgTYLtPkbjDIzn1DjElW_w',
		range: 'Sheet1!A:C',
		valueInputOption: 'RAW',
		includeValuesInResponse: true,
		requestBody: {
			values: [ [now, entry.name, entry.email, entry.message]]
		}
	};
	console.log(JSONpayload);
	sheets.spreadsheets.values.append(JSONpayload, (err, res) => {
		if (err) {
			return console.error(err.toString());
	  	}
		return console.log(res.status, res.statusText);
	});
  }


/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
 function listContacts(auth) {
	const sheets = google.sheets({version: 'v4', auth});
	sheets.spreadsheets.values.get({
	  spreadsheetId: '1xzKz0h2CtZ7yzaS_8xFVtcgTYLtPkbjDIzn1DjElW_w',
	  range: 'Sheet1!A:C',
	}, (err, res) => {
	  if (err) return console.log('The API returned an error: ' + err);
	  const rows = res.data.values;
	  if (rows.length) {
		console.log('Name, email, message');
		// Print columns A, B, C, which correspond to indices 0 and 4.
		rows.map((row) => {
		  console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
		});
	  } else {
		console.log('No data found.');
	  }
	});
  }




/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
	const sheets = google.sheets({version: 'v4', auth});
	sheets.spreadsheets.values.get({
	  spreadsheetId: '1xzKz0h2CtZ7yzaS_8xFVtcgTYLtPkbjDIzn1DjElW_w',
	  range: 'Sheet1!A:A',
	}, (err, res) => {
	  if (err) return console.log('The API returned an error: ' + err);
	  const rows = res.data.values;
	  if (rows.length) {
		console.log('Name, Major:');
		// Print columns A and E, which correspond to indices 0 and 4.
		rows.map((row) => {
		  console.log(`${row[0]}, ${row[4]}`);
		});
	  } else {
		console.log('No data found.');
	  }
	});
  }



module.exports.makeEntry = makeEntry
  