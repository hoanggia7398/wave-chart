import React from "react";
import styled from "styled-components";

const Header = () => {
  return (
    <Container>
      <TitleWrapper>
        <img
          alt=""
          src="https://sp-weather.vercel.app/static/media/open-menu.2e49c6b0.svg"
        />
        <Location>
          <span>MyENV</span>
          <LocationWrapper>
            <span>Current Location</span>{" "}
            <img
              alt=""
              src="https://sp-weather.vercel.app/static/media/dropDownsvg.e2327a17.svg"
            />
          </LocationWrapper>
        </Location>
        <img
          alt=""
          src="https://sp-weather.vercel.app/static/media/bell.d9a36397.svg"
        ></img>
      </TitleWrapper>
      <DetailWrapper>
        <img
          alt=""
          src="https://sp-weather.vercel.app/static/media/cloud.3a014f87.svg"
        />
        <WeatherContainer>
          <span>Cloudy</span>
          <WeatherDetail>
            <div>
              <img
                alt=""
                src="https://sp-weather.vercel.app/static/media/thermometer.132f6172.svg"
              />
              <span>29°C</span>
            </div>
            <div>
              <img
                alt=""
                src="https://sp-weather.vercel.app/static/media/humidity.46966f48.svg"
              />
              <span>27%</span>
            </div>
          </WeatherDetail>
        </WeatherContainer>
      </DetailWrapper>
      <AddWrapper>
        <AddDetail>
          <span className="title">PSI</span>
          <span className="psi-content">23</span>
          <span className="detail">Good</span>
        </AddDetail>
        <AddDetail>
          <span className="title">RAIN</span>
          <span className="rain-content">0</span>
          <span className="detail">mm</span>
        </AddDetail>
        <AddDetail>
          <span className="title">DENGUE</span>
          <span className="dengue"></span>
        </AddDetail>
        <AddDetail>
          <img
            className="image"
            alt=""
            src="https://sp-weather.vercel.app/static/media/add.b2fe778f.svg"
          />
          <span className="title" style={{ color: "black" }}>
            Add
          </span>
        </AddDetail>
      </AddWrapper>
    </Container>
  );
};
const Container = styled.div`
  height: 431px;
  width: 100vw;
  background-image: linear-gradient(#0068cc, #70b9ff);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 30px;
  img {
    width: 30px;
    height: 42px;
    cursor: pointer;
  }
`;

const LocationWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 1em;
  img {
    width: 12px;
    margin-left: 5px;
    margin-bottom: -2px;
    cursor: pointer;
  }
`;

const WeatherContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: start;
  gap: 5px;
  span {
    font-size: 40px;
    color: white;
  }
`;
const WeatherDetail = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  div {
    display: flex;
    align-items: center;
    height: 1em;
  }
  span {
    font-size: 24px;
  }
  div > img {
    width: 24px;
  }
`;
const Location = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
`;
const DetailWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;

  img {
    width: 70px;
    height: 85px;
  }
`;
const AddWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  div:last-child {
    background-image: unset;
  }
`;

const AddDetail = styled.div`
  width: 25%;
  max-width: 100px;
  background-image: linear-gradient(#70b9ff, #fff);
  background-repeat: no-repeat;
  background-size: 1px 100%;
  background-position-x: right;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: white;
  height: 85px;
  .title {
    font-size: 20px;
  }
  .detail {
    font-size: 12px;
  }
  .psi-content {
    background: #1ae863;
    width: 40px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 7px auto;
    font-size: 30px;
    border-radius: 4px;
  }
  .dengue {
    background: #82b6f7;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: 8px auto auto;
    border: 2px solid;
  }
  .image {
    width: 35px;
    margin-top: 10px;
  }
`;

export default Header;
