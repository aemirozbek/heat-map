import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const w = 1500;
const h = 700;
const marginTop = 160;
const marginBottom = 60;
const marginSides = 60;
const legendWidth = 400;

const heatmapColors = [
  "#000000",
  "#230055",
  "#460099",
  "#6A00BB",
  "#9B4CBB",
  "#B05AB5",
  "#C96BA6",
  "#ED7F90",
  "#FF9977",
  "#FFB055",
  "#FFD033",
  "#FFEA11",
  "#FFFEE8",
];

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const formatMonth = d3.timeFormat("%B");
    const formatYear = d3.timeFormat("%Y");
    const dataset = data.monthlyVariance;
    const baseTemp = data.baseTemperature;
    const variance = dataset.map((e) => e.variance);
    const years = dataset.map((e) => new Date(e.year, 0));

    const yearsAmount = (function yearsAmountFinder(input) {
      let arr = input.map((e) => e.getFullYear());
      arr = new Set(arr);
      return arr.size;
    })(years);

    const tempRange = (function tempRangeFinder(input) {
      input.sort((a, b) => a - b);
      return {
        min: input[0] + baseTemp,
        max: input[input.length - 1] + baseTemp,
        range: input[input.length - 1] - input[0],
      };
    })(variance);

    let months = [];
    for (let i = 0; i < 12; i++) {
      months.push(i);
    }

    const xScale = d3
      .scaleUtc()
      .domain([d3.min(years), d3.max(years)])
      .range([marginSides, w - marginSides]);

    const yScale = d3
      .scaleBand()
      .domain([11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
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
      .style("pointer-events", "none")
      .style("text-align", "center");

    const colorScale = d3
      .scaleLinear()
      .domain([tempRange.min, tempRange.max])
      .range([0, heatmapColors.length - 1]);

    const rects = svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance + data.baseTemperature)
      .attr("x", (d) => xScale(new Date(d.year + "-1")))
      .attr("y", (d) => yScale(d.month - 1))
      .attr("width", w / yearsAmount)
      .attr("height", (h - marginTop - marginBottom) / months.length)
      .attr(
        "fill",
        (d) => heatmapColors[Math.round(colorScale(d.variance + baseTemp))]
      );

    svg
      .append("g")
      .attr("transform", "translate(0, " + (h - marginBottom) + ")")
      .attr("id", "x-axis")
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat(formatYear)
          .ticks(d3.timeYear.every(10))
      );

    svg
      .append("g")
      .attr("transform", "translate(" + marginSides + ", 0)")
      .attr("id", "y-axis")
      .call(
        d3.axisLeft(yScale).tickFormat((d) => formatMonth(new Date(2000, d)))
      );

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

    const legendXScale = d3
      .scaleLinear()
      .domain([tempRange.min - 1, tempRange.max + 1])
      .range([0, legendWidth]);

    const legendRectScale = d3
      .scaleLinear()
      .domain([0, heatmapColors.length - 1])
      .range([28, legendWidth - 28]);

    const legendBox = svg.append("g").attr("id", "legend");

    const barSize = (legendWidth - 56) / heatmapColors.length;

    legendBox
      .append("g")
      .attr("transform", "translate(100, " + (h + barSize) + ")")
      .call(d3.axisBottom(legendXScale).tickArguments([12]));

    legendBox
      .selectAll("rect")
      .data(heatmapColors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => legendRectScale(i) - barSize / 2 + 100) // The 100 is for the x axis transform match
      .attr("y", h)
      .attr("width", barSize)
      .attr("height", barSize)
      .attr("fill", (d, i) => heatmapColors[i])
      .style("outline", "solid black 1px")
      .append("title")
      .text((d, i) => legendRectScale(i));

    rects.on("mouseover", (event, d) => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const f = d3.format(".1f");
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          `${d.year} - ${monthNames[d.month - 1]}<br/>${f(
            d.variance + baseTemp
          )}&deg;C<br/>${f(d.variance)}&deg;C`
        )
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY + "px")
        .attr("data-year", d.year);
    });

    rects.on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
  });
