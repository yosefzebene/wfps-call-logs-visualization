import React, { useCallback } from 'react';
import Map, { Marker, FullscreenControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useState } from 'react';

const DataMap = ({callLogs}) => {
    const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;

    const [markers, setMarkers] = useState([]);

    const getCallLocation = async (neighbourhood) => {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${neighbourhood}.json?proximity=-97.138451,49.895077&access_token=${MAPBOX_TOKEN}`);
        const data = await response.json();

        return data.features[0].center;
    }

    const onMapLoad = () => {
        callLogs.map(async (callLog) => {
            // Add caching
            const location = await getCallLocation(callLog.neighbourhood);

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
        });
    }

    const popup = useCallback((marker) => {
        return new mapboxgl.Popup().setText(marker.incident_type);
    }, []);

    return (
        <Map
            initialViewState={{
                longitude: -97.138451,
                latitude: 49.895077,
                zoom: 10,
                pitch: 30
            }}
            mapStyle="mapbox://styles/yosefz/clqxzkl9c00pv01pif0z27cm8"
            onLoad={onMapLoad}
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
        </Map>
    );
};

export default DataMap;
