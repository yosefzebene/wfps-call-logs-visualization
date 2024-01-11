import React, { useCallback, useEffect } from 'react';
import ReactMapGl, { Marker, FullscreenControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useState } from 'react';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;
const locationApiCache = new Map();

const DataMap = ({callLogs}) => {

    console.log(callLogs);

    const [markers, setMarkers] = useState([]);

    const popup = useCallback((marker) => {
        return new mapboxgl.Popup().setText(marker.incident_type);
    }, []);

    useEffect(() => {
        const getCallLocationByNeighbourhood = async (neighbourhood) => {
            if(!locationApiCache.has(neighbourhood)) {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${neighbourhood}.json?proximity=-97.138451,49.895077&access_token=${MAPBOX_TOKEN}`);
                const data = await response.json();

                locationApiCache.set(neighbourhood, data.features[0].center);
            }
    
            return locationApiCache.get(neighbourhood);
        }

        const onCallLogsUpdate = async () => {
            for (const callLog of callLogs) {
                const location = await getCallLocationByNeighbourhood(callLog.neighbourhood);
    
                const marker = {
                    id: callLog.incident_number,
                    longitude: location[0],
                    latitude: location[1],
                    incident_type: callLog.incident_type,
                    units: callLog.units,
                    car_accident: callLog.motor_vehicle_incident,
                    closed_time: callLog.closed_time
                }
    
                setMarkers(prevArray => [...prevArray, marker]);
            };
        }

        setMarkers([]);

        onCallLogsUpdate();
    }, [callLogs])

    console.log("Cache size: " + locationApiCache.size);
    console.log("Call log count: " + callLogs.length);

    return (
        <ReactMapGl
            initialViewState={{
                longitude: -97.138451,
                latitude: 49.895077,
                zoom: 10,
                pitch: 30
            }}
            mapStyle="mapbox://styles/yosefz/clqxzkl9c00pv01pif0z27cm8"
            style={{ height: '100vh', width: '100vw' }}
            mapboxAccessToken={MAPBOX_TOKEN}
            maxBounds={[[-97.639717, 49.704730], [-96.649797, 50.069708]]}
            maxPitch={50}
        >
            {
                markers.map(marker => 
                    <Marker
                        key={marker.id}
                        longitude={marker.longitude}
                        latitude={marker.latitude}
                        color="#fc8383"
                        popup={popup(marker)}
                    />)
            }

            <FullscreenControl position={"top-left"} />
        </ReactMapGl>
    );
};

export default DataMap;
