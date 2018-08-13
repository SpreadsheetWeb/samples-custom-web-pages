var api=new SpreadsheetWebApi();
var save = false;


var ApplicationKey = $("#hdApplicationKey").val();

var simulationEntries = [];
var ResultsCount = 0;
var numSimulation = 0;

function calc(cb){
	var inputsArray = [
	  api.createSingleInput('initial', $("#initial").val()),
	  api.createSingleInput('rate', ($("#rate").val() / 100).toString()),
	  api.createSingleInput('rateStdDev', ($("#rateStdDev").val() / 100).toString()),
	  api.createSingleInput('year', $("#year").val()),
	  api.createSingleInput('investment', $("#investment").val())
	];
	var outputs = [
	  "ending"
	];
	
	api.Calculate({
		'Inputs': inputsArray
		, 'Outputs':outputs
		, 'SaveInformation': {
			'Save': false
		}
	}, function(data){
		
		simulationEntries.push([{'Value':api.getOutputValuesByName(data.Outputs,"ending")[0][0].Value}]);
		window.ResultsCount += 1;
		
		if (window.ResultsCount >= numSimulation) {
			window.ResultsCount = 0;
			CalculateSimulation (false);
		}else{
			calc();
		}
	}); 
}
function Calculate (save) {
	save = save || false;

	window.ResultsCount = 0;
	numSimulation = parseInt($("#numSimulation").val());
	simulationEntries = [];
	currentSimulation=0;
	calc();
	
}
function RangeInput(arr) {
	for (var i = arr.length; i < 1000; i++) {
		arr.push([{'Value': null}])
	}
	return arr;
}
function CalculateSimulation (save) {
	save = save || false;
	var inputsArray = [
	  api.createSingleInput('percBegin', $("#percBegin").val() / 100),
	  api.createSingleInput('percEnd', $("#percEnd").val() / 100),
	  {'Ref':'simulationResults', 'Value':RangeInput(simulationEntries)}
	  
	];
	

	var outputs = [
	  "valueBegin",
	  "valueEnd",
	  "range",
	  "average",
	  "median",
	  "chartData"
	];

	api.Calculate({
		'Inputs': inputsArray
		, 'Outputs':outputs
		, 'SaveInformation': {
			'Save': false
		}
	}, function(data){
		var jData=data.Outputs;
		CreateChart(
		  JSON.parse(api.getOutputValuesByName(jData,"chartData")[0][0].Value),
		  "chartdiv",
		  "Distribution"
		);
	});

}
$(document).ready(function () {
	// Ajax activity indicator bound to ajax start/stop document events
	$(document).ajaxStart(function () {
	  $("#ajaxBusy").show();
	}).ajaxStop(function () {
	  $("#ajaxBusy").hide();
	});
	$("#calc").click(function () {
	  Calculate(false);
	});
	$('form').submit(function () {
	 return false;
	});
});
