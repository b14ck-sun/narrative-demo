import { Row, Col, Form, Button, Spinner } from "react-bootstrap";

function NextView({
  handleBack,
  apiResponse,
  handleTextChange,
  loadingDL,
  handleDownload,
}) {
  return (
    <Row className="justify-content-center mt-5">
      <Col md={8}>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={10}
            placeholder="Enter text"
            defaultValue={apiResponse}
            onChange={(event) => handleTextChange(event)}
            style={{ resize: "both" }}
          />
        </Form.Group>
        <Button variant="primary" className="me-2" onClick={handleBack}>
          Back
        </Button>
        <Button variant="success" onClick={handleDownload} disabled={loadingDL}>
          {loadingDL ? (
            <>
              <Spinner animation="border" size="sm" /> Making your PDF...
            </>
          ) : (
            "Download"
          )}
        </Button>
      </Col>
    </Row>
  );
}

export default NextView;
