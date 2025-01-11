// Climate Emergency Dashboard with Real-Time Data Integration

// Import libraries
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import MapboxGL from 'mapbox-gl';
import axios from 'axios';
import './App.css';

// Set your Mapbox token
MapboxGL.accessToken = 'pk.eyJ1IjoiaGFuYWF6YWIiLCJhIjoiY201b3ZyOWN6MG1uZDJrcHRwbnRiYXlycSJ9.poGprqt-9cC6pOF52Se1Fg';

const App = () => {
  const [fireData, setFireData] = useState([]);
  const [airQuality, setAirQuality] = useState([]);

  // Fetch Wildfire Data from NASA FIRMS API
  useEffect(() => {
    const fetchFireData = async () => {
      try {
        const response = await axios.get(
          'https://eonet.sci.gsfc.nasa.gov/api/v2.1/events?category=wildfires'
        );
        const fires = response.data.events.map((event) => ({
          id: event.id,
          latitude: event.geometries[0].coordinates[1],
          longitude: event.geometries[0].coordinates[0],
          name: event.title,
        }));
        setFireData(fires);
      } catch (error) {
        console.error('Error fetching fire data:', error);
      }
    };
    fetchFireData();
  }, []);

  // Fetch Air Quality Data from OpenAQ API
  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        const response = await axios.get(
          'https://api.openaq.org/v2/measurements?city=Los%20Angeles'
        );
        const airData = response.data.results.map((item, index) => ({
          id: index,
          latitude: item.coordinates.latitude,
          longitude: item.coordinates.longitude,
          aqi: item.value,
        }));
        setAirQuality(airData);
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    };
    fetchAirQualityData();
  }, []);

  // Initialize map and add markers
  useEffect(() => {
    const map = new MapboxGL.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [-118.2437, 34.0522], // Center on Los Angeles
      zoom: 8,
    });

    // Add wildfire markers
    fireData.forEach((fire) => {
      new MapboxGL.Marker({ color: 'red' })
        .setLngLat([fire.longitude, fire.latitude])
        .setPopup(new MapboxGL.Popup().setText(fire.name))
        .addTo(map);
    });

    // Add air quality markers
    airQuality.forEach((aq) => {
      const color = aq.aqi > 100 ? 'orange' : 'green';
      new MapboxGL.Marker({ color })
        .setLngLat([aq.longitude, aq.latitude])
        .setPopup(new MapboxGL.Popup().setText(`AQI: ${aq.aqi}`))
        .addTo(map);
    });

    return () => map.remove();
  }, [fireData, airQuality]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#fff', padding: '1em', color: 'black' }}>
        <h1>CLIMATE EMERGENCY DASHBOARD</h1>
      </header>
      <div id="map" style={{ flexGrow: 1 }}></div>
      <footer style={{ backgroundColor: '#333', color: 'white', textAlign: 'center', padding: '0.5em' }}>
        <p>Data Sources: NASA FIRMS, OpenAQ</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
