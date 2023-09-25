import { useState } from "react";
import { Container, Row, Col, Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import SiteSelector from "./SiteSelector";
import { Database, Droplet } from "react-bootstrap-icons";
import FeedbackModal from "./FeedbackModal";

function Species({sites}) {

  const [species, setSpecies] = useState(null);
  const [siteId, setSiteId] = useState("");
  const [site, setSite] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  function handleSiteChange(event) {
    const parent_area_plutof_id = event.target.value;
    if (parent_area_plutof_id === "") {
      setSite(null);
      setSiteId("");
      setSpecies(null);
    } else {
      const selectedSite = sites[parent_area_plutof_id];
      setSiteId(parent_area_plutof_id);
      setSite(selectedSite);
      async function fetchSpecies(siteName) {
        const res = await fetch("https://raw.githubusercontent.com/iobis/edna-species-lists/master/lists/json/" + siteName + ".json");
        const data = await res.json();
        setSpecies(data);
      }
      fetchSpecies(selectedSite.simplified_name);
    }
  }
  
  function redlist_classname(category) {
    if (category === "LC") {  
      return "badge badge-lc";
    } else if (category === "NT") {
      return "badge badge-lc";
    } else if (category === "VU") {  
      return "badge badge-vu";
    } else if (category === "EN") {  
      return "badge badge-en";
    } else if (category === "CR") {  
      return "badge badge-cr";
    } else if (category === "EW") {  
      return "badge badge-ew";
    } else if (category === "EX") {  
      return "badge badge-ex";
    } else if (category === "DD") {  
      return "badge badge-dd";
    } else if (category === "NE") {  
      return "badge badge-ne";
    }
  }
  
  const databaseTooltip = <Tooltip>OBIS</Tooltip>;
  const ednaTooltip = <Tooltip>eDNA Expeditions</Tooltip>;
  const fishTooltip = <Tooltip>Fish</Tooltip>;
  const mammalTooltip = <Tooltip>Mammal</Tooltip>;
  const turtleTooltip = <Tooltip>Turtle</Tooltip>;

  return <div>
    { showFeedback && <FeedbackModal showFeedback={showFeedback} setShowFeedback={setShowFeedback} site={site} /> }
    <Container className="mt-3 mb-3">
      <Row>
        <Col lg="4" className="mt-3 mb-3">
          <h2>Species lists</h2>
          <SiteSelector sites={sites} siteId={siteId} handleSiteChange={handleSiteChange} />
        </Col>
      </Row>
      { species &&
        <Row className="mt-3">
          <Col className="mb-3">
            <h4>Fish, mammal, and turtle species in OBIS for {site.name} <span className="ms-2 badge badge-count">{species.species.length.toLocaleString("en-US")}</span></h4>
            <p>This is a list of fish, mammal, and turtle species observed at the site according to the Ocean Biodiversity Information System (OBIS). Data can be very incomplete for some sites. The eDNA Expeditions project is in the process of mobilizing biodiversity datasets from the World Heritage sites to improve completeness.</p>
            <Button variant="secondary" onClick={() => setShowFeedback(true)}>Provide feedback</Button>
            <div className="mt-3">
              { species.species.length ?
                <Table className="mt-3 table-sm text-sm">
                  <thead>
                    <tr className="nowrap">
                      <th></th>
                      <th>Phylum</th>
                      <th>Class</th>
                      <th>Order</th>
                      <th>Family</th>
                      <th>Species</th>
                      <th>Red List</th>
                      <th>Group</th>
                      <th>Last observed</th>
                    </tr>
                  </thead>
                  <tbody>
                    { species.species.map((sp) => <tr key={sp.AphiaID}>
                      <td>
                        {sp.source_obis && <OverlayTrigger placement="top" overlay={databaseTooltip}><Database /></OverlayTrigger>}
                        {sp.source_dna && <OverlayTrigger placement="top" overlay={ednaTooltip}><Droplet /></OverlayTrigger>}
                      </td>
                      <td>{sp.phylum}</td>
                      <td>{sp.class}</td>
                      <td>{sp.order}</td>
                      <td>{sp.family}</td>
                      <td>{sp.species}</td>
                      <td><span className={redlist_classname(sp.redlist_category)}>{sp.redlist_category}</span></td>
                      {/* <td>{sp.group}</td> */}
                      <td>
                        { sp.group === "fish" && <OverlayTrigger placement="top" overlay={fishTooltip}><img src="fish.svg" width="20" height="20"></img></OverlayTrigger>}
                        { sp.group === "mammal" && <OverlayTrigger placement="top" overlay={mammalTooltip}><img src="mammal.svg" width="20" height="20"></img></OverlayTrigger>}
                        { sp.group === "turtle" && <OverlayTrigger placement="top" overlay={turtleTooltip}><img src="turtle.svg" width="20" height="20"></img></OverlayTrigger>}
                      </td>
                      <td>{sp.max_year}</td>
                    </tr>) }
                  </tbody>
                </Table> : <p>No species found.</p>
              }
            </div>
          </Col>
        </Row>
      }
    </Container>
  </div>
}

export default Species;
