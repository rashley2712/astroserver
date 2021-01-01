function drawTempChart() {
	dateString = availableDates[currentDateIndex];
	chartDate = dateString;
	todaysData = nightData[dateString];
	//console.log("Today's data", todaysData);
	var startTime = new Date(parseInt(dateString.substring(0, 4)), parseInt(dateString.substring(4, 6))-1, parseInt(dateString.substring(6, 8)), 12, 0);
	var endTime = new Date(startTime.getTime() + 86400*1000);
	
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Ambient temperature (\u00B0C)');
	
	for (var i=0; i<todaysData.dateTime.length; i++) {
		data.addRow([todaysData.dateTime[i], parseFloat(todaysData.ambientTemp[i])]);
	}
	

	var options = {
	title: 'Conditions on ' + dateString,
	hAxis: {title: 'Time', format: 'HH:mm', viewWindow: { min: startTime, max: endTime}},
	vAxis: {title: 'Temperature (\u00B0C)' , viewWindow: { min: -30, max:60} },
	legend: { position: 'in' }, 
	chartArea: {
		left: "15%",
		top: "5%",
		height: "80%",
		width: "75%"
	},
	pointSize: 3

	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_temperature'));  
	chart.draw(data, options);
	
}

function drawHumidityChart() {

	dateString = availableDates[currentDateIndex];
	chartDate = dateString;
	todaysData = nightData[dateString];
	//console.log("Today's data", todaysData);
	var startTime = new Date(parseInt(dateString.substring(0, 4)), parseInt(dateString.substring(4, 6))-1, parseInt(dateString.substring(6, 8)), 12, 0);
	var endTime = new Date(startTime.getTime() + 86400*1000);

	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Relative Humidity (%)');
	
	for (var i=0; i<todaysData.dateTime.length; i++) {
		data.addRow([todaysData.dateTime[i], parseFloat(todaysData.relativeHumidity[i])]);
	}
	

	var options = {
	hAxis: { title: 'Time', format: 'HH:mm', viewWindow: { min: startTime, max: endTime}},
	vAxis: { title: 'Relative Humidity (%)', viewWindow: { min: 0, max:100} },
	legend: { position: 'in' }, 
	chartArea: {
		left: "15%",
		top: "5%",
		height: "80%",
		width: "75%"
	},
	pointSize: 3
	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_humidity'));  
	chart.draw(data, options);
	
}

function drawPressureChart() {

	dateString = availableDates[currentDateIndex];
	chartDate = dateString;
	todaysData = nightData[dateString];
	//console.log("Today's data", todaysData);
	var startTime = new Date(parseInt(dateString.substring(0, 4)), parseInt(dateString.substring(4, 6))-1, parseInt(dateString.substring(6, 8)), 12, 0);
	var endTime = new Date(startTime.getTime() + 86400*1000);

	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Air pressure (hPa)');
	
	for (var i=0; i<todaysData.dateTime.length; i++) {
		data.addRow([todaysData.dateTime[i], parseFloat(todaysData.airPressure[i])]);
	}
	

	var options = {
	hAxis: { title: 'Time', format: 'HH:mm', viewWindow: { min: startTime, max: endTime}},
	vAxis: { title: 'Air pressure (hPa)'},
	legend: { position: 'in' }, 
	chartArea: {
		left: "15%",
		top: "5%",
		height: "80%",
		width: "75%"
	},
	pointSize: 3
	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_pressure'));  
	chart.draw(data, options);
	
}
