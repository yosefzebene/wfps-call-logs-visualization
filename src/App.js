import './App.css';
import { useEffect, useState } from 'react';
import DataMap from './components/DataMap.js';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  const [callLogs, setCallLogs] = useState([]);

  useEffect(() => {
    async function getWFPSCallLogs() {
      // Add caching
      const response = await fetch("https://data.winnipeg.ca/resource/yg42-q284.json?$where=call_time > '2024-01-04T00:00:00.000'&$order=call_time DESC&$limit=5");
      const data = await response.json();

      setCallLogs(data);
    }
    getWFPSCallLogs();
  }, [])

  return (
      <DataMap callLogs={callLogs} />
  );
}

export default App;
