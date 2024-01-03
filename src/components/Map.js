import ReactMapboxGl from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = () => {
    const Mapbox = ReactMapboxGl({
        accessToken: process.env.REACT_APP_MAPBOX_KEY
    });

    return (
        <Mapbox
            style="mapbox://styles/yosefz/clqxzkl9c00pv01pif0z27cm8"
            containerStyle={{
                height: '100vh',
                width: '100vw'
            }}
            center={[-97.138451, 49.895077 ]}
            zoom={[10]}
            maxBounds ={[[-97.639717, 49.704730], [-96.649797, 50.069708]]}
        >
        </Mapbox>
    );
}

export default Map;
