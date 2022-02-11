function radians(angle) {
	angle = parseFloat(angle);
	return angle/180 * Math.PI;
	}

function degrees(angle) {
	angle = parseFloat(angle);	
	return angle * 180 / Math.PI;
	}

function zeroPad(input) {
	if (input < 10) return "0" + input.toString();
	return input.toString();
}

function formatUTCDateTime(inputDate) {
	var date;
	var month;
	var year;
	var hours;
	var minutes;
	var seconds;
	var timeString;
	
	hours = inputDate.getUTCHours();
 	minutes = inputDate.getUTCMinutes();
	seconds = inputDate.getUTCSeconds();
	date = inputDate.getUTCDate();
 	month = inputDate.getUTCMonth();
	year = inputDate.getUTCFullYear();
		
	timeString = year + "-" + zeroPad(month+1) + "-" + zeroPad(date) + " " + zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds);
	return timeString;

}


function formatDate(inputDate) {
	var year, month, day;
	year = inputDate.getYear() + 1900;
	month = inputDate.getMonth() + 1;
	day = inputDate.getDate(); 

	var dateString = year.toString() + zeroPad(month) + zeroPad(day);
	return dateString;
}

function sqlDateTime(inputDate) {
	var year, month, day, hours, minutes, seconds;
	year = inputDate.getYear() + 1900;
	month = inputDate.getMonth() + 1;
	day = inputDate.getDate(); 
	hours = inputDate.getHours();
 	minutes = inputDate.getMinutes();
	seconds = inputDate.getSeconds();

	var dateString = year.toString() + "-" + zeroPad(month)+ "-" + zeroPad(day) + " " + zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds);;
	return dateString;
}

function formatUTCTime(inputDate) {
	var hours;
	var minutes;
	var seconds;
	var timeString;
	
	hours = inputDate.getUTCHours();
 	minutes = inputDate.getUTCMinutes();
	seconds = inputDate.getUTCSeconds();
		
	timeString = zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds);
	return timeString;
}
	
function formatTime(date) {
	var hours;
	var minutes;
	var seconds;
	var timeString;
	
	hours = date.getHours();
 	minutes = date.getMinutes();
	seconds = date.getSeconds();
		
	timeString = zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds);
	return timeString;
}

function timeDecimalToHMS(inputTime){
	hours = Math.floor(inputTime);
	inputTime-=hours;
	minutes = Math.floor(inputTime*60);
	inputTime = inputTime*60 - minutes;
	seconds = Math.floor(inputTime*60);
	timeString = zeroPad(hours) + ":" + zeroPad(minutes) + ":" + zeroPad(seconds);
	return timeString;
}

function decimalPlacesFloat(value, places) {
	multiplier = Math.pow(10, places);
	return Math.round(value*multiplier) / multiplier;
}

function decimalPlacesString(value, places) {
	floatValue = decimalPlacesFloat(value, places);
	numberString = floatValue.toString();
	trailingZeros = places - numberString.split('.')[1].length;
	for (var i=0; i<trailingZeros; i++) numberString = numberString + "0";
	return numberString;
}


function calculateMedian(floatArray) {
    floatArray.sort(function(a,b){ return a-b; });
    let midpoint = Math.floor(floatArray.length / 2);
    let median = 0;
    if (floatArray.length % 2) median = floatArray[midpoint]; 
    else median = (floatArray[midpoint - 1] + floatArray[midpoint]) / 2.0;
    console.log("Median: " + median);
    return median;
}

function julianDate(now) {
   return (now.valueOf()/86400000) + 2440587.5;
}

function frac(X) {
   var X = X - Math.floor(X);
   if ( X < 0 ) X += 1.0;
   return X;		
}

function GM_Sidereal_Time(jd) {	
   MJD = jd - 2400000.5;		
   MJD0 = Math.floor(MJD);
   ut = (MJD - MJD0)*24.0;		
   t_eph = (MJD0-51544.5)/36525.0;			
   gmst =  6.697374558 + 1.0027379093*ut
            + (8640184.812866 + (0.093104 - 0.0000062*t_eph)*t_eph)*t_eph/3600.0;		
   while ( gmst > 24 ) { gmst -= 24 }
   return gmst;
}

function LM_Sidereal_Time(jd, longitude) {
   return 24.0*frac((GM_Sidereal_Time(jd) + longitude/15.0)/24.0);
}

function removeEmptyElements(inputArray) {
	var newArray = [];
	for (element in inputArray) {
		if (inputArray[element].length!=0) newArray.push(inputArray[element]); 
	}
	// console.log(newArray);
	return newArray;
}

function fromSexagesimalString(radecStr) {
	// Returns an object with properties 'ra' and 'dec' in degrees separated by a comma or "null, null if it could not parse the input correctly 
	// Results are truncated to 4 figures after the decimal (1E-4 degrees)
	// Format for input ra and dec are 'HH:MM:SS.dd' and 'nDD:MM:SS.dd' or HH MM SS.dd and nDD MM SS.dd 
	
	// First split on spaces
	radecStr = radecStr.trim();
	radecStr = radecStr.replace(/:/g, " ");
	radecStr = radecStr.replace(/\t/g, " ");
	//console.log("input string:", radecStr);
	radecParts = radecStr.split(' ');
	radecParts = removeEmptyElements(radecParts);
	//console.log("Parts:", radecParts);	

	if (radecParts.length != 6) {
		console.log("Could not sensibly parse the line: " + radecStr);
		return "null, null";
	}
	raHours = parseInt(radecParts[0]);
	raMinutes = parseInt(radecParts[1]);
	raSeconds = parseFloat(radecParts[2]);
	ra = 15 * (raHours + raMinutes/60.0 + raSeconds / 3600.0);
		
	if (radecParts[3][0]=='-') south = true; else south = false;
		
	decDegrees = parseInt(radecParts[3]);
	decMinutes = parseInt(radecParts[4]);
	decSeconds = parseFloat(radecParts[5]);
	
	if (south) dec = decDegrees - decMinutes/60.0 - decSeconds / 3600.0;
	else dec = decDegrees + decMinutes/60.0 + decSeconds / 3600.0;
		
	ra = decimalPlacesFloat(ra, 4);
	dec = decimalPlacesFloat(dec, 4);
	
	result = {};
	result.ra = ra
	result.dec = dec		
	return result;
}

function convertToGalactic(ra, dec) {
	// Returns a string of l, b in degrees separated by a comm 
	// Results are truncated to 4 figures after the decimal (1E-4 degrees)
	// Format for input ra and dec are 'HH:MM:SS.dd' and 'nDD:MM:SS.dd' or HH MM SS.dd and nDD MM SS.dd 
	// Information for the transformation found here: http://physics.stackexchange.com/questions/88663/converting-between-galactic-and-ecliptic-coordinates
	console.log("Converting to galactic coordinates:" + ra + ", " + dec);
	pole = radians(192.859481);
	node = radians(27.128251);
	equator = radians(32.931918);
	alpha = radians(ra);
	delta = radians(dec);
	console.log('alpha, delta', alpha, delta);
	b = Math.asin( Math.cos(delta)*Math.cos(node)*Math.cos(alpha-pole) + Math.sin(delta)*Math.sin(node) );
	numerator = Math.sin(delta) - Math.sin(b)*Math.sin(node);
	denominator = Math.cos(delta)*Math.cos(node)*Math.sin(alpha-pole);
	console.log("fraction:", numerator, denominator);
	l = Math.atan( numerator/denominator)
	console.log("atan:", degrees(l));
	if (numerator<0 && denominator<0) l+= Math.PI;
	if (numerator<0 && denominator>0) l+= 2*Math.PI;
	if (numerator>0 && denominator<0) l+= Math.PI;
	console.log("corrected atan:", degrees(l));
	l+= equator;
	if (l > 2*Math.PI) l-= 2*Math.PI;
	console.log(l, b);
	l = decimalPlacesFloat(degrees(l), 4);
	b = decimalPlacesFloat(degrees(b), 4);
	galactic = { 'l': l, 'b': b};
	return galactic;
	
	}

	function getJSON(url, callback) {
		var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'json';
			xhr.onload = function() {
				var status = xhr.status;
				if (status === 200) {
					callback(null, xhr.response);
				} else {
					callback(status, xhr.response);
				}
			};
		xhr.send();
	};    

    function sqlDateFormatter(inputDate) {
        var year, month, day, hours, minutes, seconds;
        year = inputDate.getYear() + 1900;
        month = inputDate.getMonth() + 1;
        day = inputDate.getDate(); 
        hours = inputDate.getHours();
        minutes = inputDate.getMinutes();
        seconds = inputDate.getSeconds();

        var dateString = year.toString() + zeroPad(month) + zeroPad(day) + "_" + zeroPad(hours) + zeroPad(minutes);
        return dateString;
    }


	function castDateTime(dayData) {
		let count = 0;
		for (line of dayData) {
			let year = parseInt(line.Date.substring(0, 4));
			let month = parseInt(line.Date.substring(5, 7));
			let day = parseInt(line.Date.substring(8, 10));
			let hour = parseInt(line.Date.substring(11, 13));
			let minute = parseInt(line.Date.substring(14, 16));
			let second = parseFloat(line.Date.substring(17, 25));
			line.dateTime = new Date(year, month-1, day, hour, minute, second);
			count++;
		  }
		return count;
	}

	function renderMenu() {
		const menuHTML = `
		<ul>   								
			<li><a href="index.html">Home</a></li>			
			<li><a href="aboutus.html">About us</a></li>	
			<li><a href="history.html">History</a></li>					
			<li><a href="weather.html">Weather</a></li>
			<!--  <li><a href="skycam.html">SkyCam</a></li>  -->
			<!-- <li><a href="meteologger.html">Meteo logger</a></li>  -->
			<li><a href="https://www.airbnb.es/experiences/1353943" target="_new">Stargazing trips</a></li>
			<li><a href="http://www.astro-travels.com/La-Palma-astro.html" target="_new">Education</a></li>
		</ul>`;
		document.getElementById("menuPlaceHolder").innerHTML = menuHTML;

	}
