import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import moment from "moment";

const WaveChart = ({ data }) => {
  const [waveData, setWaveData] = useState();
  const [secondPerPixel, setSecondPerPixel] = useState();
  const [middleTime, setMiddleTime] = useState();
  const [initialTime, setInitialTime] = useState();
  const [showSun, setShowSun] = useState(false);
  const [moveSun, setMoveSun] = useState(false);
  const stateRef = useRef(middleTime);
  const spanRef = useRef(null);
  const svgRef = useRef();
  const pointRef = useRef(null);
  const pointRef1 = useRef(null);
  const pointRef2 = useRef(null);

  const width = 5000;
  const height = 150;
  const margin = { top: 0, right: 0, bottom: 10, left: -10 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const svg = d3.select(svgRef.current);

  useEffect(() => {
    if (waveData) {
      generateWave();
      checkSunShow();
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
  }, [waveData, secondPerPixel, spanRef]);

  const handleResize = () => {
    const spanRect = spanRef.current.getBoundingClientRect();
    const parentRect = spanRef.current.parentNode.getBoundingClientRect();
    const distanceToParent = spanRect.left - parentRect.left - 2;
    generateMiddleTime(distanceToParent);
  };

  const handleScroll = (e, middleTime) => {
    const spanRect = spanRef.current.getBoundingClientRect();
    const parentRect = spanRef.current.parentNode.getBoundingClientRect();
    const distanceToParent = spanRect.left - parentRect.left - 2;
    generateMiddleTime(distanceToParent + e.target.scrollLeft);
    checkSunShow();
    checkSunMove();
    onScrollPoint(middleTime);
  };

  const generateMiddleTime = (distanceToBorder) => {
    const timeDistance = distanceToBorder * secondPerPixel;
    const timeMiddle = initialTime + timeDistance;
    setMiddleTime(() => {
      return timeMiddle;
    });
  };

  const checkSunShow = () => {
    let found = false;
    for (const item of waveData.dayNightData) {
      if (item.startNight <= middleTime && middleTime <= item.endNight) {
        found = true;
        break;
      }
    }
    if (found) {
      setShowSun(false);
    } else {
      setShowSun(true);
    }
  };

  const checkSunMove = () => {
    let found = false;
    for (const item of data) {
      if (item.sunrise <= middleTime && middleTime <= item.sunset) {
        found = true;
        break;
      }
    }
    if (found) {
      setMoveSun(true);
    } else {
      setMoveSun(false);
    }
  };

  const onScrollPoint = (middleTime) => {
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

    const points = getPointsOnCurve(0.0001, waveData.sunData[0]);
    const points1 = getPointsOnCurve(0.0001, waveData.sunData[1]);
    const points2 = getPointsOnCurve(0.0001, waveData.sunData[2]);
    if (moveSun) {
      const closest = binarySearch(points, middleTime);
      const closest1 = binarySearch(points1, middleTime);
      const closest2 = binarySearch(points2, middleTime);

      pointRef.current
        .style("opacity", "1")
        .attr("cx", xScale(closest.x))
        .attr("cy", yScale(closest.y));

      pointRef1.current
        .style("opacity", "1")
        .attr("cx", xScale(closest1.x))
        .attr("cy", yScale(closest1.y));
      pointRef2.current
        .style("opacity", "1")
        .attr("cx", xScale(closest2.x))
        .attr("cy", yScale(closest2.y));
    } else {
      pointRef.current.style("opacity", "0");
      pointRef1.current.style("opacity", "0");
      pointRef2.current.style("opacity", "0");
    }
  };
  function binarySearch(array, x) {
    let left = 0;
    let right = array.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (array[mid].x === x) {
        return array[mid];
      } else if (array[mid].x < x) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    // If x is not found, return the closest object to x
    if (left >= array.length) {
      return array[array.length - 1];
    } else if (right < 0) {
      return array[0];
    } else {
      const diffLeft = x - array[left].x;
      const diffRight = array[right].x - x;
      if (diffLeft < diffRight) {
        return array[left];
      } else {
        return array[right];
      }
    }
  }

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

  const generateWave = () => {
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
    const timePerPixel = timeDifferenceInSeconds / distance;
    setSecondPerPixel(timePerPixel);
    setInitialTime(waveData.tideData[0].time);

    //wave
    drawWave(xScale, yScale);

    // label
    drawLabels(xScale, yScale);

    // add time
    drawTimes(xScale, yScale);

    //day night range
    drawDayNightRanges(xScale);

    // sun line
    const sunLine = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);
    svg
      .selectAll(".line1")
      .data(waveData.sunData.map((item) => getPointsOnCurve(0.003, item)))
      .join("path")
      .attr("class", "line1")
      .attr("d", (d) => sunLine(d))
      .attr("fill", "none")
      .attr("stroke", "#f88a02");

    const point = svg
      .append("circle")
      .attr("cx", (d) => xScale(waveData.sunData[0][0].x))
      .attr("cy", (d) => yScale(0))
      .attr("r", 10)
      .attr("fill", "#f88a02")
      .style("opacity", "0");

    const point1 = svg
      .append("circle")
      .attr("cx", (d) => xScale(waveData.sunData[1][0].x))
      .attr("cy", (d) => yScale(0))
      .attr("r", 10)
      .attr("fill", "#f88a02")
      .style("opacity", "0");

    const point2 = svg
      .append("circle")
      .attr("cx", (d) => xScale(waveData.sunData[2][0].x))
      .attr("cy", (d) => yScale(0))
      .attr("r", 10)
      .attr("fill", "#f88a02")
      .style("opacity", "0");

    pointRef.current = point;
    pointRef1.current = point1;
    pointRef2.current = point2;
  };

  const drawDayNightRanges = (xScale) => {
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
  };

  const drawTimes = (xScale, yScale) => {
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
      .style("fill", "#237bcf")
      .style("background-color", "red")
      .text((d) => formatTime(d.time));
  };

  const drawLabels = (xScale, yScale) => {
    svg
      .selectAll(".label")
      .data(waveData.tideData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.time))
      .attr("y", (d) => yScale(d.point / 2))
      .attr("dx", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#237bcf")
      .text((d) => d.amountOfWater);
  };

  const drawWave = (xScale, yScale) => {
    const waveAreaGenerator = d3
      .area()
      .x((d) => xScale(d.time))
      .y0(chartHeight)
      .y1((d) => yScale(d.point / 2))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(waveData.tideData)
      .attr("fill", "#80dcff")
      .attr("d", waveAreaGenerator)
      .style("opacity", "0.4");
  };

  const formatTime = (timestamp) => {
    const timeFormatted = moment(timestamp * 1000)
      .utc()
      .format("hh:mm a");
    return timeFormatted;
  };

  const formatDate = (timestamp) => {
    const timeFormatted = moment(timestamp * 1000)
      .utc()
      .format("Do MMMM");
    return timeFormatted;
  };

  const getPointsOnCurve = (step, data) => {
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
        (Math.pow(1 - t, 3) * sy +
          3 * t * Math.pow(1 - t, 2) * cp1y +
          3 * t * t * (1 - t) * cp2y +
          t * t * t * ey) *
        2,
    };
  };

  return (
    <ChartContainer>
      <WaveContainer
        className="wave-container"
        onScroll={(e) => handleScroll(e, middleTime)}
      >
        <svg width={width} height={height} ref={svgRef}>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
      </WaveContainer>
      {!showSun && <MoonWrapper></MoonWrapper>}
      <TimeMarkLine></TimeMarkLine>
      <DayMarkText>{formatDate(middleTime)}</DayMarkText>
      <TimeLine></TimeLine>
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
  z-index: 1;
`;

const ChartContainer = styled.div`
  margin: auto;
  height: auto;
  position: relative;
  background-color: white;
  width: 900px;
`;

const TimeMarkLine = styled.div`
  width: 2px;
  background-image: linear-gradient(#fff, #bbbfc3);
  position: absolute;
  height: 200px;
  bottom: 40px;
  left: calc(50% - 12px);
  z-index: 2;
`;

const MoonWrapper = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background-color: yellow;
  position: absolute;
  bottom: 130px;
  left: calc(50% - 21px);
  z-index: 2;
`;

const TimeMarkText = styled.span`
  position: absolute;
  bottom: 18px;
  left: 47%;
  color: #5f5f5f;
`;

const DayMarkText = styled.span`
  position: absolute;
  bottom: 200px;
  left: 47%;
  font-size: 25px;
  z-index: 2;
`;
const TimeLine = styled.div`
  width: 100%;
  height: 32px;
  background-color: #d4d4d4;
  position: absolute;
  bottom: 13px;
`;
export default WaveChart;
