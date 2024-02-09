import React, { useEffect, useState } from 'react';
import ReactMapGl, { FullscreenControl, Source, Layer } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import Filter from './Filter';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_KEY;
const incidentIcons = new Map([
    ["Medical Response", "medical_response"],
    ["Fire Rescue - Alarm", "fire_rescue_alarm"],
    ["Fire Rescue - Outdoor", "fire_rescue_outdoor"],
    ["Fire Rescue - Structure Fire", "fire_rescue_structure_fire"],
    ["Fire Rescue - Hazmat", "hazmat"]
]);

let locationAPICallCount = 0;

const DataMap = ({callLogs}) => {
    const [geojson, setGeojson] = useState({
        type:'FeatureCollection',
        features: []
    });

    const [filteredGeoJson, setFilteredGeoJson] = useState({
        type:'FeatureCollection',
        features: []
    });

    useEffect(() => {
        // Gets a random location inside of the Neighborhood bounding box.
        const getRandomLocationFromBoundingBox = (boundingBox) => {
            const minLon = boundingBox[0], minLat = boundingBox[1];
            const maxLon = boundingBox[2], maxLat = boundingBox[3];

            const randomLon = Math.random() * (maxLon - minLon) + minLon;
            const randomLat = Math.random() * (maxLat - minLat) + minLat;

            return [randomLon, randomLat];
        }

        const getCallLocationByNeighbourhood = async (neighbourhood) => {
            if(!localStorage.getItem(neighbourhood)) {
                const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${neighbourhood}.json?proximity=-97.138451,49.895077&types=neighborhood&access_token=${MAPBOX_TOKEN}`);
                const data = await response.json();
                locationAPICallCount++;

                localStorage.setItem(neighbourhood, JSON.stringify(data.features[0].bbox))
            }

            return JSON.parse(localStorage.getItem(neighbourhood));
        }

        const onCallLogsUpdate = async () => {
            const features = [...geojson.features];

            for (const callLog of callLogs.slice(geojson.features.length)) {
                const icon = callLog.motor_vehicle_incident === 'YES' ? 'car_crash' : incidentIcons.get(callLog.incident_type);
                const neighborhoodBoundingBox = await getCallLocationByNeighbourhood(callLog.neighbourhood);
                const randomLocationInTheNeighborhood = getRandomLocationFromBoundingBox(neighborhoodBoundingBox);

                const dateOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                };

                const feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: randomLocationInTheNeighborhood
                    },
                    properties: {
                        description: `<strong>${callLog.incident_type}</strong><ul>
                        <li>Neighborhood: ${callLog.neighbourhood}</li>
                        <li>Units: ${callLog.units ? callLog.units : 'None'}</li>
                        <li>Call Time: ${new Date(callLog.call_time).toLocaleString('en-US', dateOptions)}</li>
                        <li>Call closed time: ${callLog.closed_time ? new Date(callLog.closed_time).toLocaleString('en-US', dateOptions) : 'Not closed yet'}</li></ul>`,
                        incident_type: callLog.incident_type,
                        vehicle_incident: callLog.motor_vehicle_incident,
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

    console.log("Location API Call Count: " + locationAPICallCount);

    return (
        <ReactMapGl
            initialViewState={{
                longitude: -97.138451,
                latitude: 49.895077,
                zoom: 9
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
                data={filteredGeoJson}
                cluster={true}
                clusterMaxZoom={12}
                clusterRadius={40}
            >
                <Layer
                    id="clusters"
                    type="circle"
                    filter={['has', 'point_count']}
                    paint={{
                        'circle-color': ['step', ['get', 'point_count'], '#91d3ff', 3, '#c491ff', 5, '#ff9191'],
                        'circle-radius': ['step', ['get', 'point_count'], 15, 3, 20, 10, 30]
                    }}
                />
                <Layer
                    id="cluster-count"
                    type="symbol"
                    layout={{
                        'text-field': ['get', 'point_count_abbreviated'],
                        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 14
                    }}
                />
                <Layer
                    id="unclustered-point"
                    type="symbol"
                    filter={['!', ['has', 'point_count']]}
                    layout={{
                        "icon-image": ['get', 'icon'],
                        "icon-allow-overlap": true,
                        "icon-size": ['step', ["zoom"], 0.3, 12, 0.4, 14, 0.6, 15, 1],
                    }}
                />
            </Source>
            <FullscreenControl position={"top-left"} />
            <Filter originalGeoJson={geojson} setFilteredGeoJson={setFilteredGeoJson}/>
        </ReactMapGl>
    );
};

export default DataMap;
