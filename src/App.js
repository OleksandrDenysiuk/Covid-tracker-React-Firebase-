import React, {useState, useEffect} from 'react';
import './App.css';
import "leaflet/dist/leaflet.css";

import { FormControl, Select, MenuItem, Card, CardContent} from '@material-ui/core';

import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import {sortData} from './util';

const url ='https://disease.sh/v3/covid-19/countries' ;

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [ countryInfo, setCountryInfo] = useState({}); 
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat:34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then((res) =>  res.json())
      .then((data) => {
        setCountryInfo(data); 
      })
  }, [])

  useEffect(() => {
    const getCountries = async () => {
      await fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const countries = data.map(country => ({
              name: country.country,
              value: country.countryInfo.iso3,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountries();
  }, []);


  const onCounryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' 
                ?  'https://disease.sh/v3/covid-19/all' 
                : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
                
    await fetch(url)
      .then(res => res.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data); 
        
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      })
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1 className="app__title">Covid-19 tracker</h1>
          
          <FormControl className="app__dropdown">
            <Select
                variant='outlined'
                value={country}
                onChange={onCounryChange}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem key={country.name} value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <div className="app__stats">
          <InfoBox title='Coronavirus cases' cases={countryInfo.todayCases} total={countryInfo.cases}/>
          <InfoBox title='Recovered' cases={countryInfo.todayRecovered} total={countryInfo.recovered}/>
          <InfoBox title='Deaths' cases={countryInfo.todayDeaths} total={countryInfo.deaths}/>
        </div>

        <Map countries={mapCountries}  center={mapCenter} zoom={mapZoom}/>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Coutry</h3>
          <Table countries={tableData}/>
          <h3>Worldwide new cases</h3>
          <LineGraph />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
