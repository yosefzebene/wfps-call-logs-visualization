import React, { useEffect } from 'react';
import ReactMapGl, { FullscreenControl, Source, Layer } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useState } from 'react';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;
const locationApiCache = new Map();
const incidentIcons = new Map([
    ["Medical Response", "medical_response"],
    ["Fire Rescue - Alarm", "fire_rescue_alarm"],
    ["Fire Rescue - Outdoor", "fire_rescue_outdoor"],
    ["Fire Rescue - Structure Fire", "fire_rescue_structure_fire"],
    ["Fire Rescue - Hazmat", "hazmat"]
]);

const DataMap = ({callLogs}) => {
    const [geojson, setGeojson] = useState({
        type:'FeatureCollection',
        features: []
    });

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
            const features = [...geojson.features];

            for (const callLog of callLogs.slice(geojson.features.length)) {
                const location = await getCallLocationByNeighbourhood(callLog.neighbourhood);
                const icon = callLog.motor_vehicle_incident === 'YES' ? 'car_crash' : incidentIcons.get(callLog.incident_type);

                const dateOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                };

                // Set the icon property depending on the incident type
                const feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: location
                    },
                    properties: {
                        description: `<strong>${callLog.incident_type}</strong><ul>
                        <li>Units: ${callLog.units ? callLog.units : 'None'}</li>
                        <li>Call Time: ${new Date(callLog.call_time).toLocaleString('en-US', dateOptions)}</li>
                        <li>Call closed time: ${callLog.closed_time ? new Date(callLog.closed_time).toLocaleString('en-US', dateOptions) : 'Not closed yet'}</li></ul>`,
                        icon: icon
                    }
                }

                features.push(feature);
            };

            setGeojson(prevState => ({...prevState, features: features}));
        }

        onCallLogsUpdate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callLogs])

    const onClick = (e) => {
        if (e.features.length) {
            const coordinates  = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) 
            {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(e.target);
        }
    }

    console.log("Cache size: " + locationApiCache.size);
    console.log("Call log count: " + callLogs.length);
    console.log(geojson);

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
            interactiveLayerIds={["unclustered-point"]}
            onClick={onClick}
            maxBounds={[[-97.639717, 49.704730], [-96.649797, 50.069708]]}
            maxPitch={50}
        >
            <Source
                id="callLogs"
                type="geojson"
                data={geojson}
            >
                <Layer
                    id="unclustered-point"
                    type="symbol"
                    layout={{
                        "icon-image": ['get', 'icon'],
                        "icon-allow-overlap": true,
                        "icon-size": 1,
                    }}
                />
            </Source>
            <FullscreenControl position={"top-left"} />
        </ReactMapGl>
    );
};

export default DataMap;
