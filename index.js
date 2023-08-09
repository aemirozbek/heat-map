import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const w = 1000;
const h = 700;
const marginTop = 160;
const marginBottom = 60;
const marginSides = 60;

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const formatMonth = d3.timeFormat("%B");
    const formatYear = d3.timeFormat("%Y");
    const dataset = data.monthlyVariance
    const years = dataset.map(e => new Date(e.year, 0))
    let months = [];
    for(let i = 0; i < 12; i++){
        months.push(new Date(2000, i))
    }
    console.log(years)

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

    const rects = svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance)
      .attr("x", (d) => xScale(new Date(d.Year + "-1")))
      .attr("y", (d) => yScale(new Date(`January 1, 2000 00:${d.Time}`)))
      .attr("width", w / dataset.length)
      .attr("height", (d) => yScale(0) - yScale(d[1]))
      .attr("fill", (d) => d);

    svg
      .append("g")
      .attr("transform", "translate(0, " + (h - marginBottom) + ")")
      .attr("id", "x-axis")
      .call(d3.axisBottom(xScale).tickFormat(formatYear));

    svg
      .append("g")
      .attr("transform", "translate(" + marginSides + ", 0)")
      .attr("id", "y-axis")
      .call(d3.axisLeft(yScale).tickFormat(formatMonth));

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
      .text(`1753 - 2015: base temperature ${data.baseTemperature}`);

    svg
      .append("text")
      .attr("font-size", "12")
      .attr("x", marginSides)
      .attr("y", marginTop - 10)
      .attr("text-anchor", "middle")
      .text("Months");
  });
