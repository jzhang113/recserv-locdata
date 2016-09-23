// vivid green? #2ecc71

var url = "http:\//goboardapi.azurewebsites.net/api/FacilityCount?AccountAPIKey=8C72A6A7-D6EE-4520-BC3A-52215462AC23";
getData (url, processData);

function processData (data) {
	var popData = JSON.parse (data);

	for (let loc of popData) {
		console.dir (loc);

		let count = document.getElementById ("count");
		count.innerHTML += loc.LocationName + ": ";
		count.innerHTML += loc.LastCount + " / ";
		count.innerHTML += loc.TotalCapacity;
		count.innerHTML += "<br/>";
	}

	document.getElementById ("update").innerHTML += popData[0].LastUpdatedDateAndTime;
}

function getData (url, callback) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 & xhr.status == 200)
			callback (xhr.response);
	}

	xhr.open ("GET", url, true);
	xhr.setRequestHeader ("content-type", "application/json; charset = utf-8");
	xhr.setRequestHeader ("accept", "application/json");
	xhr.send (null);
}
