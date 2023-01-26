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

  const [samples, setSamples] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("https://1di1zf6xed.execute-api.us-east-1.amazonaws.com/v0/samples");
      const data = await res.json();
      setSamples(data);
    }
    fetchData();
  }, []);

  function table_sort(column) {
    if (column === "country") {
      setSamples([...samples].sort(function(s1, s2) {
        if (s1.area && s2.area) {
          return s1.area.country < s2.area.country ? -1 : 1;
        } else {
          return 1;
        }
      }));
    }
    if (column === "collected") {
      setSamples([...samples].sort(function(s1, s2) {
        return s1.timespan_begin < s2.timespan_begin ? -1 : 1;
      }));
    }
    if (column === "identifier") {
      setSamples([...samples].sort(function(s1, s2) {
        return s1.name < s2.name ? -1 : 1;
      }));
    }
  }

  return (
    <div className="App">
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            eDNA expeditions sample tracking
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
          <BaseLayer name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer checked name="ESRI World Imagery">
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
          </LayersControl.Overlay>
        </LayersControl>

        <MarkerClusterGroup maxClusterRadius={40}>
          {
            samples.filter(sample => sample.area).map(sample => <Marker key={sample.name} position={[sample.area.coords[1], sample.area.coords[0]]} >
              <Popup>{sample.name} - {sample.area_name}</Popup>
            </Marker>)
          }
        </MarkerClusterGroup>

      </MapContainer>

      <Container className="mt-3 mb-3">
        <Row>
          <Col lg={true} className="mb-3">
            {
              samples.length ?
              <Table className="table-sm text-sm">
                <thead>
                  <tr>
                    <th colSpan="6">Collection</th>
                    <th colSpan="2">Extraction</th>
                  </tr>
                  <tr>
                    <th onClick={() => table_sort("identifier")}><span role="button">Identifier ↓</span></th>
                    <th onClick={() => table_sort("country")}><span role="button">Country ↓</span></th>
                    <th onClick={() => table_sort("collected")}><span role="button">Collected ↓</span></th>
                    <th>Location</th>
                    <th>Size (ml)</th>
                    <th>Blank</th>
                    <th>Extracted</th>
                    <th>DNA concentration (ng/μl)</th>
                  </tr>
                </thead>
                <tbody>
                  { samples.map((sample) => <tr key={sample.name}>
                    <td>{sample.name}</td>
                    <td>{sample.area ? sample.area.country : ""}</td>
                    <td>{sample.timespan_begin}</td>
                    <td>{sample.area_name}</td>
                    <td>{sample.size}</td>
                    <td>{sample.blank ? "yes" : ""}</td>
                    <td>{sample.extract ? sample.extract.created_at.substring(0, 10) : ""}</td>
                    <td>
                      {sample.extract ? <span style={{"display": "inline-block", "width": "50px"}}>{sample.extract.concentration}</span> : ""}
                      {sample.extract && <span className="bar" style={{width: sample.extract.concentration}}></span>}
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
