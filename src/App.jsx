import React, { useState, useRef, useEffect } from "react";
import Geocoding from "./Geocoding.jsx";
import FetchWeather from "./FetchWeather.jsx";
import MapContent from "./Map.jsx";
import "./App.css";
import "leaflet/dist/leaflet.css";

const Weather = () => {
const [currentLocation, setCurrentLocation] = useState("");
const [position, setPosition] = useState(null);
const [pageLoading, setPageLoading] = useState(true);
const [weather, setWeather] = useState(null);
const [loading, setLoading] = useState(false);
const [place, setPlace] = useState("");
const [mapPlace, setMapPlace] = useState("");
const [notFound, setNotFound] = useState(false);
const [LOCATION, setLOCATION] = useState("");

const [showSearch, setShowSearch] = useState(false);
const inputRef = useRef(null);
const [details, setDetails] = useState(false);
const detailsRef = useRef([]);
const backRef = useRef([]);

const [forecast, setForecast] = useState([]);
const [selectedDate, setSelectedDate] = useState(null);
const [detailsShown, setDetailsShown] = useState(false);

// 🟢 Map raw codes → readable names with emoji
const conditionMap = {
clearsky_day: "☀️ Clear",
clearsky_night: "🌙 Clear Night",
fair_day: "🌤️ Fair",
fair_night: "🌤️ Fair Night",
partlycloudy_day: "⛅ Partly Cloudy",
partlycloudy_night: "⛅ Partly Cloudy Night",
cloudy: "☁️ Overcast",
lightrain: "🌦️ Light Rain",
rain: "🌧️ Rain",
heavyrain: "⛈️ Heavy Rain",
snow: "❄️ Snow",
lightsnow: "🌨️ Light Snow",
fog: "🌫️ Fog",
unknown: "❔ Unknown",
clear: "☀️ Clear"
};

const Back = () => {  
      detailsRef.current[0].style.display = "block";
      backRef.current[1].style.display = "none";
      detailsRef.current[1].style.visibility = "visible";        detailsRef.current[2].style.visibility = "visible";        detailsRef.current[3].style.display = "none";
}


const Details = () => {
if (detailsRef.current[0] && detailsRef.current[1]) {
	if(detailsShown){
		backRef.current[1].style.display = "block";
	}
	detailsRef.current[0].style.display = "none";
	detailsRef.current[1].style.visibility = "hidden";
	detailsRef.current[2].style.visibility = "hidden";
	detailsRef.current[3].style.display = "block";
}

fetch(  
  `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${position[0]}&lon=${position[1]}`  
)  
  .then((res) => res.json())  
  .then((data) => {  
    const timeseries = data.properties.timeseries;  
    const now = new Date();  
    const nextHourIndex = timeseries.findIndex(  
      (item) => new Date(item.time) < now  
    );  

    if (nextHourIndex === -1) {  
      console.error("No upcoming data found.");  
      return;  
    }  

    const result = [];  
    for (let i = nextHourIndex; i < timeseries.length; i++) {  
      const entry = timeseries[i];  
      let time = new Date(entry.time);  
      const temp = entry.data.instant.details.air_temperature;  

      const condition =  
        entry.data.next_1_hours?.summary?.symbol_code ||  
        entry.data.next_6_hours?.summary?.symbol_code ||  
        entry.data.next_12_hours?.summary?.symbol_code ||  
        "clear";  

      result.push({  
        date: time.toLocaleDateString(),  
        time: time.toLocaleTimeString([], {  
          hour: "2-digit",  
          minute: "2-digit"  
        }),  
        temperature: temp,  
        condition: conditionMap[condition] || condition  
      });  
    }  
    setDetailsShown(true)
    setForecast(result); 
    if (result.length > 0) setSelectedDate(result[0].date);  
  })  
  .catch((err) => {  
    console.error("Failed to fetch data from Met.no", err);  
  });

};

useEffect(() => {
if (showSearch && inputRef.current) {
inputRef.current.focus();
}
}, [showSearch]);

// 🟢 Helper: Get average temp & most frequent condition per day
const getDaySummary = (items) => {
if (!items || items.length === 0) return { avgTemp: 0, condition: "☀️ Clear" };

const avgTemp =  
  items.reduce((sum, it) => sum + it.temperature, 0) / items.length;  

const conditionCounts = {};  
items.forEach((it) => {  
  conditionCounts[it.condition] = (conditionCounts[it.condition] || 0) + 1;  
});  

const condition = Object.entries(conditionCounts).sort(  
  (a, b) => b[1] - a[1]  
)[0][0];  

return { avgTemp: avgTemp.toFixed(1), condition };

};

return (
<div className="weather">
{/* First load the location */}
<Geocoding  
setPageLoading={setPageLoading}  
setCurrentLocation={setCurrentLocation}  
setPosition={setPosition}  
/>

{/* Show loading spinner until page is ready */}  
  {pageLoading ? (  
    <p className="loadingPage">  
      <span className="material-symbols-outlined">progress_activity</span>  
    </p>  
  ) : (  
    <>  
          <p className="material-symbols-outlined" style={{ display: "none" }} ref= {el => detailsRef.current[3] = el}
	  onClick = {Back}
	  >  
          arrow_back  
          </p>  
      {/* HEADER */}  
      <div className="header" ref={el => detailsRef.current[2] = el}>  
        {!showSearch && (  
          <div className="locations">  
            {currentLocation || place || mapPlace ? (  
              <h2>{currentLocation || place || mapPlace}</h2>  
            ) : <h2>PMO</h2>}  
          </div>  
        )}  
        <p onClick={() => setShowSearch(!showSearch)}>  
          {showSearch ? (  
            <span  
              className="material-symbols-outlined"  
              id="closeIcon"  
            >  
              close  
            </span>  
          ) : (  
            <span  
              className="material-symbols-outlined"  
              onClick={() => inputRef.current.focus()}  
            >  
              search  
            </span>  
          )}  
        </p>  
      </div>  

      {/* WEATHER FETCHING */}  
      <FetchWeather  
        setWeather={setWeather}  
        setLoading={setLoading}  
        LOCATION={LOCATION}  
        setLOCATION={setLOCATION}  
        setPosition={setPosition}  
        position={position}  
        place={place}  
        setPlace={setPlace}  
        notFound={notFound}  
        setNotFound={setNotFound}  
        currentLocation={currentLocation}  
        setCurrentLocation={setCurrentLocation}  
        showSearch={showSearch}  
        setShowSearch={setShowSearch}  
        inputRef={inputRef}  
      />  

      {/* MAP + WEATHER INFO */}  
      {!showSearch && (  
        <>  
          <MapContent  
            position={position}  
            setPosition={setPosition}  
            mapPlace={mapPlace}  
            setMapPlace={setMapPlace}  
            setCurrentLocation={setCurrentLocation}  
            setPlace={setPlace}  
            detailsRef={detailsRef} 
          />  

          {loading ? (  
            <p className="loadingWeather">  
              <span className="material-symbols-outlined">  
                progress_activity  
              </span>  
            </p>  
          ) : weather ? (  
            <div className="weatherDetails">  
              <h2>{weather.main.temp} °C</h2>  
              <p style={{ textTransform: "capitalize" }}>  
                {weather.weather[0].description}  
              </p>  
              <input  
                type="button"  
                value="Details -->"  
                onClick={Details}  
                ref={(el) => (detailsRef.current[1] = el)}  

                style={{  
                  marginTop: "40px",  
                  backgroundColor: "blue",  
                  color: "white",  
                  border: "none",  
                  padding: "10px",  
                  borderRadius: "5px",  
                  cursor: "pointer",  
                  marginLeft: "30px"
                }}  
              />  
            </div>  
          ) : (  
            <p>Kindly enter your preferred city</p>  
          )}  
        </>  
      )}  
    </>  
  )}  

  {/* FORECAST */}  
  {forecast.length > 0 &&  
    (() => {  
      const groupedForecast = forecast.reduce((acc, item) => {  
        if (!acc[item.date]) acc[item.date] = [];  
        acc[item.date].push(item);  
        return acc;  
      }, {});  

      const threeDayKeys = Object.keys(groupedForecast).slice(0, 3);  
      const sevenDayKeys = Object.keys(groupedForecast).slice(0, 7);  


      return (  
        <div style={{ marginTop: "30px" }} ref = {el => backRef.current[1] = el}>  
          {/* 3-Day Hourly Forecast */}  
          <div className="three">  
            <h3>Next 72 Hours</h3>  
            <div className="flex gap-2 overflow-x-auto pb-2">  
              {threeDayKeys.map((date, index) => {  
                const tabs = [                                                { id: "today", label: "Today" },                           { id: "tomorrow", label: "Tomorrow" },                     { id: "day3", label: new Date(date).toLocaleDateString("en-US", { weekday: "short"}) }  
                ];  
                const btn = tabs[index];  
                const { avgTemp, condition } = getDaySummary(  
                  groupedForecast[date]  
                );  

                return (  
                  <button  
                    key={btn.id}  
                    onClick={() => setSelectedDate(date)}  
                    className={  
                      selectedDate === date  
                        ? "activeDateTab"  
                        : "selectButton"  
                    }  
                  >  
                    {btn.label}  
                    <br />  
                        <span style={{ display: "flex", gap: "30px" }}>  
                    <span>{avgTemp}°C</span>  
                        <span>{condition}</span>  
                        </span>  
                  </button>  
                );  
              })}  
            </div>  

            {/* Hourly forecast scrollable */}  
            <div className="threeDays">  
              {groupedForecast[selectedDate]?.map(  
                ({ time, temperature, condition }, index) => (  
                  <div key={index} className="threeDaysDetails">  
                    <p>{time}</p>  
                    <p>{temperature}°C</p>  
                    <p>{condition}</p>  
                  </div>  
                )  
              )}  
            </div>  
          </div>  

          {/* 7-Day Summary */}  
          <div className="sevenDays">  
          <h3 className="mt-6">Next 7 Days</h3>  
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">  
            {sevenDayKeys.map((date, i) => {  
              const items = groupedForecast[date];  
              const { avgTemp, condition } = getDaySummary(items);  

              return (  
                <div  
                  key={i}  
                  className="p-4 bg-gray-200 rounded shadow text-center"  
                  style={{ display: "flex", gap: "10px", justifyContent: "center"}}  
                >  

                  <h4 style={{ transform: "translateY(-5.5px)" }}>{date}</h4>  
                  <p>Avg: {avgTemp}°C</p>  
                  <p>{condition}</p>  

                </div>  
              );  
            })}  
          </div>  
         </div>  
        </div>  
      );  
    })()}  
</div>

);
};

export default Weather;
