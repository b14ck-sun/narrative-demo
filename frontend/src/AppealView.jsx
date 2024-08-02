import { Row, Col, Form, Button, Spinner } from "react-bootstrap";

function AppealView({
  handleBack,
  apiResponse,
  handleTextChange,
  loadingDL,
  handleDownload,
}) {
  return (
    <Row className="justify-content-center mt-5" style={{ height: "90vh" }}>
      <Col md={12} className="d-flex flex-column">
        <div className="flex-grow-1">
          <Form.Group className="mb-3" style={{ height: "100%" }}>
            <Form.Control
              as="textarea"
              rows={10}
              placeholder="Enter text"
              defaultValue={apiResponse}
              onChange={(event) => handleTextChange(event)}
              style={{ resize: "both", height: "100%" }}
            />
          </Form.Group>
        </div>
        <div className="mt-3">
          <Button variant="primary" className="me-2" onClick={handleBack}>
            Edit Facts
          </Button>
          <Button
            variant="success"
            onClick={handleDownload}
            disabled={loadingDL}
          >
            {loadingDL ? (
              <>
                <Spinner animation="border" size="sm" /> Making your PDF...
              </>
            ) : (
              "Download"
            )}
          </Button>
        </div>
      </Col>
    </Row>
  );
}

export default AppealView;
