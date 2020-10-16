function drawTempChart() {
	//var dateString = formatDate(startDate);
	var dateString = availableDates[currentDateIndex];
	var data = new google.visualization.DataTable();
	var dateFormatter = new google.visualization.DateFormat({pattern: 'dd/MM/yyyy HH:mm'});
	const colourTable = ["#FF0030", "#FF0020", "#FF0010", "#FF0000", "#FF0a00", "#FF1400", "#FF1e00", "#FF2800", "#FF3200", "#FF3c00", "#FF4600", "#FF5000", "#FF5a00", "#FF6400", "#FF6e00", "#FF7800", "#FF8200", "#FF8c00", "#FF9600", "#FFa000", "#FFaa00", "#FFb400", "#FFbe00", "#FFc800", "#FFd200", "#FFdc00", "#FFe600", "#FFf000", "#FFfa00", "#fdff00", "#d7ff00", "#b0ff00", "#8aff00", "#65ff00", "#3eff00", "#17ff00", "#00ff10", "#00ff36", "#00ff5c", "#00ff83", "#00ffa8", "#00ffd0", "#00fff4", "#00e4ff", "#00d4ff", "#00c4ff", "#00b4ff", "#00a4ff", "#0094ff", "#0084ff", "#0074ff", "#0064ff", "#0054ff", "#0044ff", "#0032ff", "#0022ff", "#0012ff", "#0002ff", "#0000ff", "#0100ff", "#0200ff", "#0300ff", "#0400ff", "#0500ff"];
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Ambient temperature (\u00B0C)');
	data.addColumn({type:'string', role:'style'});
	data.addColumn('number', 'Sky temperature (\u00B0C)');
	if (prevDayData) data.addColumn('number', 'Previous day (\u00B0C)');
	
	let tempStart = 0;
	let tempEnd = 40;
	let tempRange = tempEnd - tempStart;
	console.log("Datestring", dateString);
	
	var today = [];
	var prevDay = [];
	if (prevDayData) {
		// Split the data
		let year = parseInt(dateString.substring(0, 4));
        let month = parseInt(dateString.substring(5, 7));
        let day = parseInt(dateString.substring(8, 10));
        var splitDateTime = new Date(year, month-1, day, 12, 0, 0);
		for (line of dayData) {
			if (line.dateTime<splitDateTime) {
				prevDay.push(line);
			} else {
				today.push(line);
			}
		}
		console.log("Today has", today.length, " datapoints");
		console.log("Yesterday has", prevDay.length, " datapoints");
		for (line of prevDay) {
			console.log(line);
			line.dateTime = new Date(line.dateTime.getTime() + 86400*1000); 
		}
	} else today = dayData;
	console.log("Today has", today.length, " datapoints");
		
	for (var line of today){
		colourIndex = Math.round((line.Temperature - tempStart) / tempRange * colourTable.length);
		if (colourIndex<0) colourIndex = 0;
		if (colourIndex>colourTable.length - 1) colourIndex = colourTable.length - 1;
		colourIndex = colourTable.length - 1 - colourIndex;
		let colorString = 'point { stroke-color:' + colourTable[colourIndex] + '; fill-color:' + colourTable[colourIndex] + ';}';
		if (!prevDayData) {
			data.addRow([line.dateTime, line.Temperature, colorString, line.IRSky]); 
			//console.log(line);
		} else data.addRow([line.dateTime, line.Temperature, colorString, null]);
		}

	if (prevDayData) {
		for (var line of prevDay){
			data.addRow([line.dateTime, null, null, line.Temperature]); 
		}
	}

	
	dateFormatter.format(data, 0);
	
	var options = {
		title: 'Conditions on ' + dateString,
		hAxis: {title: 'Time', format: 'HH:mm', viewWindow: { min: startDate, max: endDate}},
		vAxis: {title: 'Temperature (\u00B0C)' },
		legend: { position: 'in' }, 
		chartArea: {
			left: "15%",
			top: "5%",
			height: "80%",
			width: "75%"
		},
		pointSize: 2,
		colors: ['green', 'grey']

	};

	if (prevDayData) options.series =  {
											0: {pointSize: 3},
											1: {color: "#999999", pointSize: 1}
										};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_temperature'));  
	chart.draw(data, options);
	
}

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

function drawHumidityChart() {
	const colourTable = ["#FF0030", "#FF0020", "#FF0010", "#FF0000", "#FF0a00", "#FF1400", "#FF1e00", "#FF2800", "#FF3200", "#FF3c00", "#FF4600", "#FF5000", "#FF5a00", "#FF6400", "#FF6e00", "#FF7800", "#FF8200", "#FF8c00", "#FF9600", "#FFa000", "#FFaa00", "#FFb400", "#FFbe00", "#FFc800", "#FFd200", "#FFdc00", "#FFe600", "#FFf000", "#FFfa00", "#fdff00", "#d7ff00", "#b0ff00", "#8aff00", "#65ff00", "#3eff00", "#17ff00", "#00ff10", "#00ff36", "#00ff5c", "#00ff83", "#00ffa8", "#00ffd0", "#00fff4", "#00e4ff", "#00d4ff", "#00c4ff", "#00b4ff", "#00a4ff", "#0094ff", "#0084ff", "#0074ff", "#0064ff", "#0054ff", "#0044ff", "#0032ff", "#0022ff", "#0012ff", "#0002ff", "#0000ff", "#0100ff", "#0200ff", "#0300ff", "#0400ff", "#0500ff"];
	let humStart = 0;
	let humEnd = 100;
	let humRange = humEnd - humStart;
	var dateString = formatDate(startDate);

	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Relative Humidity (%)');
	data.addColumn({type:'string', role:'style'});
	

	
	for (var line of dayData){
		colourIndex = Math.round((line.RelativeHumidity- humStart) / humRange * colourTable.length);
		if (colourIndex<0) colourIndex = 0;
		if (colourIndex>colourTable.length - 1) colourIndex = colourTable.length - 1;
		let colourString = 'point { stroke-color:' + colourTable[colourIndex] + '; fill-color:' + colourTable[colourIndex] + ';}';
		data.addRow([line.dateTime, line.RelativeHumidity, colourString]);
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
	pointSize: 2
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
	pointSize: 2
	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_pressure'));  
	chart.draw(data, options);
	
}

function drawCPUChart() {
	var dateString = formatDate(startDate);
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'CPU temperature (\u00B0C)');
	data.addColumn('number', 'Cabinet temperature (\u00B0C)');
	
	for (var line of dayData){
		data.addRow([line.dateTime, line.CPUtemperature, line.IRAmbient]);
	}

	var options = {
	title: 'Conditions on ' + dateString,
	hAxis: {title: 'Time', format: 'HH:mm', viewWindow: { min: startDate, max: endDate}},
	vAxis: {title: 'Temperature (\u00B0C)'},
	legend: { position: 'in' }, 
	chartArea: {
		left: "15%",
		top: "5%",
		height: "80%",
		width: "75%"
	},
	pointSize: 2,
	colors: ['red', 'grey']

	};

	chart = new google.visualization.ScatterChart(document.getElementById('chart_CPU'));  
	chart.draw(data, options);
	
}

