var api=new SpreadsheetWebApi();
var ApplicationKey = $("#hdApplicationKey").val();



var x = "iRate"; // name of Goal Seek cell
var outputs = [
"payment",
"paymentDer"
];

// Send inputs and get results, results are stored in value variable
function Calculate () {
	var loanAmount = $("#loanAmount").val();
	var term = $("#term").val();
	var payment = $("#payment").val();
	var startValue = 0;
	var toValue = -1 * payment;
	var maxIter = 20; // maximum iteration
	var tolerance = 0.00001; // solution is found when result is within tolerance
	var i = 0; // iteration number
	var inputList = [
		api.createSingleInput('LoanAmount', loanAmount),
		api.createSingleInput('TermInMonths', term),
		api.createSingleInput('InterestRate', startValue)
	];
	var Xn = startValue; // initial x-value
	var Xn1 = 0;
	var Fx = 0;
	var F_x = 0;   // derivative of function
				 // it can be calculated by this formula: (F(x + h) - F(x))/h 
				 // you can add this function in excel 
				 // or call API for x + h input but this approach will double up API call number
				 // it was added in excel in this case
(function GetResultRecur() {
	api.Calculate({
		'Inputs': inputList
		, 'Outputs':outputs
		, 'SaveInformation': {
			'Save': false
		}
	}, function(data){
			
			Fx = data.Outputs[0].Value[0][0].Value;
			F_x = data.Outputs[1].Value[0][0].Value;
			Xn1 = Xn - ((Fx - toValue) / F_x);
			if (Math.abs(Xn - Xn1) <= tolerance) {
				$("#output").show();
				$("#oRate").html((Xn * 100).toFixed(2) + "%");
				$("#oSteps").html(i+1);
				return;
			} else {
				Xn = Xn1;
			}
			inputList = [
				api.createSingleInput('LoanAmount', loanAmount),
				api.createSingleInput('TermInMonths', term),
				api.createSingleInput('InterestRate', Xn)
			];
			

			if (i < maxIter) {
				i++;
				GetResultRecur();
			};
	});

})();
}
$(document).ready(function () {
	// Ajax activity indicator bound to ajax start/stop document events
	$(document).ajaxStart(function () {
		$("#ajaxBusy").show();
	}).ajaxStop(function () {
		$("#ajaxBusy").hide();
	});

	$("#calc").click(function () {
		//What happens when a button is clicked
		Calculate();
	});
});
