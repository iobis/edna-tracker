import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";

function FeedbackModal({showFeedback, setShowFeedback, site, reviewed}) {

  const [issue, setIssue] = useState({
    email: "",
    title: reviewed ? site.name + " species list reviewed" : "",
    message: ""
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

  function handleChange(e) {
    setIssue({
      ...issue,
      [e.target.name]: e.target.value
    })
  }

  function allowSubmit() {
    const allow = !formDisabled && (issue.email !== "" && issue.title !== "" && (issue.message !== "" || reviewed));
    return allow;
  }

  function handleSubmit() {
    setFormDisabled(true);
    if (issue.email !== "" && issue.title !== "" && issue.message !== "") {
      const data = {...issue};
      data.site = site.name;
      const body = JSON.stringify(data);
      fetch("https://7yjplzueff.execute-api.us-east-1.amazonaws.com/Prod/issue", {
          method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: body
      }).then(res => {
        setShowConfirmation(true);
        setTimeout(() => {
          setShowFeedback(false);
        }, 3000);
      });
    }
  }

  return <Modal show={true}>
    <Modal.Header>
      {
        reviewed ?
        <Modal.Title>Mark as reviewed</Modal.Title>
        :
        <Modal.Title>Submit feedback</Modal.Title>
      }
    </Modal.Header>
    <Modal.Body>
      {
        reviewed ?
        <p>Mark as reviewed and optionally add a message.</p>
        :
        <p>Use this form to provide feedback on the eDNA tracker species lists. Please include sources if possible. Accompanying files can be provided by email to <a href="mailto:edna.expeditions@unesco.org">edna.expeditions@unesco.org</a>.</p>
      }

    <Form>
    <Form.Group className="mb-3">
      <Form.Group className="mb-3">
        <Form.Label>Site</Form.Label>
        <Form.Control disabled={true} type="text" value={site.name} />
      </Form.Group>
        <Form.Label>Email address</Form.Label>
        <Form.Control disabled={formDisabled} type="email" placeholder="Enter email" name="email" value={issue.email} onChange={handleChange} />
        <Form.Text className="text-muted">
          Your email address will appear in the <a href="https://github.com/iobis/edna-species-lists" rel="noreferrer" target="_blank">eDNA issue tracker</a>.
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control disabled={formDisabled || reviewed} type="text" placeholder="Enter title" name="title" value={issue.title} onChange={handleChange} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Message</Form.Label>
        <Form.Control disabled={formDisabled} as="textarea" rows={5} placeholder="Enter message" name="message" value={issue.message} onChange={handleChange} />
      </Form.Group>
    </Form>

    { showConfirmation && <div className="alert alert-success" role="alert">
        Your feedback has been submitted!
      </div>
    }

    </Modal.Body>
    <Modal.Footer>
      <Button disabled={formDisabled} className="btn-cancel" onClick={() => setShowFeedback(false)}>Cancel</Button>
      <Button disabled={!allowSubmit()} className="btn-confirm" onClick={handleSubmit}>Submit</Button>
    </Modal.Footer>
  </Modal>

}

export default FeedbackModal;