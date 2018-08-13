var helper = {
    getType: function (obj) {
        let objType = typeof obj;
        let returnType = 'null';

        //handle errors
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';

        //switch original type
        switch (objType) {
        case 'string':
        case 'number':
        case 'boolean':
        case 'function':
            returnType = objType;
            break;
        default:
            {
                //check whether the object has getMonth member
                if (typeof obj.getMonth === 'undefined') {
                    if (Object.prototype.toString.call(obj) === '[object Array]')
                        returnType = 'array';
                    else if (Object.prototype.toString.call(obj) === '[object Function]')
                        returnType = 'function';
                    else if (Object.prototype.toString.call(obj) === '[object NodeList]')
                        returnType = 'nodeList';
                    else if (Object.prototype.toString.call(obj) === '[object Object]') {
                        returnType = 'object';
                    } else {
                        let isHTMLElement = (typeof HTMLElement === "object" ? obj instanceof HTMLElement : obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string");
                        if (isHTMLElement)
                            returnType = 'htmlElement';
                        else
                            returnType = 'wtf';
                    }
                } else {
                    returnType = 'date';
                }
            }
            break;
        }

        return returnType;
    }
};
var enums = {
    'DocumentOutputMode': {
        'ReturnDocument': 0,
        'StoreInFileSystem': 1
    },
    'DocumentPrintMode': {
        'PDF': 0,
        'Word': 1
    },
    'PageSize': {
        'A4': 0,
        'Letter': 1
    },
    'Orientation': {
        'Portrait': 0,
        'Landscape': 1
    }
}

//Base class, corresponding to a request for an application.
function BaseApplicationRequest(options) {
    //set members
    this.ApplicationKey = ''; //string

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object representing a cell
function CellValue(options) {
    //set members
    this.Type = ''; //string
    this.Value = ''; //string
    this.Format = ''; //string
    this.Text = ''; //string
    this.toString = function() { return this.Value ? this.Value : ''; };

    //iterate all keys in options
    for (var key in options) {
        if (key === 'toString') continue;
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//An object representing a range reference which will be used in calculations.
function RangeReference(options) {
    //set members
    this.Ref = ''; //string
    this.Value = []; //two dimensional object array
    this.GetValueArray = function () { return this.Value ? this.Value : ''; };

    //iterate all keys in options
    for (var key in options) {
        if (key === 'GetValueArray') continue;
        if (key === 'Value') {
            if (options.Value && helper.getType(options.Value) === 'array') {
                if (helper.getType(options.Value[0]) === 'array') {
                    for (var i = 0; i < options.Value.length; i++) {
                        var oRow = options.Value[i],
                            tRow = [];
                        for (var j = 0; j < oRow.length; j++) {
                            tRow.push(new CellValue(oRow[j]));
                        }
                        this.Value.push(tRow);
                    }
                } else {
                    this.Value = [[new CellValue()]];
                }
            } else {
                this.Value = [[new CellValue()]];
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object to define related information for goal seek calculations.
function GoalSeekInformation(options) {
    //set members
    this.Enabled = false; // boolean
    this.TargetRef = ''; //string
    this.ChangingRef = ''; //string
    this.TargetValue = 0; //double
    this.MaxIterations = 1000; //integer
    this.MaxChange = 0.000001; //double

    //iterate all keys in options
    for (var key in options) {
        if (key === 'IsGoalSeek') continue;
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Base class, corresponding to a request for a calculation.
function CalculationSet(options) {
    //set members
    this.Inputs = []; //object array
    this.Outputs = []; //string array
    this.GoalSeek = new GoalSeekInformation(options.GoalSeek ? options.GoalSeek : {});

    //iterate all keys in options
    for (var key in options) {
        if (key === 'GoalSeek') continue;
        if (key === 'Inputs') {
            if (helper.getType(options.Inputs) === 'array') {
                for (var i = 0; i < options.Inputs.length; i++) {
                    this.Inputs.push(new RangeReference(options.Inputs[i]));
                }
            } else {
                this.Inputs = [new RangeReference()];
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object for an individual calculation request in a batch calculation.
function BatchCalculationRequestSet(options) {
    this.Id = null; //integer?
    this.Request = new CalculationSet(options.Request ? options.Request : {});;

    //iterate all keys in options
    for (var key in options) {
        if (key === 'Request') continue;
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Request object for opening a dedicated session.
function OpenSessionRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
}
//Request object for closing a dedicated session.
function CloseSessionRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.SessionId = ''; //guid
}
//Request object to get record information.
function RecordRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.RecordId = null; //integer
    this.UserName = ''; //string

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object for a document generation request.
function GenerateDocumentRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.DocumentKey = ''; //guid
    this.Mappings = {}; // key/value pair
    this.OutputMode = enums.DocumentOutputMode.ReturnDocument;
    this.PrintMode = enums.DocumentPrintMode.PDF;

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Request object that is used to get document stubs from a document.
function DocumentStubsRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.DocumentKey = ''; //guid

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Request object for a document merge.
function MergeDocumentRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.CacheKeys = []; //guid array
    this.PrintMode = enums.DocumentPrintMode.PDF;
    this.DeleteCachedFiles = true; //boolean

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object that keeps information on a document to be merged.
function DocumentMergeInfo(options) {
    //set members
    this.DocumentKey = ''; //guid
    this.InsertPageBreak = false; //boolean

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//A request object to be used for merging documents with additional options.
function MergeDocumentRequestExtended(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.DocumentMergeInformationInfos = []; //object array
    this.PrintMode = enums.DocumentPrintMode.PDF;
    this.DeleteCachedFiles = true; //boolean

    //iterate all keys in options
    for (var key in options) {
        if (key === 'DocumentMergeInformationInfos') {
            if (helper.getType(options.DocumentMergeInformationInfos) === array) {
                for (var i = 0; i < options.DocumentMergeInformationInfos.length; i++) {
                    this.DocumentMergeInformationInfos.push(new DocumentMergeInfo(options.DocumentMergeInformationInfos[i]));
                }
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object defining an email attachment.
function EmailAttachment(options) {
    //set members
    this.FileName = ''; //string
    this.ContentType = ''; //string
    this.FileContents = null;

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Request object representing an email.
function EmailRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.Subject = ''; //string
    this.Body = ''; //string
    this.From = ''; //string
    this.To = ''; //string
    this.CarbonCopy = ''; //string
    this.BlindCarbonCopy = ''; //string
    this.Attachments = []; //object array
    this.IsHtml = false; //boolean

    //iterate all keys in options
    if (key === 'Attachments') {
        if (helper.getType(options.Attachments) === array) {
            for (var i = 0; i < options.Attachments.length; i++) {
                this.Attachments.push(new EmailAttachment(options.Attachments[i]));
            }
        }
    }
    else if (this.hasOwnProperty(key)) this[key] = options[key];
}
//Request object used in a pdf export call.
function PdfRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.HtmlCode = ''; //string
    this.Title = ''; //string
    this.HostUrl = ''; //string
    this.FitToPage = false; //boolean
    this.Size = enums.PageSize.Letter;
    this.Orientation = enums.Orientation.Portrait;

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Request object to be used in ExportPdfByRange method.
function PdfByRangeRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.SessionId = ''; //string
    this.PageIndex = ''; //string
    this.Inputs = {}; // key/value pair {string,string array}

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object keeping information for the save event after calculation.
function SaveInformation(options) {
	//set members
	this.Save = false ; //boolean
	this.RecordId = null; //integer
	this.UserName = ''; //string
	this.SetRecordStatusIndex = null; //integer
	this.SetGroupId = null; //integer
	this.SetAssignedUserName = ''; //string
	
	//iterate all keys in options
	for (var key in options) {
		if (key === 'UserName') continue;
		if (this.hasOwnProperty(key)) this[key] = options[key];
	}
}
//Base class, corresponding to a request for a calculation.
function BaseCalculationRequest(options) {
	//inherit class
    BaseApplicationRequest.call(this, options);
	//set members
	this.Inputs = []; //object array
	this.Outputs = []; //string array
	this.GoalSeek = new GoalSeekInformation(options.GoalSeek ? options.GoalSeek : {});
	
	//iterate all keys in options
	for (var key in options) {
	    if (key === 'GoalSeek') continue;
	    if (key === 'Inputs') {
	        if (helper.getType(options.Inputs) === 'array') {
	            for (var i = 0; i < options.Inputs.length; i++) {
	                this.Inputs.push(new RangeReference(options.Inputs[i]));
	            }
	        } else {
	            this.Inputs = [new RangeReference()];
	        }
	    }
		else if (this.hasOwnProperty(key)) this[key] = options[key];
	}
}
//Base class, corresponding to a request for a calculation.
function CalculationRequest(options) {
    //inherit class
    BaseCalculationRequest.call(this, options);
	//set members
	this.SessionId = null; //object array
	this.FileVersion = null; //string array
	this.SaveInformation = new SaveInformation(options.SaveInformation ? options.SaveInformation : {});
	this.IsDedicated = function(){ return this.SessionId;};
	
	//iterate all keys in options
	for (var key in options) {
		if (key === 'FileVersion' || key === 'SessionId' || key === 'DataRecordInfo') continue;
		if (this.hasOwnProperty(key)) this[key] = options[key];
	}
}
//Request object for batch calculations.
function BatchCalculationRequest(options) {
    //inherit class
    BaseApplicationRequest.call(this, options);
    //set members
    this.UserName = null; //string
    this.SessionId = null; //string
    this.Requests = []; //object array

    //iterate all keys in options
    for (var key in options) {
        if (key === 'UserName' || key === 'SessionId') continue;
        if (key === 'Requests') {
            if (helper.getType(options.Requests) === 'array') {
                for (var i = 0; i < options.Requests.length; i++) {
                    this.Requests.push(new BatchCalculationRequestSet(options.Requests[i]));
                }
            } else {
                this.Requests = [new BatchCalculationRequestSet()];
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}

//A generic base response class, to be utilized to carry over common underlying properties across all requests.
function BaseResponse(options) {
    //set members
    this.Success = true; //boolean
    this.Messages = []; //string array

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Obect that contains results of the goal seek calculation.
function GoalSeekOutput(options) {
    //set members
    this.Success = false; // boolean
    this.ChangingFormat = ''; //string
    this.ChangingValue = ''; //string
    this.TargetFormat = ''; //string
    this.TargetText = ''; //string
    this.TargetValue = ''; //string

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object used to store secondary table row information.
function SecondaryTableRow(options) {
    //set members
    this.SequenceId = null; // integer
    this.Items = {}; // key/value pair

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Represents a string that will be replaced while generating a document.
function DocumentStub(options) {
    //set members
    this.StubName = ''; //string

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Response object for calculations.
function CalculationResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.Message = ''; //string
    this.Outputs = []; //object array
    this.GoalSeek = new GoalSeekOutput(options.GoalSeek ? options.GoalSeek : {});

    //iterate all keys in options
    for (var key in options) {
        if (key === 'GoalSeek') continue;
        if (key === 'Outputs') {
            if (helper.getType(options.Outputs) === 'array') {
                for (var i = 0; i < options.Outputs.length; i++) {
                    this.Outputs.push(new RangeReference(options.Outputs[i]));
                }
            } else {
                this.Outputs = [new RangeReference()];
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Object representing a response from a batch calculation.
function BatchCalculationResponseSet(options) {
    this.Id = -1; //integer
    this.Response = new CalculationResponse(options.Response ? options.Response : {});;

    //iterate all keys in options
    for (var key in options) {
        if (key === 'Response') continue;
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Request object for batch calculations.
function BatchCalculationResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.Message = ''; //string
    this.Responses = []; //object array

    //iterate all keys in options
    for (var key in options) {
        if (key === 'Responses') {
            if (helper.getType(options.Responses) === 'array') {
                for (var i = 0; i < options.Responses.length; i++) {
                    this.Responses.push(new BatchCalculationResponseSet(options.Responses[i]));
                }
            } else {
                this.Responses = [new BatchCalculationResponseSet()];
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Respnse object for an OpenDedicatedSession request.
function OpenSessionResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.SessionId = ''; //guid

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Response object returning from a close session request.
function CloseSessionResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
}
//Response object returning record data.
function RecordResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.Data = {}; // key/value pair

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Response object to return extended record request result.
function RecordExtendedResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.PrimaryTable = {}; // key/value pair
    this.SecondaryTables = {}; // key/value(object) pair

    //iterate all keys in options
    for (var key in options) {
        if (key === 'SecondaryTables') {
            //iterate all keys in options
            for (var secKey in options[key]) {
                this.SecondaryTables[secKey] = new SecondaryTableRow(options[secKey]);
            }
        }
        else if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Response object to return the results of a generate document request.
function GenerateDocumentResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.Document = null;
    this.CacheKey = ''; //guid
    
    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}
//Response object that is used to return document stubs in a document.
function DocumentStubsResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.DocumentStubList = []; //object array

    //iterate all keys in options
    if (key === 'DocumentStubList') {
        if (helper.getType(options.DocumentStubList) === array) {
            for (var i = 0; i < options.DocumentStubList.length; i++) {
                this.DocumentStubList.push(new DocumentStub(options.DocumentStubList[i]));
            }
        }
    }
    else if (this.hasOwnProperty(key)) this[key] = options[key];
}
//Response object for an email request.
function EmailResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
}
//Response object to return the results of a generate document request.
function PdfResponse(options) {
    //inherit class
    BaseResponse.call(this, options);
    //set members
    this.FileContents = null;

    //iterate all keys in options
    for (var key in options) {
        if (this.hasOwnProperty(key)) this[key] = options[key];
    }
}

function SpreadsheetWebApi() {

    function GetResponseFromService(request, method, cb) {
        $.ajax({
            type: 'POST',
            url: $("#hdServerUrl").val() + "/" + method,
            data: JSON.stringify({ request: request }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            crossDomain: true,
            success: function (data) {
                if (cb != null) {
                    cb(data.d);
                }
            },
            error: function (ex, textStatus, errorThrown) {
                console.log(ex);
                console.log(textStatus, errorThrown);
                alert("An error occured. Please check developer console for information.");
            }
        });
    }

    function handleResponse(res, cb) {
        if (cb != null) {
            cb(res);
        }
    }

    function addApplicationData(options) {
        options.ApplicationKey = $("#hdApplicationKey").val();
        return options;
    }

    this.Calculate = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new CalculationRequest(options), 'Calculate', function (response) {
            var resObj = new CalculationResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.BatchCalculate = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new BatchCalculationRequest(options), 'BatchCalculate', function (response) {
            var resObj = new BatchCalculationResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.OpenDedicatedSession = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new OpenSessionRequest(options), 'OpenDedicatedSession', function (response) {
            var resObj = new OpenSessionResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.CloseDedicatedSession = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new CloseSessionRequest(options), 'CloseDedicatedSession', function (response) {
            var resObj = new CloseSessionResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.GetRecord = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new RecordRequest(options), 'GetRecord', function (response) {
            var resObj = new RecordResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.GetRecordExtended = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new RecordRequest(options), 'GetRecordExtended', function (response) {
            var resObj = new RecordExtendedResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.GenerateDocument = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new GenerateDocumentRequest(options), 'GenerateDocument', function (response) {
            var resObj = new GenerateDocumentResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.GetDocumentStubs = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new DocumentStubsRequest(options), 'GetDocumentStubs', function (response) {
            var resObj = new DocumentStubsResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.MergeDocuments = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new MergeDocumentRequest(options), 'MergeDocuments', function (response) {
            var resObj = new GenerateDocumentResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.MergeDocumentsExtended = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new MergeDocumentRequestExtended(options), 'MergeDocumentsExtended', function (response) {
            var resObj = new GenerateDocumentResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.SendMail = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new EmailRequest(options), 'SendMail', function (response) {
            var resObj = new EmailResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.ExportPdf = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new PdfRequest(options), 'ExportPdf', function (response) {
            var resObj = new PdfResponse(response);
            handleResponse(resObj, cb);
        });
    };
    this.ExportPdfByRange = function (options, cb) {
        options = addApplicationData(options);
        GetResponseFromService(new PdfByRangeRequest(options), 'ExportPdfByRange', function (response) {
            var resObj = new PdfResponse(response);
            handleResponse(resObj, cb);
        });
    };

    this.createSingleInput = function(name, value) {
        return new RangeReference({
            'Ref': name,
            'Value': [[new CellValue({ 'Value': value })]]
        });
    };

    this.getOutputValuesByName = function (Outputs, ref) {
        var collection = $.grep(Outputs, function (obj) { return obj.Ref == ref });
        return collection.length > 0 ? collection[0].Value : null;
    };

    this.DownloadFile = function (bPDF, fileName, contentType, sliceSize, fileExtension) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(bPDF);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        var blobUrl = URL.createObjectURL(blob);

        fileName = fileName + '.' + fileExtension;

        if (navigator.appVersion.toString().indexOf('.NET') > 0)
            window.navigator.msSaveBlob(blob, fileName);
        else {
            var link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    this.GetQueryStringValue = function (parameterName) {
        parameterName = parameterName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + parameterName + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
}