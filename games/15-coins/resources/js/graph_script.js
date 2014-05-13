var plot_data = [
					{label: "&nbsp;Easy",data: []},
					{label: "&nbsp;Medium",data: []},
					{label: "&nbsp;Hard",data: []},
					{label: "&nbsp;Unbeatable",data: []},
				];

var plot_options = {
	lines: {
		show: true
	},
	points: {
		show: true
	},
	xaxis: {
		tickSize:1, 
		tickDecimals:0,
		min:1
	},
	yaxis: {
		min: 0,
		max: 15,
	},
	grid: {
		hoverable: true,
		clickable: true
	},
	zoom: {
		interactive: false
	},
	pan: {
		interactive: false
	},
	legend: { show: true, position: "nw" }

};

var plot;




$(document).ready(function() {
	//get data from localStorage
	if (!getData()) {
		//show no data
		$('#graph-background').css("display", "none");
		$('#no-data').css("display", "block");
	} else {
		//plot plot
		console.log(plot_data);
		plot = $.plot( $("#graph-placeholder"), plot_data, plot_options);
		//create choices
		createChoices();

		$('#choices').click(function (e) {
	        plotAccordingToChoices();
	    });
	}

});

function plotAccordingToChoices() {
	var data = [];

	$("p#choices").find("input:checked").each(function () {
		var key = $(this).attr("name");
		if (key && plot_data[key]) {
			data.push(plot_data[key]);
		}
	});

	plot.setData(data);
	plot.setupGrid();
	plot.draw();
}
/*
	//example data in localStorage
[
{"difficulty":3,"time_e":7.54,"player_points":3},
{"difficulty":3,"time_e":16.241,"player_points":4}
]

*/
function getData() {
	var score = JSON.parse(localStorage.getItem('8787_score')) || [];
	if (score.length < 1) return 0;
		
	var diff = [0, 0 ,0 ,0];
	console.log(diff);
	for (var i = 0; i < score.length; i++) {
		plot_data[score[i].difficulty-1].data.push([diff[score[i].difficulty-1]+1, score[i].player_points]);
		diff[score[i].difficulty-1]++;
	};
	console.log(diff);
	return 1;
}

function createChoices() {
	//console.log(plot_data);
	var i = 0;
	$.each(plot_data, function(key, val) {
		val.color = i;
		++i;
	});

	$("p#choices").prepend("Display: &nbsp;&nbsp;");
	$.each(plot_data, function(key, val) {
		//console.log(key + ": " +val.label)
		$("p#choices").append(" <input type='checkbox' name='" + key +
			"' checked='checked' id='id" + key + "'></input>" +
			"<label for='id" + key + "'>"
			+ val.label + "</label>&nbsp;&nbsp;&nbsp;");
	});
}