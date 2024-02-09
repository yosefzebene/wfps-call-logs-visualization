import { useEffect, useState, useCallback } from "react";

const filterOptions = [
    'Vehicle Accident',
    'Medical Response',
    'Fire Rescue - Alarm',
    'Fire Rescue - Outdoor',
    'Fire Rescue - Structure Fire',
    'Fire Rescue - Hazmat',
]

const Filter = ({ originalGeoJson, setFilteredGeoJson }) => {
    const [isHidden, setIsHidden] = useState(true);
    const [filter, setFilter] = useState('');

    const filterData = useCallback(() => {
        let filteredData;

        if (!filter)
            filteredData = originalGeoJson.features;
        else {
            filteredData = filter === 'Vehicle Accident' ? 
                originalGeoJson.features.filter((feature) => feature.properties.vehicle_incident === 'YES')
                :
                originalGeoJson.features.filter((feature) => feature.properties.incident_type === filter);
        }

        setFilteredGeoJson(prevState => ({...prevState, features: filteredData}));
    }, [filter, originalGeoJson, setFilteredGeoJson]);

    useEffect(() => {
        filterData();
    }, [originalGeoJson, filter, filterData]);

    const onClickClear = () => {
        setFilter('');
    };

    return (
        <>
        {isHidden ?
            <button className='show-filter-button' onClick={() => setIsHidden(false)}>Show Filter</button>
            :
            <div className='filter-box'>
                <form>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value=''>All</option>
                        {filterOptions.map(option => <option key={option}>{option}</option>)}
                    </select>
                </form>
                <button onClick={onClickClear}>Clear</button>
                <button onClick={() => setIsHidden(true)}>Hide</button>
            </div>
        }
        </>
    );
};

export default Filter;
