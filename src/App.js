import { useEffect, useState } from "react";
import { Navbar, Container, Row, Col, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";
import { Routes, Route, Link } from "react-router-dom";
import Samples from "./Samples";
import Sites from "./Sites";
import { concentrationChartTemplate, statusChartTemplate } from "./charts";

function App() {

  const [sites, setSites] = useState([]);
  const [created, setCreated] = useState("");
  const [samples, setSamples] = useState([]);
  const [geo, setGeo] = useState(null);
  const [query, setQuery] = useState("");
  const [siteId, setSiteId] = useState("");
  const [site, setSite] = useState(null);
  const [statusChart, setStatusChart] = useState(statusChartTemplate);
  const [concentrationChart, setConcentrationChart] = useState(concentrationChartTemplate);

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
      setSiteId(siteid);
      setCreated(data.created);
      data.sites = data.sites.reduce((obj, item) => {
        obj[item.plutof_id] = item;
        return obj;
      }, {});
      setSites(data.sites);
      if (siteid) {
        setSite(data.sites[siteid]);
      }
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

  function handleSiteChange(event) {
    const parent_area_plutof_id = event.target.value;
    setSiteId(parent_area_plutof_id);
    setSite(sites[parent_area_plutof_id]);
    filterSamples(samples, parent_area_plutof_id, query);
    updateUrl(parent_area_plutof_id, query);
    // setSpecies(null);
  }

  function handleQueryChange(event) {
    const input = event.target.value.toLowerCase();
    setQuery(input);
    filterSamples(samples, siteId, input);
    updateUrl(siteId, input);
  }

  function showSample(sample, siteId, input) {
    const site_ok = sample.parent_area_plutof_id.toString() === siteId || siteId === "";
    const query = sample.name.toLowerCase().includes(input) || sample.area_name.toLowerCase().includes(input) || sample.parent_area_name.toLowerCase().includes(input) || input === "";
    return site_ok && query;
  }

  function countValues(arr, prop) {
    return arr.reduce((acc, obj) => {
      const val = obj[prop];
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }
  
  function updateUrl(siteId, input) {
    window.history.replaceState(null, null, "?search=" + input +"&site=" + siteId);
  }

  function filterSamples(samples, siteId, input) {
    const new_samples = [...samples].map(sample => {
      sample.display = showSample(sample, siteId, input);
      return sample;
    });
    setSamples(new_samples);
    calculateStatusChart(new_samples);
    calculateConcentrationChart(new_samples);
  };

  function getUrlParams() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return {
      search: urlSearchParams.get("search") ? urlSearchParams.get("search") : "",
      site: urlSearchParams.get("site") ? urlSearchParams.get("site") : ""
    }
  }

  function calculateConcentrationChart(new_samples) {
    const concentrations = new_samples.filter(sample => sample.display).map(sample => sample.dnas.map(dna => dna.concentration)).flat();
    const concentrations_blank = new_samples.filter(sample => sample.display && sample.blank).map(sample => sample.dnas.map(dna => dna.concentration)).flat();
    const data = concentrations.map(conc => [0, conc]);
    const data_blank = concentrations_blank.map(conc => [1, conc]);
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

  return (
    <div className="App">
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            eDNA Expeditions sample tracking
          </Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Samples</Nav.Link>
              <Nav.Link as={Link} to="/sites">Sites</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Samples sites={sites} samples={samples} setSamples={setSamples} geo={geo} site={site} siteId={siteId} query={query} handleQueryChange={handleQueryChange} handleSiteChange={handleSiteChange} concentrationChart={concentrationChart} statusChart={statusChart} />}></Route>
        <Route path="/sites" element={<Sites />}></Route>
      </Routes>

      <footer className="footer mt-auto pt-5 pb-5 bg-light">
        <Container>
        <Row>
          <Col lg={true}>
            <img src="logo.jpg" alt="logo" className="img-fluid logo" />
          </Col>
          <Col lg={true}>
            <p className="text-muted">Environmental DNA Expeditions is a global, citizen science initiative that will help measure marine biodiversity, and the impacts climate change might have on the distribution patterns of marine life, across UNESCO World Heritage marine sites.</p>
            <p className="text-muted">Data last updated XXXXX.</p>
          </Col>
        </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;
