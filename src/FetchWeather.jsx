import React, { useState, useEffect } from 'react';

const WEATHER_API_KEY = '3dc6c9d76780083750e6e8038d66cb2e';

const FetchWeather = ({
  setWeather,
  setLoading,
  LOCATION,
  setLOCATION,
  setPosition,
  position, // coordinates from Geocoding
  place,
  setPlace,
  notFound,
  setNotFound,
  currentLocation,
  setCurrentLocation,
  showSearch,
  setShowSearch,
  inputRef
  
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [resultLoading, setResultLoading] = useState(false);

  // Search places when typing, debounce 500ms
  useEffect(() => {
    if (!LOCATION.trim()) {
      setSearchResults([]);
      setNotFound(false);
      // When input is empty, fetch weather for current position if available
      if (position && position.length === 2) {
        setLoading(true);
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${position[0]}&lon=${position[1]}&units=metric&appid=${WEATHER_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.cod === 200) {
              setWeather(data);
              setPlace(data.name);
              setNotFound(false);
            } else {
              setNotFound(true);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setNotFound(true);
            setLoading(false);
          });

         
      }
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setResultLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          LOCATION
        )}&limit=15`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length === 0) {
            setNotFound(true);
            setSearchResults([]);
	    setResultLoading(false);
          } else {
            setNotFound(false);
            setSearchResults(data);
	    setResultLoading(false);
          }
	  setResultLoading(false);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setNotFound(true);
          setLoading(false);
        });
    }, 500);

    
    return () => clearTimeout(timer);
  }, [LOCATION, position, setLoading, setWeather, setNotFound, setPlace]);
  

  // When user clicks a search result
  function handleCityClick(lat, lon, displayName) {
    setShowSearch(false);
    setCurrentLocation('');
    setPlace(displayName.split(',')[0]);
    setPosition([parseFloat(lat), parseFloat(lon)]);
    setLoading(true);

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.cod === 200) {
          setWeather(data);
          setNotFound(false);
	  
        } else {
          alert('City not found.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
     fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`)
  .then(res => res.json())
  .then(data => {
    const timeseries = data.properties.timeseries;

    const now = new Date();
    const nextHourIndex = timeseries.findIndex(item => new Date(item.time) > now);

    if (nextHourIndex === -1) {
      console.error("No upcoming data found.");
      return;
    }

    // Filter: every 3 hours starting from the next hour
    const interval = 3;
    const result = [];

    for (let i = nextHourIndex; i < timeseries.length; i += interval) {
      const entry = timeseries[i];
      const time = new Date(entry.time);
      const temp = entry.data.instant.details.air_temperature;

      result.push({
        time: time.toLocaleString(),
        temperature: temp
      });
    }

    // Display in console or DOM
    result.forEach(({ time, temperature }) => {
      console.log(`Time: ${time} | Temp: ${temperature}°C`);
    });
  })
  .catch(err => {
    console.error("Failed to fetch data from Met.no", err);
  });

  }

  return (
    <>

      {showSearch && (
	      <>
      <input
        type="text"
        value={LOCATION}
        onChange={(e) => setLOCATION(e.target.value)}
        placeholder="Enter City ..."
	ref={inputRef}
	className='searchInput'
      />
	  {resultLoading ? (
		  <p className='loadingResults'><span className='material-symbols-outlined'>progress_activity</span></p>
	) : notFound ? (
        <p>Not Found</p>
      ) :(
        searchResults.length > 0 && (
          
            searchResults.map((place, idx) => (
              <p
                key={idx}
                style={{ cursor: 'pointer', color: 'white' }}
                onClick={() => handleCityClick(place.lat, place.lon, place.display_name)}
              >
                {place.display_name}
              </p>
            ))
          
        )
      )}
	      </>
      )}
    </>
  );
};

export default FetchWeather;
