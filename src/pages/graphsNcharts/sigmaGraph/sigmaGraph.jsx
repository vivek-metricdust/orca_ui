import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import Sigma from "sigma";
import React, { useEffect } from "react";

const SigmaGraph = (props) => {
    let container_id = "check" + Math.random();

    useEffect(() => {
        console.log('------',props.message[0])

        if(Object.keys(props.message[0]).length > 0 ){

            let tempNodes = [];
            let tempEdges = [];
    
            let lableFound = false;
            let labelToUse;
    
            let idFound = false;
            let idToUse;
    
    
            Object.keys(props.message[0]).forEach((key) => {
                if (
                    key.toLowerCase().includes("name") &&
                    key.toLowerCase() !== "name"
                ) {
                    lableFound = true;
                    labelToUse = key;
                    return;
                } else if (key.toLowerCase() === "name" && !lableFound) {
                    labelToUse = key;
                    return;
                } else if (
                    key.toLowerCase().includes("id") &&
                    key.toLowerCase() !== "id" &&
                    !lableFound
                ) {
                    labelToUse = key;
                }
            });
    
            Object.keys(props.message[0]).forEach((key) => {
                if (
                    key.toLowerCase().includes("id") &&
                    key.toLowerCase() !== "id"
                ) {
                    idFound = true;
                    idToUse = key;
                    return;
                } else if (key.toLowerCase() === "id" && !idFound) {
                    idToUse = key;
                    return;
                } else if (
                    key.toLowerCase().includes("id") &&
                    key.toLowerCase() !== "id" &&
                    !idFound
                ) {
                    idToUse = key;
                }
            });
    
    
            props.message.forEach((element) => {
    
                tempNodes.push({
                    id: element?.[idToUse].toString(),
                    label: element[labelToUse],
                    color: "Green",
                    size: 10,
                });
    
                tempEdges.push({
                    source: "0",
                    target: element?.[idToUse].toString(),
                    label: "relation",
                    color: "Grey",
                });
            });
    
            tempNodes.push({
                id: "0",
                label: "Device",
                size: 20,
                color: "Blue",
            });
    
    
            const container = document.getElementById(container_id);
    
            const graph = new Graph();
            tempNodes.forEach((node) => {
                graph.addNode(node.id, {
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: node.size,
                    color: node.color,
                    label: node.label,
                });
            });
    
            tempEdges.forEach((edge, index) => {
                graph.addEdge(edge.source, edge.target, {
                    type: "arrow",
                    label: edge.label,
                    size: 2,
                    color: edge.color,
                });
            });
    
            const layout = new ForceSupervisor(graph, {
                isNodeFixed: (_, attr) => attr.highlighted,
            });
            layout.start();
    
            let renderer = new Sigma(graph, container, {
                renderEdgeLabels: true,
                enableEdgeEvents: true,
            });
    
            let draggedNode = null;
            let isDragging = false;
    
            renderer.on("downNode", (e) => {
                isDragging = true;
                draggedNode = e.node;
                graph.setNodeAttribute(draggedNode, "highlighted", true);
            });
    
            renderer.getMouseCaptor().on("mousemovebody", (e) => {
                if (!isDragging || !draggedNode) return;
    
                const pos = renderer.viewportToGraph(e);
    
                graph.setNodeAttribute(draggedNode, "x", pos.x);
                graph.setNodeAttribute(draggedNode, "y", pos.y);
    
                e.preventSigmaDefault();
                e.original.preventDefault();
                e.original.stopPropagation();
            });
    
            renderer.getMouseCaptor().on("mouseup", () => {
                if (draggedNode) {
                    graph.removeNodeAttribute(draggedNode, "highlighted");
                }
    
                isDragging = false;
                draggedNode = null;
            });
    
            renderer.getMouseCaptor().on("mousedown", () => {
                if (!renderer.getCustomBBox())
                    renderer.setCustomBBox(renderer.getBBox());
            });
    
            let hoveredEdge = null;
    
            const nodeEvents = [
                // "enterNode",
                // "leaveNode",
                // "downNode",
                "clickNode",
                "rightClickNode",
                "doubleClickNode",
                // "wheelNode",
            ];
            const edgeEvents = [
                // "downEdge",
                "clickEdge",
                "rightClickEdge",
                "doubleClickEdge",
                // "wheelEdge",
            ];
    
            nodeEvents.forEach((eventType) =>
                renderer.on(eventType, ({ node }) =>
                    console.log(eventType, "node", node)
                )
            );
    
            edgeEvents.forEach((eventType) =>
                renderer.on(eventType, ({ edge }) =>
                    console.log(eventType, "edge", edge)
                )
            );
    
            renderer.on("enterEdge", ({ edge }) => {
                console.log("enterEdge", "edge", edge.split("_")[2]);
                hoveredEdge = edge;
                console.log(graph.getEdgeAttribute(edge, "color"));
    
                graph.setEdgeAttribute(edge, "color", "Black");
                renderer.refresh();
            });
            renderer.on("leaveEdge", ({ edge }) => {
                console.log("leaveEdge", "edge", edge);
                hoveredEdge = null;
                graph.setEdgeAttribute(edge, "color", "Grey");
    
                renderer.refresh();
            });
    
            return () => {
                renderer.kill();
                layout.kill();
            };
        }else{
            console.log('no data')
        }


    }, []);

    return (
        <div
            id={container_id}
            style={{
                width: "-webkit-fill-available",
                height: "100%",
                backgroundColor: "white",
            }}
        ></div>
    );
};

export default SigmaGraph;
