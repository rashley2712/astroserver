function drawTempChart(temperatureData) {
	var data = new google.visualization.DataTable();
	var dateFormatter = new google.visualization.DateFormat({pattern: 'dd/MM/yyyy HH:mm'});
	const colourTable = ["#FF0030", "#FF0020", "#FF0010", "#FF0000", "#FF0a00", "#FF1400", "#FF1e00", "#FF2800", "#FF3200", "#FF3c00", "#FF4600", "#FF5000", "#FF5a00", "#FF6400", "#FF6e00", "#FF7800", "#FF8200", "#FF8c00", "#FF9600", "#FFa000", "#FFaa00", "#FFb400", "#FFbe00", "#FFc800", "#FFd200", "#FFdc00", "#FFe600", "#FFf000", "#FFfa00", "#fdff00", "#d7ff00", "#b0ff00", "#8aff00", "#65ff00", "#3eff00", "#17ff00", "#00ff10", "#00ff36", "#00ff5c", "#00ff83", "#00ffa8", "#00ffd0", "#00fff4", "#00e4ff", "#00d4ff", "#00c4ff", "#00b4ff", "#00a4ff", "#0094ff", "#0084ff", "#0074ff", "#0064ff", "#0054ff", "#0044ff", "#0032ff", "#0022ff", "#0012ff", "#0002ff", "#0000ff", "#0100ff", "#0200ff", "#0300ff", "#0400ff", "#0500ff"];
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Ambient temperature (\u00B0C)');
	data.addColumn({type:'string', role:'style'});
	
	
    var colourLookup = function(temperature) {
        let tempStart = 0;
	    let tempEnd = 35;
        let tempRange = tempEnd - tempStart;
        let colourIndex = Math.round((temperature - tempStart) / tempRange * colourTable.length);
        if (colourIndex<0) colourIndex = 0;
		if (colourIndex>colourTable.length - 1) colourIndex = colourTable.length - 1;
        colourIndex = colourTable.length - 1 - colourIndex;   // Flip the table from blue to red
        return colourTable[colourIndex];
    }
	
	//console.log("temperature data has", temperatureData.length, "datapoints");
	
	// Add proper datetimes to the incoming data
	for (var line of temperatureData) {
		let year = parseInt(line.Date.substring(0, 4));
		let month = parseInt(line.Date.substring(4, 6));
		let day = parseInt(line.Date.substring(6, 8));
		let hour = parseInt(line.Date.substring(9, 11));
		let minute = parseInt(line.Date.substring(11, 13));
		let second = 0;
		line.dateTime = new Date(year, month-1, day, hour, minute, second);
    }
    
    let startDate = temperatureData[0].dateTime;
    let endDate = temperatureData[temperatureData.length - 1].dateTime;
    
    let averageTemperature = 0;
	for (var line of temperatureData){
        averageTemperature+= line.temperature;
		let tempColour = colourLookup(line.temperature);
        let colourString = 'point { stroke-color:' + tempColour + '; fill-color:' + tempColour + ';}';
    	data.addRow([line.dateTime, line.temperature, colourString]);
		
	}
    averageTemperature/= temperatureData.length;
    averageTemperature = decimalPlacesFloat(averageTemperature, 1);
    
    dateFormatter.format(data, 0);
    
    // Work out the 'average' datapoint colour for the key label
    console.log("Mean temperature:", averageTemperature);
    let keyColour = colourLookup(averageTemperature);
    console.log(keyColour);

	var options = {
		title: '',
		hAxis: {title: 'Time', viewWindow: { min: startDate, max: endDate}},
		vAxis: {title: 'Temperature (\u00B0C)' },
		legend: { position: 'in' }, 
		chartArea: {
			left: "15%",
			top: "5%",
			height: "80%",
			width: "75%"
		},
		pointSize: 3,
		colors: [keyColour, 'grey', 'lightgrey']

	};
	if (hoursBack<30) options.hAxis.format="HH:mm";
	else options.hAxis.format="dd/MM/yyyy";
	

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

function drawHumidityChart(humidityData) {
	const colourTable = ["#FF0030", "#FF0020", "#FF0010", "#FF0000", "#FF0a00", "#FF1400", "#FF1e00", "#FF2800", "#FF3200", "#FF3c00", "#FF4600", "#FF5000", "#FF5a00", "#FF6400", "#FF6e00", "#FF7800", "#FF8200", "#FF8c00", "#FF9600", "#FFa000", "#FFaa00", "#FFb400", "#FFbe00", "#FFc800", "#FFd200", "#FFdc00", "#FFe600", "#FFf000", "#FFfa00", "#fdff00", "#d7ff00", "#b0ff00", "#8aff00", "#65ff00", "#3eff00", "#17ff00", "#00ff10", "#00ff36", "#00ff5c", "#00ff83", "#00ffa8", "#00ffd0", "#00fff4", "#00e4ff", "#00d4ff", "#00c4ff", "#00b4ff", "#00a4ff", "#0094ff", "#0084ff", "#0074ff", "#0064ff", "#0054ff", "#0044ff", "#0032ff", "#0022ff", "#0012ff", "#0002ff", "#0000ff", "#0100ff", "#0200ff", "#0300ff", "#0400ff", "#0500ff"];
	let humStart = 0;
	let humEnd = 100;
	let humRange = humEnd - humStart;
	
    //console.log("humidity data has", humidityData.length, "datapoints");
    
    var colourLookup = function(humidity) {
        let humStart = 0;
	    let humEnd = 100;
        let humRange = humEnd - humStart;
        let colourIndex = Math.round((humidity - humStart) / humRange * colourTable.length);
        if (colourIndex<0) colourIndex = 0;
		if (colourIndex>colourTable.length - 1) colourIndex = colourTable.length - 1;
        // colourIndex = colourTable.length - 1 - colourIndex;   // Flip the table from blue to red
        return colourTable[colourIndex];
    }
	
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'Time of day');
	data.addColumn('number', 'Relative Humidity (%)');
	data.addColumn({type:'string', role:'style'});
	
	// Add proper datetimes to the incoming data
	for (var line of humidityData) {
		let year = parseInt(line.Date.substring(0, 4));
		let month = parseInt(line.Date.substring(4, 6));
		let day = parseInt(line.Date.substring(6, 8));
		let hour = parseInt(line.Date.substring(9, 11));
		let minute = parseInt(line.Date.substring(11, 13));
		let second = 0;
		line.dateTime = new Date(year, month-1, day, hour, minute, second);
	}
    
    let startDate = humidityData[0].dateTime;
    let endDate = humidityData[humidityData.length - 1].dateTime;
    
    let humidityValues = [];
	for (var line of humidityData){
        let humColour = colourLookup(line.humidity);
        let colourString = 'point { stroke-color:' + humColour + '; fill-color:' + humColour + ';}';
		data.addRow([line.dateTime, line.humidity, colourString]);
        humidityValues.push(line.humidity);
    }
    
    let humidityMedian = calculateMedian(humidityValues);
    

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

	if (hoursBack<30) options.hAxis.format="HH:mm";
	else options.hAxis.format="dd/MM/yyyy";
	
	chart = new google.visualization.ScatterChart(document.getElementById('chart_humidity'));  
	chart.draw(data, options);
	
}

function drawHumidityHistogram(humidityData) {
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'percent');
	data.addColumn('number', 'Relative Humidity (%)');
	

	for (var line of humidityData){
		//console.log(line);
		data.addRow([line.bin_floor, line.count]);
	}

	var options = {
	vAxis: { title: 'Frequency'},
	hAxis: { title: 'Relative Humidity (%)', viewWindow: { min: 0, max:100} },
	legend: {position: 'none'}
	};

	chart = new google.visualization.ColumnChart(document.getElementById('chart_humidity_stats'));  
	chart.draw(data, options);
	
}

