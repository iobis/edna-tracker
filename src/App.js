import { useEffect, useState } from "react";
import { Navbar, Container, Row, Col, Table } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";

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
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup maxClusterRadius={40}>
          {
            samples.map(sample => <Marker key={sample.name} position={[sample.area.coords[1], sample.area.coords[0]]} >
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
              <Table>
                <thead>
                  <tr>
                    <th colSpan="5">Collection</th>
                    <th colSpan="2">Extraction</th>
                  </tr>
                  <tr>
                    <th>Identifier</th>
                    <th>Collected</th>
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
                    <td>{sample.timespan_begin}</td>
                    <td>{sample.area_name}</td>
                    <td>{sample.size}</td>
                    <td>{sample.blank ? "yes" : ""}</td>
                    <td>{sample.extract ? sample.extract.created_at.substring(0, 10) : ""}</td>
                    <td>{sample.extract ? sample.extract.concentration : ""}</td>
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
