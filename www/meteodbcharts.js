function drawTempChart() {
	var dateString = formatDate(startDate);
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Ambient temperature (\u00B0C)');
	
	for (var line of dayData){
		data.addRow([line.dateTime, line.Temperature]);
	}

	var options = {
	title: 'Conditions on ' + dateString,
	hAxis: {title: 'Time', format: 'HH:mm', viewWindow: { min: startDate, max: endDate}},
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
	var dateString = formatDate(startDate);

	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Relative Humidity (%)');
	
	for (var line of dayData){
		data.addRow([line.dateTime, line.RelativeHumidity]);
	}

	var options = {
	hAxis: { title: 'Time', format: 'HH:mm', viewWindow: { min: startDate, max: endDate}},
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
	var dateString = formatDate(startDate);


	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Air pressure (hPa)');
	
	for (var line of dayData){
		data.addRow([line.dateTime, line.Pressure]);
	}

	var options = {
	hAxis: { title: 'Time', format: 'HH:mm', viewWindow: { min: startDate, max: endDate}},
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
