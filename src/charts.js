const concentrationChartTemplate = {
    chart: { type: "scatter", height: "200px" },
    title: null,
    yAxis: { title: { text: "DNA concentration (ng/μl)" } },
    xAxis: { categories: ["Sample", "Blank"] },
    plotOptions: {
        scatter: {
        showInLegend: false,
        jitter: {
            x: 0.1,
            y: 0
        },
        marker: {
            radius: 2,
            symbol: "circle",
            fillColor: "#EF6262"
        },
        tooltip: {
            pointFormat: "Concentration (ng/μl): {point.y:.3f}"
        }
        }
    },
    series: []
};

const statusChartTemplate = {
    chart: { type: "bar", height: "200px" },
    xAxis: { labels: { formatter: function() { return "Status" }}, categories: ["registered",  "collected", "extracted", "sequenced"] },
    yAxis: { title: null },
    legend: { reversed: false },
    plotOptions: { series: { stacking: "normal" }},
    colors: [ "#85A389", "#468B97", "#F3AA60", "#EF6262" ],
    title: null,
    series: []
};

export { concentrationChartTemplate, statusChartTemplate };