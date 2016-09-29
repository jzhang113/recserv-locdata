// vivid green? #2ecc71

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

	if (prev != null)
		var prevData = JSON.parse (prev);
	else {
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
	var width = 500;
	var height = 300;
	var padding = 2;
	var fullness = [];

	for (let i = 0; i < occupancy.length; i++) {
		fullness.push (occupancy[i] / maxCapacity[i] * 100);
	}
	
	var chart = d3.select ("body").select ("#chart")
		.append ("svg")
		.attr ("width", width)
		.attr ("height", height);

	chart.selectAll ("rect")
		.data (fullness)
		.enter()
		.append ("rect")
		.attr ("x", 0)
		.attr ("y", function (d, i) {
			return i * (height / fullness.length);
		})
		.attr ("width", function (d) {
			return d * 10;
		})
		.attr ("height", height / fullness.length - padding)
		.attr ("fill", function (d) {
			return (d < 50) ? "rgb(" + Math.round (41 + 3.28 * d) + ", " + Math.round (186 - 0.12 * d) + ", 0)" : "rgb(" + Math.round (205 - 0.72 * (d - 50)) + ", " + Math.round (180 - 3.6 * (d - 50)) + ", 0)";
		});

	chart.selectAll ("text")
		.data (locations)
		.enter()
		.append ("text")
		.text (function (d) {
			return d;
		})
		.attr ("x", 10)
		.attr ("y", function (d, i) {
			return i * (height / fullness.length) + (height / fullness.length - padding) / 2 + 4;
		});
}

function formatNum (n) {
	return (n > 0 ? "+" + n : n)
}
