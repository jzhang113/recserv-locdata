var prev;
var occupacy;
var maxCapacity = [];
var locations = [];

$(document).ready (function() {
	getData();
});

function getData() {
	$.ajax ({
		type: "GET",
		url: "https://goboardapi.azurewebsites.net/api/FacilityCount?AccountAPIKey=8C72A6A7-D6EE-4520-BC3A-52215462AC23",
		cache: false,
		timeout: 300000,
		
		contentType: "application/json; charset:UTF-8",
		accepts: "application/json",

		success: function (data) {
			console.log ("new request at " + Date.now());	
			
			if (data != prev)
				processData (data);
			
			setTimeout (getData, 300000); // 5 minutes
		},
		error: function (data) {
			// TODO error handling stuff
		}
	});
}

function processData (data) {
	occupancy = [];
	var popData = JSON.parse (data);

	if (prev != null) {
		var prevData = JSON.parse (prev);
	} else {
		for (let loc of popData) {
			maxCapacity.push (loc.TotalCapacity);
			locations.push (loc.LocationName);
		}
	}

	let count = document.getElementById ("count");
	count.innerHTML = "";

	for (let i = 0; i < popData.length; i++) {
		let loc = popData[i];
		occupancy.push (loc.LastCount);
		
		count.innerHTML += loc.LocationName + ": ";
		count.innerHTML += loc.LastCount + " / " + loc.TotalCapacity;
		if (prevData != null)
			count.innerHTML += "  (" + formatNum (loc.LastCount - prevData[i].LastCount) + ")";
		count.innerHTML += "<br/>";
	}

	document.getElementById ("update").innerHTML = "Last Updated: " + popData[0].LastUpdatedDateAndTime;
	
	barGraph();

	prev = data;
}

function barGraph() {
	var fullness = [];

	var width = "100%";
	var height = 300;
	var padding = 2;

	var green = [41, 186, 0];
	var yellow = [205, 180, 0];
	var red = [169, 0, 0];

	for (let i = 0; i < occupancy.length; i++) {
		fullness.push (occupancy[i] / maxCapacity[i] * 100);
	}

	var chart = d3.select ("#chart");
	
	// enter new data
	var barGroup = chart.selectAll ("g")
		.data (fullness)
		.enter()
		.append ("g");

	barGroup.append ("rect").append ("title");
	barGroup.append ("text");

	// update data
	chart.selectAll ("g").select ("rect")
		.attr ("x", 0)
		.attr ("y", function (d, i) {
			return i * (height / fullness.length);
		})
		.attr ("width", function (d) {
			return d + "%";
		})
		.attr ("height", height / fullness.length - padding)
		.attr ("fill", function (d) {
			return (d < 50) ? "rgb(" + Math.round (green[0] + (yellow[0] - green[0]) / 50 * d) + ", " + Math.round (green[1] + (yellow[1] - green[1]) / 50 * d) + ", " + Math.round(green[2] + (yellow[2] - green[2]) / 50 * d) + ")" : "rgb(" + Math.round (yellow[0] + (red[0] - yellow[0]) / 50 * (d - 50)) + ", " + Math.round (yellow[1] + (red[1] - yellow[1]) / 50 * (d - 50)) + ", " + Math.round (yellow[2] + (red[2] - yellow[2]) / 50 * (d - 50)) +")";
		})

	chart.selectAll ("g").select ("title")
		.text (function (d) {
			return d.toFixed (2) + "%";
		});

	chart.selectAll ("g")
		.data (locations)
		.enter()
		.append ("g")
		.append ("text");
	
	chart.selectAll ("g").select ("text")
		.text (function (d) {
			return d;
		})
		.attr ("x", 10)
		.attr ("y", function (d, i) {
			return i * (height / fullness.length) + (height / fullness.length - padding) / 2 + 4;
		});
	
	// remove extra data
	chart.selectAll ("g")
		.exit()
		.remove();

}

function formatNum (n) {
	return (n > 0 ? "+" + n : n)
}
