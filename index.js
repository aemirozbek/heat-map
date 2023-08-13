import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const w = 1500;
const h = 700;
const marginTop = 160;
const marginBottom = 60;
const marginSides = 60;
const legendWidth = 400;

const heatmapColors = {
    0: '#0000FF',  // Blue
    1: '#1E46A0',
    2: '#3C7E7F',
    3: '#5ABD5B',
    4: '#79FC38',
    5: '#9BF91A',  // Yellow
    6: '#B8D300',
    7: '#D59B00',
    8: '#F27400',
    9: '#FF4200',
    10: '#FF0000'  // Red
  };

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const formatMonth = d3.timeFormat("%B");
    const formatYear = d3.timeFormat("%Y");
    const dataset = data.monthlyVariance
    const baseTemp = data.baseTemperature
    const variance = dataset.map(e => e.variance)
    const years = dataset.map(e => new Date(e.year, 0))
    const yearsAmount = yearsAmountFinder(years)
    let months = [];
    for(let i = 0; i < 12; i++){
        months.push(i)
    }

    function yearsAmountFinder(input) {
      let arr = input.map(e => e.getFullYear())
      arr = new Set(arr)
      return arr.size
    }

    const xScale = d3
      .scaleUtc()
      .domain([d3.min(years), d3.max(years)])
      .range([marginSides, w - marginSides]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.max(months), d3.min(months)])
      .range([h - marginBottom, marginTop]);

    const svg = d3
      .select("#container")
      .append("svg")
      .attr("width", w)
      .attr("height", h + 50);

    const tooltip = d3
      .select("#container")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none");

    const rects = svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => (d.month - 1))
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => (d.variance + data.baseTemperature))
      .attr("x", (d) => xScale(new Date(d.year + "-1")))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", (w - (2*marginSides)) / yearsAmount)
      .attr("height", (h - marginTop - marginBottom) / months.length)
      .attr("fill", "red");

    svg
      .append("g")
      .attr("transform", "translate(0, " + (h - marginBottom) + ")")
      .attr("id", "x-axis")
      .call(d3.axisBottom(xScale).tickFormat(formatYear));

    svg
      .append("g")
      .attr("transform", "translate(" + marginSides + ", 0)")
      .attr("id", "y-axis")
      .call(d3.axisLeft(yScale).tickFormat(d => formatMonth(new Date(2000, d))))

    svg
      .append("text")
      .attr("id", "title")
      .style("font-size", "35px")
      .attr("x", w / 2)
      .attr("y", marginTop / 4)
      .attr("text-anchor", "middle")
      .text("Monthly Global Land-Surface Temperature");

    svg
      .append("text")
      .attr("id", "description")
      .style("font-size", "25px")
      .attr("x", w / 2)
      .attr("y", marginTop / 2)
      .attr("text-anchor", "middle")
      .text(`1753 - 2015: base temperature ${baseTemp}`);

    svg
      .append("text")
      .attr("font-size", "12")
      .attr("x", marginSides)
      .attr("y", marginTop - 10)
      .attr("text-anchor", "middle")
      .text("Months");

    const legendBox = svg
      .append("g")
      .attr("id", "legend")

    const legendX = d3
      .scaleLinear()
      .domain([d3.min(variance) + baseTemp, d3.max(variance) + baseTemp])
      .range([marginSides, legendWidth]);

    legendBox
      .append("g")
      .attr("transform", "translate(0, " + (h+30) + ")")
      .attr("id", "legend-x")
      .call(d3.axisBottom(legendX));

    rects.on("mouseover", (event, d) => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const f = d3.format(".1f");
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `${d.year} - ${monthNames[d.month-1]}<br/>${f(d.variance + baseTemp)}&deg;C<br/>${f(d.variance)}&deg;C`
        )
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY + "px")
        .attr("data-year", d.Year);
    });

    rects.on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
  });
