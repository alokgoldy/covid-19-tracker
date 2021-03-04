import { 
  FormControl,
  MenuItem,
  Card,
  CardContent,
  Select } 
  from '@material-ui/core';
import React ,{useState,useEffect} from 'react';
import './App.css';
import InfoBox from "./InfoBox";
import Table from "./Table";
import { sortData,prettyPrintStat } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";


function App() {
  const [countries,setCountries] = useState([]);
  const [country, setInputCountry] = useState("worldwide");
  const [tableData, setTableData] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2
        }));
        let sortedData = sortData(data);
        setCountries(countries);
        setTableData(sortedData);
      })
    };

    getCountriesData();
  },[]);
  
  const onCountryChange = async (event) => {
    
    const countryCode = event.target.value;
    
    const url = countryCode === "worldwide"
    ? "https://disease.sh/v3/covid-19/all"
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setInputCountry(countryCode);
      setCountryInfo(data);
    })
  }


  return (
    <div className="app">
       <div className="app__left">
        <div className="app__header">
          <h1>Covid 19 Tracker</h1>
          <FormControl className="app__dropdown">
              <Select
                variant="outlined"
                value={country}
                onChange={onCountryChange}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </div>
      <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            active={casesType === "cases"}
            title="Coronavirus Cases"
            isRed
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
       </div>
      
        <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new casesType</h3>
            
          </div>
        </CardContent>
      </Card>  
    </div>
  );
}

export default App;
