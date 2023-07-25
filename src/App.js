import { useEffect, useState, useRef } from "react";
import { Navbar, Container, Row, Col, Table } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

Highcharts.setOptions({ credits: { enabled: false } });
const { BaseLayer } = LayersControl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

function countValues(arr, prop) {
  return arr.reduce((acc, obj) => {
    const val = obj[prop];
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function App() {

  const [query, setQuery] = useState("");
  const [created, setCreated] = useState("");
  const [site, setSite] = useState("");
  const [geo, setGeo] = useState(null);
  const [sites, setSites] = useState([]);
  const [samples, setSamples] = useState([]);
  const [statusChart, setStatusChart] = useState(
    {
      chart: { type: "bar", height: "200px" },
      xAxis: { labels: { formatter: function() { return "Status" }}, categories: ["registered",  "collected", "extracted", "sequenced"] },
      yAxis: { title: null },
      legend: { reversed: false },
      plotOptions: { series: { stacking: "normal" }},
      colors: [ "#85A389", "#468B97", "#F3AA60", "#EF6262" ],
      title: null,
      series: []
    }
  );
  const [concentrationChart, setConcentrationChart] = useState(
    {
      chart: { type: "scatter", height: "200px" },
      title: null,
      yAxis: { title: { text: "DNA concentration (ng/μl)" } },
      xAxis: { categories: ["Sample", "Blank"] },
      plotOptions: {
        scatter: {
          showInLegend: false,
          jitter: {
              x: 0.1,
              y: 0
          },
          marker: {
              radius: 2,
              symbol: "circle",
              fillColor: "#EF6262"
          },
          tooltip: {
              pointFormat: "Concentration (ng/μl): {point.y:.3f}"
          }
        }
      },
      series: []
    }
  );
  const geoRef = useRef(null);

  function calculateConcentrationChart(new_samples) {
    const concentrations = new_samples.filter(sample => sample.display).map(sample => sample.dnas.map(dna => dna.concentration)).flat();
    const concentrations_blank = new_samples.filter(sample => sample.display && sample.blank).map(sample => sample.dnas.map(dna => dna.concentration)).flat();
    const data = concentrations.map(conc => Array(0, conc));
    const data_blank = concentrations_blank.map(conc => Array(1, conc));
    setConcentrationChart({
      ...concentrationChart,
      series: [
        {
          name: "DNA concentration",
          data: data
        },
        {
          name: "DNA concentration blank",
          data: data_blank
        }
      ]
    });
  }

  function calculateStatusChart(new_samples) {
    const counts = countValues(new_samples.filter(sample => sample.display), "status");
    setStatusChart({
      ...statusChart,
      series: [
        {
          name: "sequenced",
          data: [counts.sequenced ? counts.sequenced : 0],
          legendIndex: 4
        },
        {
          name: "extracted",
          data: [counts.extracted ? counts.extracted : 0],
          legendIndex: 3
        },
        {
          name: "collected",
          data: [counts.collected ? counts.collected : 0],
          legendIndex: 2
        },
        {
          name: "registered",
          data: [counts.registered ? counts.registered : 0],
          legendIndex: 1
        },
      ]
    });
  }

  function showSample(sample, site, input) {
    const site_ok = sample.parent_area_plutof_id.toString() === site || site == "";
    const query = sample.name.toLowerCase().includes(input) || sample.area_name.toLowerCase().includes(input) || sample.parent_area_name.toLowerCase().includes(input) || input == "";
    return site_ok && query;
  }

  function updateUrl(site, input) {
    window.history.replaceState(null, null, "?search=" + input +"&site=" + site);
  }

  function handleSiteChange(event) {
    const parent_area_plutof_id = event.target.value;
    setSite(parent_area_plutof_id);
    filterSamples(samples, parent_area_plutof_id, query);
    updateUrl(parent_area_plutof_id, query);
  }

  function handleQueryChange(event) {
    const input = event.target.value.toLowerCase();
    setQuery(input);
    filterSamples(samples, site, input);
    updateUrl(site, input);
  }

  function filterSamples(samples, site, input) {
    const new_samples = [...samples].map(sample => {
      sample.display = showSample(sample, site, input);
      return sample;
    });
    setSamples(new_samples);
    calculateStatusChart(new_samples);
    calculateConcentrationChart(new_samples);
  };

  function statusClass(status) {
    if (status === "registered") {
      return "bg-registered";
    } else if (status === "collected") {
      return "bg-collected";
    } else if (status === "extracted") {
      return "bg-extracted";
    } else if (status === "sequenced") {
      return "bg-sequenced";
    }
  }

  function getUrlParams() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return {
      search: urlSearchParams.get("search") ? urlSearchParams.get("search") : "",
      site: urlSearchParams.get("site") ? urlSearchParams.get("site") : ""
    }
  }

  useEffect(() => {
    if (geoRef.current) {
      geoRef.current.clearLayers().addData(geo);
    }
  }, [geo]);

  useEffect(() => {
    async function fetchData() {
      const params = getUrlParams();
      const input = params.search;
      const siteid = params.site;

      const res = await fetch("https://raw.githubusercontent.com/iobis/edna-tracker-data/data/generated.json");
      const data = await res.json();
      data.samples.forEach(sample => {
        sample.display = true;
      });

      setQuery(input);
      setSite(siteid);
      setCreated(data.created);
      setSites(data.sites.sort((a, b) => (a.name > b.name) ? 1 : -1));
      filterSamples(data.samples, siteid, input);
      calculateStatusChart(data.samples);
      calculateConcentrationChart(data.samples);
    }
    fetchData();
    async function fetchGeo() {
      const res = await fetch("sites.geojson");
      const data = await res.json();
      setGeo(data);
    }
    fetchGeo();
  }, []);

  function sortSamples(column) {
    if (column === "event_begin") {
      setSamples([...samples].sort(function(s1, s2) {
        return s1.event_begin < s2.event_begin ? -1 : 1;
      }));
    }
    if (column === "name") {
      setSamples([...samples].sort(function(s1, s2) {
        return s1.name < s2.name ? -1 : 1;
      }));
    }
    if (column === "parent_area_name") {
      setSamples([...samples].sort(function(s1, s2) {
        return s1.parent_area_name < s2.parent_area_name ? -1 : 1;
      }));
    }
    if (column === "area_name") {
      setSamples([...samples].sort(function(s1, s2) {
        return s1.area_name < s2.area_name ? -1 : 1;
      }));
    }
  }

  function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
  }

  return (
    <div className="App">
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            eDNA Expeditions sample tracking
          </Navbar.Brand>
        </Container>
      </Navbar>

      <MapContainer
        id="map"
        center={[10, 0]}
        zoom={1}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.Overlay name="Marker with popup">
            <BaseLayer checked name="CartoDB">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              />
            </BaseLayer>
            <BaseLayer name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name="ESRI World Imagery">
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
          </LayersControl.Overlay>
        </LayersControl>

        <GeoJSON data={geo} ref={geoRef} onEachFeature={onEachFeature} style={{
          "color": "#ff7800",
          "weight": 2,
          "opacity": 0.5,
        }}/>

        <MarkerClusterGroup maxClusterRadius={40}>
          {
            samples.filter(sample => sample.area_longitude && sample.display).map(sample => <Marker key={sample.name} position={[sample.area_latitude, sample.area_longitude]} >
              <Popup>{sample.name} - {sample.area_name}</Popup>
            </Marker>)
          }
        </MarkerClusterGroup>

      </MapContainer>

      <Container className="mt-3 mb-3">
        <Row>
          <Col lg="4" className="mt-3 mb-3">
            <div>
              <label className="mb-2">Select World Heritage site</label>
              <select className="form-select" value={site} onChange={handleSiteChange}>
                <option value="">Select site</option>
                {
                  sites.map((site) => <option key={site.plutof_id} value={site.plutof_id}>{site.name}</option>)
                }
              </select>
            </div>
            <div className="mt-3">
              <label className="mb-2">Search</label>
              <input value={query} onChange={handleQueryChange} className="form-control" type="text" placeholder="Search" />
            </div>
          </Col>
          <Col lg="3" className="mt-3 mb-3 text-center">
            <HighchartsReact highcharts={Highcharts} options={concentrationChart} />
          </Col>
          <Col lg="5" className="mt-3 mb-3 text-center">
            <HighchartsReact highcharts={Highcharts} options={statusChart} />
          </Col>
        </Row>
        <Row>
          <Col className="mb-3">
            {
              samples.length ?
              <Table className="table-sm text-sm">
                <thead>
                  <tr className="nowrap">
                    <th onClick={() => sortSamples("name")}><span role="button">Identifier ↓</span></th>
                    <th>Status</th>
                    <th onClick={() => sortSamples("parent_area_name")}><span role="button">Site ↓</span></th>
                    <th onClick={() => sortSamples("area_name")}><span role="button">Locality ↓</span></th>
                    <th onClick={() => sortSamples("event_begin")}><span role="button">Collected ↓</span></th>
                    <th>Size (ml)</th>
                    <th>Blank</th>
                    <th>DNA<br/>(ng/μl)</th>
                  </tr>
                </thead>
                <tbody>
                  { samples.filter(sample => sample.display).map((sample) => <tr key={sample.name}>
                    <td>{sample.name}</td>
                    <td><span className={statusClass(sample.status) + " badge"}>{sample.status}</span></td>
                    <td>{sample.parent_area_name}</td>
                    <td>{sample.area_name}</td>
                    <td className="nowrap">{sample.event_begin}</td>
                    <td>{sample.size}</td>
                    <td>{sample.blank ? "yes" : ""}</td>
                    <td>
                    { sample.dnas.map((dna) => <span key={dna.plutof_id}>{dna.concentration}</span> )}
                    </td>
                  </tr>) }
                </tbody>
              </Table> :
              <p>Loading sample data...</p>
            }
          </Col>
        </Row>
      </Container>
      <footer className="footer mt-auto pt-5 pb-5 bg-light">
        <Container>
        <Row>
          <Col lg={true}>
            <img src="logo.jpg" alt="logo" className="img-fluid logo" />
          </Col>
          <Col lg={true}>
            <p className="text-muted">Environmental DNA Expeditions is a global, citizen science initiative that will help measure marine biodiversity, and the impacts climate change might have on the distribution patterns of marine life, across UNESCO World Heritage marine sites.</p>
            <p className="text-muted">Data last updated {created}.</p>
          </Col>
        </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;
