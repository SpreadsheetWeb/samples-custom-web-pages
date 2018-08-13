function CreateChart(chartData, chartDiv, title) {
  AmCharts.makeChart(chartDiv, {
    type: "serial",
    "theme": "light",
    dataProvider: chartData,
    categoryField: "x",
    startDuration: 1,
    plotAreaBorderColor: "#DADADA",
    plotAreaBorderAlpha: 1,
    plotAreaFillColors: ["#FFFFFF"],
    plotAreaFillAlphas: 1,
    autoMarginOffset: 12, // speacial for EAC left most chart
    categoryAxis: {
      gridPosition: "middle",
      gridAlpha: 0,
      axisAlpha: 1,
      labelsEnabled: true,
      boldLabels: true,
      autoWrap: false,
      labelRotation: 45,
      labelFunction: function(value, valueText, valueAxis) {
        return AmCharts.formatNumber(value,{precision: 0, decimalSeparator: '.', thousandsSeparator: ','},0);;
      }
    },
    valueAxes: [{
      axisAlpha: 1,
      gridAlpha: 1,
      position: "left",
      showFirstLabel: true,
      labelsEnabled: true,
      labelFunction: function(value, valueText, valueAxis) {
        return AmCharts.formatNumber(value,{precision: 0, decimalSeparator: '.', thousandsSeparator: ','},0);;
      }
    }],
    graphs: [{
      type: "column",
      valueField: "y0",
      balloonText: "[[category]]:[[value]]",
      balloonFunction: function(graphDataItem, graph) {
        var val = graphDataItem.values.value;
        var cat = graphDataItem.serialDataItem.category;
        return AmCharts.formatNumber(cat,{precision: 0, decimalSeparator: '.', thousandsSeparator: ','},0); + ": " + AmCharts.formatNumber(val,{precision: 0, decimalSeparator: '.', thousandsSeparator: ','},0);
      },
      lineAlpha: 0.2,
      fillAlphas: 0.8,
      lineColor: "#FFC000",
      labelText: "[[value]]",
      labelPosition: "top",
      labelFunction: function(value, valueText, valueAxis) {
        var val = value.values.value;
        if (val == 0) {
          return;
        } else {
          return val;
        }
      },
    }],
    "titles": [{
      "text": title,
      "size": 15,
      "bold": true
    }],
    "responsive": {
      "enabled": true
    },
    "panEventsEnabled": false
  });
}