var api=new SpreadsheetWebApi();
var save = false;
var ApplicationKey = $("#hdApplicationKey").val();

var outputs = [
	"oResults",
	"rowCount"
];

/**
 *Set return values to <span>s
 *Values should return from single cell
 *@param {string[]} labels span ids
 *@param {string[]} values value.OutputRanges
 */
function setOutputsToSpan_Single(labels, values) {
    for (var i = 0; i < labels.length; i++)
        if ($('#' + labels[i]).length > 0 && api.getOutputValuesByName(values, labels[i])[0][0].Value != null)
            $('#' + labels[i]).html(api.getOutputValuesByName(values, labels[i])[0][0].Value);
}



/*
 * helper for dataToTable
 */
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}
/*
 * sets 2-dimensional output to tables
 * tables can be crated with emmet script: table#tbl_$>(tr>th*4)+tr.row_$*3>td.col_$*4>span
 * @param {string[]} values
 * @param {string[]} tableId
 * @param {string[]} series if there are headers for first column
 */
function dataToTable(values, tableId, series) {
    x = Object.size(values.Value);
    y = Object.size(values.Value[0]);
    if (series == null) {
        for (var i = 0; i < x; i++) {
            for (var j = 0; j < y; j++) {
                $("table#tbl_" + tableId + " tr.row_" + (i + 1) + " td.col_" + (j + 1) + " span").html(values.Value[i][j].Text);
            }
        }    
    } else {
        for (var i = 0; i < x; i++) {
            $("table#tbl_" + tableId + " tr.row_" + (i + 1) + " td.col_1 span").html(values.Value[i][0])
            for (var j = 0; j < y; j++) {
                $("table#tbl_" + tableId + " tr.row_" + (i + 1) + " td.col_" + (j + 2) + " span").html(values.Value[i][j].Text);
            }
        }
    }
}
var sys = "";
var cat = "";
function showUnits() {
	sys = $("input[type='radio'][name='iSystem']:checked").val();
	cat = $("input[type='radio'][name='iCategory']:checked").val();
	$(".metric-weight, .metric-length, .metric-area, .metric-volume,.us-weight, .us-length, .us-area, .us-volume").hide();
	$("." + sys + "-" + cat).show();
}
$("tr:nth-child(n+4)").css("display","none");
showUnits();
// Send inputs and get results, results are stored in value variable
function Calculate() {
	var inputList = [];
	inputList = [
		api.createSingleInput('iSystem', $("input[type='radio'][name='iSystem']:checked").val())
		, api.createSingleInput('iCategory', $("input[type='radio'][name='iCategory']:checked").val())
		, api.createSingleInput('iValue', $("#iValue").val())
		, api.createSingleInput('iUnit', $("input[type='radio'][name='" + sys.substring(0,1) + "-" + cat.substring(0,1) + "-iUnit']:checked").val())
		
	];
	
	api.Calculate({
		'Inputs': inputList
		, 'Outputs':outputs
		, 'SaveInformation': {
			'Save': false
		}
	}, function(data){
		if (data.Success){
			dataToTable(data.Outputs[0],1);
			var rowNum = data.Outputs[1].Value[0][0];
			$("tr").css("display","table-row");
			$("tr:nth-child(n+" + (parseInt(rowNum)+1) + ")").css("display","none");
		}
		setOutputsToSpan_Single(outputs, data);
	})

}

$(document).ready(function () {
	$(":input").bind('keyup mouseup', function () {
		Calculate();
	});
	$("input:radio").on("change", function () {
		//What happens when an input is changed
		var nm = $(this).attr("name")
		if (nm == "iSystem" || nm == "iCategory") {
			showUnits();	
		};
		Calculate();
	});
	$("button").click(function () {
		//What happens when a button is clicked
	});
	// Ajax activity indicator bound to ajax start/stop document events
	$(document).ajaxStart(function () {
		$("#ajaxBusy").show();
	}).ajaxStop(function () {
		$("#ajaxBusy").hide();
	});
});
