const countryIdMap = {
  "Afghanistan": 4,
  "Albania": 8,
  "Algeria": 12,
  "Angola": 24,
  "Argentina": 32,
  "Australia": 36,
  "Austria": 40,
  "Bahamas": 44,
  "Bahrain": 48,
  "Bangladesh": 50,
  "Barbados": 52,
  "Belarus": 112,
  "Belgium": 56,
  "Benin": 204,
  "Bhutan": 64,
  "Bolivia": 68,
  "Bosnia and Herzegovina": 70,
  "Botswana": 72,
  "Brazil": 76,
  "Brunei": 96,
  "Bulgaria": 100,
  "Burkina Faso": 854,
  "Burundi": 108,
  "Cambodia": 116,
  "Cameroon": 120,
  "Canada": 124,
  "Chad": 148,
  "Chile": 152,
  "China": 156,
  "Colombia": 170,
  "Costa Rica": 188,
  "Croatia": 191,
  "Cuba": 192,
  "Cyprus": 196,
  "Czech Republic": 203,
  "Denmark": 208,
  "Dominican Republic": 214,
  "Ecuador": 218,
  "Egypt": 818,
  "El Salvador": 222,
  "Estonia": 233,
  "Ethiopia": 231,
  "Fiji": 242,
  "Finland": 246,
  "France": 250,
  "Gabon": 266,
  "Gambia": 270,
  "Georgia": 268,
  "Germany": 276,
  "Ghana": 288,
  "Greece": 300,
  "Guatemala": 320,
  "Guinea": 324,
  "Honduras": 340,
  "Hungary": 348,
  "Iceland": 352,
  "India": 356,
  "Indonesia": 360,
  "Iran": 364,
  "Iraq": 368,
  "Ireland": 372,
  "Israel": 376,
  "Italy": 380,
  "Jamaica": 388,
  "Japan": 392,
  "Jordan": 400,
  "Kenya": 404,
  "Kuwait": 414,
  "Laos": 418,
  "Latvia": 428,
  "Lebanon": 422,
  "Lesotho": 426,
  "Liberia": 430,
  "Libya": 434,
  "Lithuania": 440,
  "Luxembourg": 442,
  "Madagascar": 450,
  "Malawi": 454,
  "Malaysia": 458,
  "Mali": 466,
  "Mauritania": 478,
  "Mexico": 484,
  "Moldova": 498,
  "Mongolia": 496,
  "Montenegro": 499,
  "Morocco": 504,
  "Mozambique": 508,
  "Myanmar": 104,
  "Namibia": 516,
  "Nepal": 524,
  "Netherlands": 528,
  "New Zealand": 554,
  "Nicaragua": 558,
  "Niger": 562,
  "Nigeria": 566,
  "Norway": 578,
  "Oman": 512,
  "Pakistan": 586,
  "Panama": 591,
  "Paraguay": 600,
  "Peru": 604,
  "Philippines": 608,
  "Poland": 616,
  "Portugal": 620,
  "Qatar": 634,
  "Romania": 642,
  "Russia": 643,
  "Rwanda": 646,
  "Saudi Arabia": 682,
  "Senegal": 686,
  "Serbia": 688,
  "Sierra Leone": 694,
  "Singapore": 702,
  "Slovakia": 703,
  "Slovenia": 705,
  "Somalia": 706,
  "South Africa": 710,
  "South Korea": 410,
  "Spain": 724,
  "Sri Lanka": 144,
  "Sudan": 729,
  "Suriname": 740,
  "Sweden": 752,
  "Switzerland": 756,
  "Syria": 760,
  "Taiwan": 158,
  "Tanzania": 834,
  "Thailand": 764,
  "Togo": 768,
  "Tunisia": 788,
  "Turkey": 792,
  "Uganda": 800,
  "Ukraine": 804,
  "United Arab Emirates": 784,
  "United Kingdom": 826,
  "United States": 840,
  "Uruguay": 858,
  "Venezuela": 862,
  "Vietnam": 704,
  "Yemen": 887,
  "Zambia": 894,
  "Zimbabwe": 716
};

const csvUrl = "https://raw.githubusercontent.com/Reqply/coffee-dashboard/main/psd_coffee.csv";

let allData = [];
let currentYear = null;
let currentBeanFilter = "all";

function addCountryId(data) {
  return data.map(d => {
    const countryTrimmed = d.Country.trim();
    return {
      ...d,
      numeric_id: countryIdMap[countryTrimmed] || null,
      Production: +d.Production,
      Arabica: +d["Arabica Production"],
      Robusta: +d["Robusta Production"],
      Year: +d.Year
    };
  });
}

function getUniqueYears(data) {
  const ys = Array.from(new Set(data.map(d => d.Year))).sort((a,b) => a-b);
  return ys;
}

function filterByYearAndBean(data, year, bean) {
  let filtered = data.filter(d => d.Year === year && d.numeric_id !== null);

  if (bean === "arabica") {
    // Use Arabica production only, filter out zero production countries
    filtered = filtered.filter(d => d.Arabica > 0).map(d => ({
      ...d,
      Production: d.Arabica
    }));
  } else if (bean === "robusta") {
    // Use Robusta production only, filter out zero production countries
    filtered = filtered.filter(d => d.Robusta > 0).map(d => ({
      ...d,
      Production: d.Robusta
    }));
  } else {
    // 'all' - use total Production
    filtered = filtered.filter(d => !isNaN(d.Production));
  }

  return filtered;
}

function renderMap(data, year) {
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 700,
    height: 400,
    title: {
    text: "Coffee Production Over World",
    fontSize: 20,
    font: "Arial",
    anchor: "middle",
    color: "#4b3832",
    dy: -10},
    data: {
      url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
      format: {
        type: "topojson",
        feature: "countries"
      }
    },
    transform: [
      {
        lookup: "id",
        from: {
          data: { values: data },
          key: "numeric_id",
          fields: ["Production", "Country"]
        }
      }
    ],
    projection: {type: "mercator"},
    mark: {type: "geoshape", stroke: "#8b4513", strokeWidth: 0.7},
    encoding: {
      color: {
        field: "Production",
        type: "quantitative",
        scale: {scheme: "reds"},
        legend: {
          title: `Production (metric tons) in ${year}`,
          labelFontSize: 13,
          titleFontSize: 15
        }
      },
      tooltip: [
        {field: "Country", type: "nominal", title: "Country"},
        {field: "Production", type: "quantitative", title: "Production (tons)", format: ",.0f"}
      ]
    }
  };
  vegaEmbed("#map", spec, {actions: false}).catch(console.error);
}

function renderLineChart(data) {
  // For line chart, show total production over years based on bean filter
  // Aggregate based on currentBeanFilter:
  let productionByYear;

  if (currentBeanFilter === "arabica") {
    productionByYear = d3.rollups(
      data,
      v => d3.sum(v, d => d.Arabica),
      d => d.Year
    ).map(([Year, TotalProduction]) => ({Year, TotalProduction}));
  } else if (currentBeanFilter === "robusta") {
    productionByYear = d3.rollups(
      data,
      v => d3.sum(v, d => d.Robusta),
      d => d.Year
    ).map(([Year, TotalProduction]) => ({Year, TotalProduction}));
  } else {
    productionByYear = d3.rollups(
      data,
      v => d3.sum(v, d => d.Production),
      d => d.Year
    ).map(([Year, TotalProduction]) => ({Year, TotalProduction}));
  }

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 400,
    height: 250,
    data: { values: productionByYear },
    mark: { type: "line", point: true, tooltip: true, color: "#a0522d" },
    encoding: {
      x: { field: "Year", type: "quantitative", axis: {title: "Year", labelFontSize: 13, titleFontSize: 15, format: "d"} },
      y: { field: "TotalProduction", type: "quantitative", axis: {title: "Total Production (tons)", labelFontSize: 13, titleFontSize: 15} },
      tooltip: [
        {field: "Year", type: "temporal", title: "Year"},
        {field: "TotalProduction", type: "quantitative", title: "Total Production", format: ",.0f"}
      ]
    }
  };
  vegaEmbed("#lineChart", spec, {actions: false}).catch(console.error);
}

function renderBarChart(data, year) {
  // Show production by coffee type filtered by bean select:
  // If "all", show both bars for Arabica and Robusta.
  // If "arabica", show only Arabica bar.
  // If "robusta", show only Robusta bar.

  let chartData = [];

  if (currentBeanFilter === "arabica") {
    const totalArabica = d3.sum(data, d => d.Arabica);
    chartData = [{ type: "Arabica", production: totalArabica }];
  } else if (currentBeanFilter === "robusta") {
    const totalRobusta = d3.sum(data, d => d.Robusta);
    chartData = [{ type: "Robusta", production: totalRobusta }];
  } else {
    const totalArabica = d3.sum(data, d => d.Arabica);
    const totalRobusta = d3.sum(data, d => d.Robusta);
    chartData = [
      { type: "Arabica", production: totalArabica },
      { type: "Robusta", production: totalRobusta }
    ];
  }

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 700,
    height: 250,
    data: { values: chartData },
    mark: { type: "bar", tooltip: true },
    encoding: {
      x: { field: "type", type: "nominal", axis: { title: "Coffee Type", labelFontSize: 13, titleFontSize: 15 } },
      y: { field: "production", type: "quantitative", axis: { title: "Production (tons)", labelFontSize: 13, titleFontSize: 15 } },
      color: {
        field: "type",
        type: "nominal",
        scale: { domain: ["Arabica", "Robusta"], range: ["#d2691e", "#8b4513"] },
        legend: null
      }
    }
  };
  vegaEmbed("#barChart", spec, {actions: false}).catch(console.error);
}

function renderTopCountriesChart(data, year) {
  // Show top 10 producing countries for the selected year and bean filter
  let filtered = filterByYearAndBean(data, year, currentBeanFilter);

  // Sort descending production and take top 10
  let topCountries = filtered
    .sort((a,b) => b.Production - a.Production)
    .slice(0,10);

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 400,
    height: 350,
    data: { values: topCountries },
    mark: "bar",
    encoding: {
      y: {
        field: "Country",
        type: "nominal",
        sort: "-x",
        axis: {title: "Country", labelFontSize: 13, titleFontSize: 15}
      },
      x: {
        field: "Production",
        type: "quantitative",
        axis: {title: "Production (tons)", labelFontSize: 13, titleFontSize: 15}
      },
      color: {
        field: "Production",
        type: "quantitative",
        scale: { scheme: "reds" },
        legend: null
      },
      tooltip: [
        {field: "Country", type: "nominal"},
        {field: "Production", type: "quantitative", format: ",.0f"}
      ]
    }
  };

  vegaEmbed("#topCountriesChart", spec, {actions: false}).catch(console.error);
}

function renderTopConsumptionChart(data, year) {
  // Consumption data is separate, but you did not provide it.
  // For now, simulate consumption by summing production * 0.6 (just for demonstration)
  // In a real case, you'd want actual consumption data.
  // Also, filtering by bean is less relevant here, so use total production as proxy.

  let filtered = data.filter(d => d.Year === year && d.numeric_id !== null);

  // Simulated consumption
  let consumptionData = filtered.map(d => ({
    Country: d.Country,
    Consumption: d.Production * 0.6 // mock consumption
  }));

  // Sort descending and top 10
  consumptionData.sort((a,b) => b.Consumption - a.Consumption);
  let topConsumption = consumptionData.slice(0,10);

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: 400,
    height: 350,
    data: { values: topConsumption },
    mark: "bar",
    encoding: {
      y: {
        field: "Country",
        type: "nominal",
        sort: "-x",
        axis: {title: "Country", labelFontSize: 13, titleFontSize: 15}
      },
      x: {
        field: "Consumption",
        type: "quantitative",
        axis: {title: "Coffee Consumption", labelFontSize: 13, titleFontSize: 15}
      },
      color: {
        field: "Consumption",
        type: "quantitative",
        scale: { scheme: "greens" },
        legend: null
      },
      tooltip: [
        {field: "Country", type: "nominal"},
        {field: "Consumption", type: "quantitative", format: ",.0f"}
      ]
    }
  };
  vegaEmbed("#topConsumptionChart", spec, {actions: false}).catch(console.error);
}

function updateDashboard() {
  if (!currentYear) return;

  // Filter data by year and bean filter for the charts that need it
  const filteredData = filterByYearAndBean(allData, currentYear, currentBeanFilter);

  renderMap(filteredData, currentYear);
  renderLineChart(allData);
  renderBarChart(filteredData, currentYear);
  renderTopCountriesChart(allData, currentYear);
  renderTopConsumptionChart(allData, currentYear);
}

function setupYearSelector(years) {
  const select = d3.select("#yearSelect");
  select.selectAll("option").remove();

  select.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  currentYear = years[0];
  select.property("value", currentYear);

  select.on("change", function() {
    currentYear = +this.value;
    updateDashboard();
  });
}

function setupBeanSelector() {
  const select = d3.select("#beanSelect");

  select.on("change", function() {
    currentBeanFilter = this.value;
    updateDashboard();
  });
}

// Load and initialize
d3.csv(csvUrl).then(data => {
  allData = addCountryId(data);

  const years = getUniqueYears(allData);
  setupYearSelector(years);
  setupBeanSelector();

  updateDashboard();
}).catch(console.error);




