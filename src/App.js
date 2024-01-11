import './App.css';
import { useEffect, useState } from 'react';
import DataMap from './components/DataMap.js';
import 'mapbox-gl/dist/mapbox-gl.css';

let callLogsApiCallCount = 0;

function App() {
  const [callLogs, setCallLogs] = useState([]);

  const getWFPSCallLogs = async () => {
    const todaysDateAtMidnight = new Date(new Date().setHours(-6,0,0,0)).toISOString().slice(0, -1);

    const cachedCallLogs = localStorage.getItem('callLogsCache');
    const cachedCallLogsData = JSON.parse(cachedCallLogs);

    // Check if the call logs is stored locally and if the data is from todays date from midnight.
    // If not then request for new call logs since midnight.
    if (cachedCallLogs && cachedCallLogsData[cachedCallLogsData.length-1].call_time > todaysDateAtMidnight) {
      // Update the call logs if there is new data since the last
      const mostRecentDate = cachedCallLogsData[cachedCallLogsData.length-1].call_time;

      const response = await fetch(`https://data.winnipeg.ca/resource/yg42-q284.json?$where=call_time > '${mostRecentDate}'&$order=call_time&$limit=5`);
      const data = await response.json();

      setCallLogs(cachedCallLogsData.concat(data));
    }
    else {
      const response = await fetch(`https://data.winnipeg.ca/resource/yg42-q284.json?$where=call_time > '${todaysDateAtMidnight}'&$order=call_time&$limit=5`);
      const data = await response.json();

      callLogsApiCallCount++

      setCallLogs(data);
    }
  };

  useEffect(() => {
    getWFPSCallLogs();

    const timer = setInterval(getWFPSCallLogs, 300000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (callLogs.length > 0)
      localStorage.setItem('callLogsCache', JSON.stringify(callLogs));
  }, [callLogs]);

  console.log("Call Logs API request count: " + callLogsApiCallCount);

  return (
      <DataMap callLogs={callLogs} />
  );
}

export default App;
