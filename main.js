async function createTreeMap() {
  const videoGamesRes = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
  );
  const videoGames = await videoGamesRes.json();

  const width = 960;
  const height = 570;

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const treeMap = d3.treemap().size([width, height]).paddingInner(1);

  const root = d3
    .hierarchy(videoGames)
    .eachBefore((d) => {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum((d) => d.value)
    .sort((a, b) => {
      return b.height - a.height || b.value - a.value;
    });

  treeMap(root);

  let tooltip = d3.select(".visHolder").append("div").attr("id", "tooltip");

  const svgContainer = d3
    .select(".visHolder")
    .append("svg")
    .attr("id", "svgContainer")
    .attr("width", width)
    .attr("height", height);

  const cell = svgContainer
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  const tile = cell
    .append("rect")
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => colorScale(d.data.category))
    .on("mousemove", (d, i) => {
      const { name, category, value } = d.data;
      tooltip
        .transition()
        .style("opacity", 0.9)
        .style("left", d3.event.pageX + 15 + "px")
        .style("top", d3.event.pageY - 30 + "px");

      tooltip
        .html(
          "<p>" +
            name +
            "</p>" +
            "<p>" +
            category +
            "</p>" +
            "<p>" +
            value +
            "</p>"
        )
        .attr("data-value", value);
    })
    .on("mouseout", () => {
      tooltip.transition().style("opacity", 0);
    });

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 13 + i * 10)
    .text((d) => d);

  const categories = root
    .leaves()
    .map((d) => d.data.category)
    .filter((item, index, arr) => arr.indexOf(item) === index);
  console.log(categories);

  let legendWidth = 500;
  let legendRectSize = 15;
  let legendHSpace = 150;
  let legendVSpace = 10;
  let legendElementsPerRow = Math.floor(legendWidth / legendHSpace);

  const legend = d3
    .select(".visHolder")
    .append("svg")
    .attr("id", "legend")
    .attr("width", legendWidth - 100);

  legend
    .selectAll("rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .attr("transform", (d, i) => {
      return (
        "translate(" +
        (i % legendElementsPerRow) * legendHSpace +
        "," +
        (Math.floor(i / legendElementsPerRow) * legendRectSize +
          legendVSpace * Math.floor(i / legendElementsPerRow)) +
        ")"
      );
    })
    .attr("fill", (c) => colorScale(c));

  legend
    .append("g")
    .selectAll("text")
    .data(categories)
    .enter()
    .append("text")
    .attr("transform", (d, i) => {
      return (
        "translate(" +
        ((i % legendElementsPerRow) * legendHSpace + 20) +
        "," +
        (Math.floor(i / legendElementsPerRow) * legendRectSize +
          legendVSpace * Math.floor(i / legendElementsPerRow) +
          13) +
        ")"
      );
    })
    .text((d) => d);
}

createTreeMap();
