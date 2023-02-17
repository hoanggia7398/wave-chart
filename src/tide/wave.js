import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import moment from "moment";

const WaveChart = ({ data }) => {
  const [waveData, setWaveData] = useState();
  const [minPerPixel, setMinPerPixel] = useState();
  const [middleTime, setMiddleTime] = useState();
  const [initialTime, setInitialTime] = useState();
  const spanRef = useRef(null);
  const svgRef = useRef();
  const width = 5000;
  const height = 150;
  const margin = { top: 0, right: 0, bottom: 10, left: -10 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (waveData) {
      generateWave(waveData);
    } else {
      generateWaveData(data);
    }
    if (spanRef.current) {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [waveData, minPerPixel, spanRef]);

  const handleResize = () => {
    const spanRect = spanRef.current.getBoundingClientRect();
    const parentRect = spanRef.current.parentNode.getBoundingClientRect();
    const distanceToParent = spanRect.left - parentRect.left - 6;
    if (minPerPixel) {
      generateMiddleTime(distanceToParent);
    }
  };

  const handleScroll = (e) => {
    const spanRect = spanRef.current.getBoundingClientRect();
    const parentRect = spanRef.current.parentNode.getBoundingClientRect();
    const distanceToParent = spanRect.left - parentRect.left - 6;
    generateMiddleTime(distanceToParent + e.target.scrollLeft);
  };

  const generateMiddleTime = (distanceToBorder) => {
    const timeDistanceMin = distanceToBorder * minPerPixel;
    const timeMiddle = initialTime + timeDistanceMin;
    setMiddleTime(timeMiddle * 60);
  };

  const generateWave = (waveData) => {
    const svg = d3.select(svgRef.current);
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(waveData.tideData, (d) => d.time),
        d3.max(waveData.tideData, (d) => d.time),
      ])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(waveData.tideData, (d) => d.point)])
      .range([chartHeight, 0]);

    // cal pixel on chart
    const x1 = xScale(waveData.tideData[0].time);
    const x2 = xScale(waveData.tideData[1].time);
    const distance = Math.abs(x2 - x1);
    const timestampA = waveData.tideData[0].time;
    const timestampB = waveData.tideData[1].time;
    const timeDifferenceInSeconds = timestampB - timestampA;
    const timeDifferenceInMinutes = timeDifferenceInSeconds / 60;
    const timePerPixel = timeDifferenceInMinutes / distance;
    setMinPerPixel(timePerPixel);
    setInitialTime(waveData.tideData[0].time);
    //wave
    const waveAreaGenerator = d3
      .area()
      .x((d) => xScale(d.time))
      .y0(chartHeight)
      .y1((d) => yScale(d.point / 2))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(waveData.tideData)
      .attr("fill", "steelblue")
      .attr("d", waveAreaGenerator)
      .style("opacity", "0.2");

    // label
    svg
      .selectAll(".label")
      .data(waveData.tideData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.time))
      .attr("y", (d) => yScale(d.point / 2))
      .attr("dx", "1em")
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text((d) => d.amountOfWater);
    // add time
    svg
      .selectAll(".time-label")
      .data(waveData.tideData)
      .enter()
      .append("text")
      .attr("class", "time-label")
      .attr("x", (d) => xScale(d.time))
      .attr("y", (d) => yScale(d.point / 2))
      .attr("dx", "1em")
      .attr("dy", "-1em")
      .style("text-anchor", "middle")
      .text((d) => formatTime(d.time));

    //day night range
    waveData.dayNightData.forEach((data) => {
      svg
        .append("rect")
        .datum(data)
        .attr("x", (d) => xScale(d.startNight))
        .attr("y", 0)
        .attr("width", (d) => xScale(d.endNight) - xScale(d.startNight))
        .attr("height", chartHeight)
        .attr("fill", "gray")
        .style("opacity", "0.3");
    });

    // sun line
    const sunLine = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);
    svg
      .selectAll(".line")
      .data(waveData.sunData)
      .join("path")
      .attr("class", "line")
      .attr("d", (d) => sunLine(d))
      .attr("fill", "none")
      .attr("stroke", "orange");

    const xValue = 1586789113;
    const yValue = yScale.invert(sunLine(xValue));
    const yPixelValue = yScale(79);
    console.log(yPixelValue);
    
  };

  const generateWaveData = (data) => {
    let waveData = {};
    let tideData = [];
    let dayNightData = [];
    let sunData = [];

    data.map((item, index) => {
      //tideData
      item.data.map((i) => tideData.push(i));

      //dayNightData
      if (index === 0) {
        dayNightData.push({
          startNight: item.data[0].time,
          endNight: item.startDay,
        });
      } else {
        dayNightData.push({
          startNight: data[index - 1].startNight,
          endNight: item.startDay,
        });
      }
      if (index === data.length - 1) {
        dayNightData.push({
          startNight: item.startNight,
          endNight: item.data[item.data.length - 1].time,
        });
      }

      //sun data
      sunData.push([
        { x: item.sunrise, y: 0 },
        { x: (item.sunrise + item.sunset) / 2, y: 80 },
        { x: item.sunset, y: 0 },
      ]);
    });

    waveData["tideData"] = tideData;
    waveData["dayNightData"] = dayNightData;
    waveData["sunData"] = sunData;
    setWaveData(waveData);
  };

  const formatTime = (timestamp) => {
    const timeFormated = moment(timestamp * 1000)
      .utc()
      .format("hh:mm a");
    return timeFormated;
  };

  return (
    <ChartContainer>
      <WaveContainer onScroll={handleScroll}>
        <svg width={width} height={height} ref={svgRef}>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
      </WaveContainer>
      {/* <TimeMarkLine></TimeMarkLine> */}
      <TimeMarkText ref={spanRef}>{formatTime(middleTime)}</TimeMarkText>
    </ChartContainer>
  );
};

const WaveContainer = styled.div`
  padding: 20px;
  height: 300px;
  overflow-x: auto;
  display: flex;
  flex-direction: column-reverse;
  position: relative;
`;

const ChartContainer = styled.div`
  margin: auto;
  width: 70vw;
  height: auto;
  position: relative;
  background-color: lightblue;
`;

const TimeMarkLine = styled.div`
  height: 150px;
  width: 10px;
  background-color: gray;
  position: absolute;
  bottom: 13px;
  left: 50%;
`;

const TimeMarkText = styled.span`
  position: absolute;
  bottom: 13px;
  left: 50%;
`;
export default WaveChart;
