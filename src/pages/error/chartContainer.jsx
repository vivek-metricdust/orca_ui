import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ChartContainer = () => {
    useEffect(() => {
        // Sample data for links and nodes
        const data = {
            nodes: [
                { id: "A", color: "Red", label: "Node A" },
                { id: "B", color: "Green", label: "Node B" },
                { id: "C", color: "Green", label: "Node C" },
                { id: "D", color: "Blue", label: "Node D" },
                { id: "E", color: "Blue", label: "Node E" },
            ],
            links: [
                { source: "A", target: "B", value: 1, name: "Link AB" },
                { source: "B", target: "C", value: 1, name: "Link BC" },
                { source: "C", target: "D", value: 1, name: "Link CD" },
                { source: "D", target: "E", value: 1, name: "Link DE" },
            ],
        };

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // The force simulation mutates links and nodes, so create a copy
        // so that re-evaluating this cell produces the same result.
        const links = data.links.map((d) => ({ ...d }));
        const nodes = data.nodes.map((d) => ({ ...d }));

        // Get dimensions of the container
        const containerWidth =
            document.getElementById("chart-container").clientWidth;
        const containerHeight =
            document.getElementById("chart-container").clientHeight;

        // Create a simulation with several forces.
        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => d.id)
                    .distance(150)
            )
            .force("charge", d3.forceManyBody())
            .force(
                "center",
                d3.forceCenter(containerWidth / 2, containerHeight / 2)
            ) // Center the simulation with container's dimensions
            .on("tick", ticked);

        // Create the SVG container.
        const svg = d3
            .create("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`) // Set viewBox with container's dimensions
            .attr("style", "width: 100%; height: 100%;");

        // Add arrowhead marker definition
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 Z");

        // Add a line for each link, and a circle for each node.
        const link = svg
            .append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2) // Increase stroke width
            .selectAll()
            .data(links)
            .join("line")
            .attr("stroke-width", (d) => Math.sqrt(d.value))
            .attr("marker-end", "url(#arrowhead)"); // Add arrowhead to the end of the line

        const node = svg
            .append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll()
            .data(nodes)
            .join("circle")
            .attr("r", 20)
            // .attr("fill", "steelblue")
            .attr("fill", (d) => d.color)
            .call(
                d3
                    .drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );

        // Set the position attributes of links, nodes, and linkText each time the simulation ticks.
        function ticked() {
            link.attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }

        // Drag functions
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // When this cell is re-run, stop the previous simulation. (This doesn’t
        // really matter since the target alpha is zero and the simulation will
        // stop naturally, but it’s a good practice.)
        simulation.stop();

        // Append SVG to the container
        document.getElementById("chart-container").appendChild(svg.node());

        return () => {
            // Cleanup if necessary
            svg.remove();
        };
    }, []);

    return (
        <div
            id="chart-container"
            style={{ width: "100%", height: "100%" }}
        ></div>
    );
};

export default ChartContainer;
