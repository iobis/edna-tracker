import { Navbar, Container, Row, Col, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";
import { Routes, Route, Link } from "react-router-dom";
import Samples from "./Samples";
import Sites from "./Sites";

function App() {

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
        <Route path="/" element={<Samples />}></Route>
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
