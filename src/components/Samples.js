import { useEffect, useRef } from "react";
import { Container, Row, Col, Table, Modal } from "react-bootstrap";
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
import { Link45deg, FileText, Book } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import SiteSelector from "./SiteSelector";

Highcharts.setOptions({ credits: { enabled: false } });
const { BaseLayer } = LayersControl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

function Samples({sites, samples, setSamples, geo, site, siteId, query, handleSiteChange, handleQueryChange, concentrationChart, statusChart}) {

  const geoRef = useRef(null);

  useEffect(() => {
    if (geoRef.current) {
      geoRef.current.clearLayers().addData(geo);
    }
  }, [geo]);

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

  function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
  }

  return (
    <div className="Samples">
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
            <SiteSelector sites={sites} siteId={siteId} handleSiteChange={handleSiteChange} />
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
        { site &&
          <Row>
            <Col className="mb-2">
              <h2>{site.name}</h2>
              <p>
                <Link45deg /> <a href={site.url} rel="noreferrer" target="_blank">{ site.url }</a>
                {/* <FileText className="ms-3" /> <Link to="species">OBIS species list</Link> */}
                {
                  site.article && <span className="ms-3"><Book /> <a href={site.article} rel="noreferrer" target="_blank">read article</a></span>
                }
              </p>
            </Col>
          </Row>
        }
        <Row>
          <Col className="mb-3">
            {
              samples && samples.length ?
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
              </Table> : <p>No samples found.</p>
            }
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Samples;
