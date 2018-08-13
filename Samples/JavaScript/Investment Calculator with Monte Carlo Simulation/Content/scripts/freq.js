var p = [35,2,65,7,8,9,12,121,33,99];

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function chartData(values) {
  var minimum = values.min();
  var maximum = values.max();
  var range = maximum - minimum;
  var nLevel = 10;
  var stepRatio = 1 / nLevel;
  var levels = [];
  var freqs = [];
  var chartData = [];

  levels.push(minimum);
  for (var i=1; i <= nLevel; i++ ) {
    levels.push(minimum + range * (stepRatio * i));
    freqs.push(0);
  }
  
  for (var i=0; i < values.length; i++) {
    for (var j=0; j < nLevel; j++) {
      if (values[i] >= levels[j] && values[i] < levels[j + 1]) {
        freqs[j]++;
        break;
      } else if (values[i] == maximum) {
        freqs[nLevel-1]++;
        break;
      }
    }
  }
  
  var obj;
  for (var k=0; k < nLevel; k++) {
    var obj = new Object();
    obj.x = levels[k+1];
    obj.y0 = freqs[k];
    chartData.push(obj);
  }
  
  return chartData;
}

//console.log(JSON.stringify(chartData(p)));
