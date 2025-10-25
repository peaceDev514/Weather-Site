import React, { useEffect } from 'react';

const Geocoding = ({ setPageLoading, setCurrentLocation, setPosition }) => {
  useEffect(() => {
    setPageLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const WEATHER_API_KEY = '3dc6c9d76780083750e6e8038d66cb2e';

        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${WEATHER_API_KEY}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setCurrentLocation(data[0].name); // Store city name, but do NOT put in input
              setPosition([latitude, longitude]); // Store coordinates
            } else {
              setCurrentLocation('');
	      setPageLoading(true);
            }
            setPageLoading(false);
          })
          .catch(err => {
            console.error(err);
            setPageLoading(false);
          });
      },
      (err) => {
        console.error("Error getting location: ", err);
        alert("Unable to get location");
        setPageLoading(false);
      }
    );

    
  }, [setCurrentLocation, setPosition, setPageLoading]);

  return null; 
};

export default Geocoding;
