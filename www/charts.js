function drawTempChart() {
	

	dateString = availableDates[currentDateIndex];
	chartDate = dateString;
	todaysData = nightData[dateString];
	console.log("Today's data", todaysData);
	
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Sky temperature');
	data.addColumn('number', 'Ambient temperature');
	
	for (var i=0; i<todaysData.dateTime.length; i++) {
		data.addRow([todaysData.dateTime[i], parseFloat(todaysData.skyTemp[i]), parseFloat(todaysData.ambientTemp[i])]);
	}
	

	var options = {
	title: 'Conditions on ' + dateString,
	hAxis: {title: 'Time', format: 'HH:mm'},
	vAxis: {title: 'Temperature (C)' , viewWindow: { min: -30, max:60} },
	legend: { position: 'in' }, 
	pointSize: 3

	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_temperature'));  
	chart.draw(data, options);
	
}

function drawHumidityChart() {

	dateString = availableDates[currentDateIndex];
	chartDate = dateString;
	todaysData = nightData[dateString];
	console.log("Today's data", todaysData);
	
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Relative Humidity (%)');
	
	for (var i=0; i<todaysData.dateTime.length; i++) {
		data.addRow([todaysData.dateTime[i], parseFloat(todaysData.relativeHumidity[i])]);
	}
	

	var options = {
	hAxis: { title: 'Time', format: 'HH:mm'},
	vAxis: { title: 'Relative Humidity (%)', viewWindow: { min: 0, max:100} },
	legend: { position: 'in' }, 
	pointSize: 3
	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_humidity'));  
	chart.draw(data, options);
	
}
