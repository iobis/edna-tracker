import { useEffect, useState } from "react";
import { Navbar, Container, Row, Col, Table } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";

const { BaseLayer } = LayersControl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

function App() {

  const [site, setSite] = useState("");
  const [sites, setSites] = useState([]);
  const [samples, setSamples] = useState([]);

  function handleSiteChange(event) {
    const parent_area_plutof_id = event.target.value;
    setSite(parent_area_plutof_id);
    setSamples([...samples].map(sample => {
      sample.display = sample.parent_area_plutof_id == parent_area_plutof_id || parent_area_plutof_id == "";
      return sample;
    }));
  }

  function status_class(status) {
    if (status === "registered") {
      return "bg-registered";
    } else if (status === "collected") {
      return "bg-collected";
    } else if (status === "extracted") {
      return "bg-extracted";
    }
  }

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("https://raw.githubusercontent.com/iobis/edna-tracker-data/data/generated.json");
      const data = await res.json();
      data.samples.forEach(sample => {
        sample.display = true;
      });
      setSites(data.sites);
      setSamples(data.samples);
    }
    fetchData();
  }, []);

  function table_sort(column) {
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
          <Col lg={true} className="mt-3 mb-3">
            <select className="form-select" value={site} onChange={handleSiteChange}>
              <option value="">Select site</option>
              {
                sites.map((site) => <option key={site.plutof_id} value={site.plutof_id}>{site.name}</option>)
              }
            </select>
          </Col>
          <Col lg={true} className="mt-3 mb-3 text-center">
          </Col>
        </Row>
        <Row>
          <Col lg={true} className="mb-3">
            {
              samples.length ?
              <Table className="table-sm text-sm">
                <thead>
                  <tr className="nowrap">
                    <th onClick={() => table_sort("name")}><span role="button">Identifier ↓</span></th>
                    <th>Status</th>
                    <th onClick={() => table_sort("parent_area_name")}><span role="button">Site ↓</span></th>
                    <th onClick={() => table_sort("area_name")}><span role="button">Locality ↓</span></th>
                    <th onClick={() => table_sort("event_begin")}><span role="button">Collected ↓</span></th>
                    <th>Size (ml)</th>
                    <th>Blank</th>
                    <th>DNA<br/>(ng/μl)</th>
                  </tr>
                </thead>
                <tbody>
                  { samples.filter(sample => sample.display).map((sample) => <tr key={sample.name}>
                    <td>{sample.name}</td>
                    <td><span className={status_class(sample.status) + " badge"}>{sample.status}</span></td>
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
    </div>
  );
}

export default App;
