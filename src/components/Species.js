import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, OverlayTrigger, Tooltip, ToggleButton } from "react-bootstrap";
import SiteSelector from "./SiteSelector";
import { Database, Droplet } from "react-bootstrap-icons";
import FeedbackModal from "./FeedbackModal";
import { md5 } from "js-md5";

function Species({sites, siteId, site, updateSite}) {

  const [password, setPassword] = useState("");
  const [species, setSpecies] = useState(null);
  const [reviewed, setReviewed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [ednaOnly, setEdnaOnly] = useState(false);

  function downloadUrl() {
    const selectedSite = sites[siteId];
    const url = "https://obis-edna-lists.s3.amazonaws.com/lists_full/csv/" + selectedSite.simplified_name + ".csv";
    return url;
  }

  function updateSpecies(simplified_name) {
    if (simplified_name === "") {
      setSpecies(null);
    } else {
      const selectedSite = sites[simplified_name];
      async function fetchSpecies(siteName) {
        const res = await fetch("https://obis-edna-lists.s3.amazonaws.com/lists/json/" + siteName + ".json");
        const data = await res.json();
        setSpecies(data);
      }
      fetchSpecies(selectedSite.simplified_name);
    }
  }

  function handleSiteChange(event) {
    updateSite(event.target.value);
    updateSpecies(event.target.value);
  }
  
  useEffect(() => {
    updateSpecies(siteId);
  }, [siteId, sites]);

  function redlistClassname(category) {
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
  
  const databaseTooltip = function(source_obis, source_gbif) {
    let sources = [];
    if (source_obis) sources.push("OBIS");
    if (source_gbif) sources.push("GBIF");
    const value = sources.join(", ")
    return <Tooltip>{value}</Tooltip>;
  }
  const ednaTooltip = <Tooltip>eDNA Expeditions</Tooltip>;
  const fishTooltip = <Tooltip>Fish</Tooltip>;
  const mammalTooltip = <Tooltip>Mammal</Tooltip>;
  const turtleTooltip = <Tooltip>Turtle</Tooltip>;

  function statistic(number, label) {
    return <div className="statistic">
      <div className="number">{number ? number : 0}</div>
      <div className="label">{label}</div>
    </div>
  }

  function markReviewed() {
    setReviewed(true);
    setShowFeedback(true);
  }

  function provideFeedback() {
    setReviewed(false);
    setShowFeedback(true);
  }

  // if (!password || md5(password) !== "f2941bbeb90dc2144a7a96f87f99b252") {
  //   return <div>
  //     <Container className="mt-3 mb-3">
  //       <Row>
  //         <Col lg="4" className="mt-3 mb-3">
  //           <h2>Species lists</h2>
  //           <div className="mt-4">
  //             <p>Enter the provided password to access the species lists.</p>
  //             <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} />
  //           </div>
  //         </Col>
  //       </Row>
  //     </Container>
  //   </div>
  // }

  return <div>
    { showFeedback && <FeedbackModal showFeedback={showFeedback} setShowFeedback={setShowFeedback} site={site} reviewed={reviewed} /> }
    <Container className="mt-3 mb-3">
      <Row>
        <Col lg="4" className="mt-3 mb-3">
          <h2>Species lists</h2>
          <SiteSelector sites={sites} siteId={siteId} handleSiteChange={handleSiteChange} />
        </Col>
      </Row>
      { species &&
        <Row className="mt-3">
          <Col>
            <h4>Fish, mammal, and turtle species in OBIS for {site.name} <span className="ms-2 badge badge-count">{species.species.length.toLocaleString("en-US")}</span></h4>
            <p>This is a list of fish, mammal, and turtle species observed at the site according to the Ocean Biodiversity Information System (OBIS). Data can be very incomplete for some sites. The eDNA Expeditions project is in the process of mobilizing biodiversity datasets from the World Heritage sites to improve completeness.</p>
            <Button className="btn-feedback" onClick={provideFeedback}>Provide feedback</Button>
            <Button className="ms-2 btn-confirm" onClick={markReviewed}>Mark as reviewed</Button>
            <a className="ms-2" rel="noreferrer" href={downloadUrl()} target="_blank"><Button variant="light">Download list</Button></a>
          </Col>
        </Row>
      }
      { species &&
        <Row className="mt-4">
          <Col className="mb-3">{statistic(species.stats.source.edna, "From eDNA")}</Col>
          <Col className="mb-3">{statistic(species.stats.source.both, "OBIS/GBIF & eDNA")}</Col>
          <Col className="mb-3">{statistic(species.stats.groups_edna.fish, "Fish species")}</Col>
          <Col className="mb-3">{statistic(species.stats.groups_edna.mammals, "Mammal species")}</Col>
          <Col className="mb-3">{statistic(species.stats.groups_edna.turtles, "Turtle species")}</Col>
          <Col className="mb-3">{statistic(species.stats.redlist.map(x => x.edna_species ? x.edna_species : 0).reduce((a, b) => a + b, 0), "Vulnerable species")}</Col>
        </Row>
      }
      {/* { species &&
        <Row>
          <Col className="mt-1">
            <ToggleButton size="sm" variant="outline-primary" type="checkbox" role="button" id="ednaonly" label="eDNA only" checked={ednaOnly} onChange={(e) => setEdnaOnly(e.target.checked)} >eDNA only</ToggleButton>
          </Col>
        </Row>
      } */}
      { species &&
        <Row>
          <Col className="mt-3 mb-3">
            { species.species.length ?
              <Table className="table-sm text-sm">
                <thead>
                  <tr className="nowrap">
                    <th>Phylum</th>
                    <th>Class</th>
                    <th>Order</th>
                    <th>Family</th>
                    <th>Species</th>
                    <th>Red List</th>
                    <th>Group</th>
                    <th>Source</th>
                    <th>Last reported</th>
                  </tr>
                </thead>
                <tbody>
                  { species.species.filter((sp) => sp.source_dna || !ednaOnly).map((sp) => <tr key={sp.AphiaID}>
                    <td>{sp.phylum}</td>
                    <td>{sp.class}</td>
                    <td>{sp.order}</td>
                    <td>{sp.family}</td>
                    <td>{sp.species}</td>
                    <td><span className={redlistClassname(sp.redlist_category)}>{sp.redlist_category}</span></td>
                    {/* <td>{sp.group}</td> */}
                    <td>
                      { sp.group === "fish" && <OverlayTrigger placement="top" overlay={fishTooltip}><img alt="fish" src="fish.svg" width="20" height="20"></img></OverlayTrigger>}
                      { sp.group === "mammal" && <OverlayTrigger placement="top" overlay={mammalTooltip}><img alt="mammal" src="mammal.svg" width="20" height="20"></img></OverlayTrigger>}
                      { sp.group === "turtle" && <OverlayTrigger placement="top" overlay={turtleTooltip}><img alt="turtle" src="turtle.svg" width="20" height="20"></img></OverlayTrigger>}
                    </td>
                    <td className="text-nowrap">
                      {sp.source_dna && <OverlayTrigger placement="top" overlay={ednaTooltip}><Droplet /></OverlayTrigger>}
                      {(sp.source_obis || sp.source_gbif) && <OverlayTrigger placement="top" overlay={databaseTooltip(sp.source_obis, sp.source_gbif)}><Database /></OverlayTrigger>}
                    </td>
                    <td>{sp.max_year}</td>
                  </tr>) }
                </tbody>
              </Table> : <p>No species found.</p>
            }
          </Col>
        </Row>
      }
    </Container>
  </div>
}

export default Species;
