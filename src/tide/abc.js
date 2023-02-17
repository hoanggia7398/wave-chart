import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const CurveChart = () => {
  const chartRef = useRef(null);
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const data = [
    { x: 0, y: 0 },
    { x: 5, y: 5 },
    { x: 10, y: 0 },
  ];

  const line = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const getPointsOnCurve = (step) => {
    let points = [];
    for (let t = 0; t <= 1; t += step) {
      const { x, y } = getBezierXY(
        t,
        data[0].x,
        data[0].y,
        data[1].x,
        data[1].y,
        data[2].x,
        data[2].y,
        data[2].x,
        data[2].y
      );
      points.push({ x, y });
    }
    return points;
  };

  const getBezierXY = (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) => {
    return {
      x:
        Math.pow(1 - t, 3) * sx +
        3 * t * Math.pow(1 - t, 2) * cp1x +
        3 * t * t * (1 - t) * cp2x +
        t * t * t * ex,
      y:
        Math.pow(1 - t, 3) * sy +
        3 * t * Math.pow(1 - t, 2) * cp1y +
        3 * t * t * (1 - t) * cp2y +
        t * t * t * ey,
    };
  };

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.x))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.y))
    .range([height, 0]);
  useEffect(() => {
    const svg = d3.select(chartRef.current);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g").call(d3.axisLeft(yScale));
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-3em")
      .attr("text-anchor", "end")
      .text("Y Values");
     svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    const pointsOnCurve = getPointsOnCurve(0.01);

    svg
      .selectAll("circle")
      .data(pointsOnCurve)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 2)
      .attr("fill", "red");
  }, []);

  return (
    <svg
      ref={chartRef}
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    />
  );
};

export default CurveChart;
