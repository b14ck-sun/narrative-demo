import { Row, Col, Form, Button, Spinner, Modal } from "react-bootstrap";

function AppealView({
  handleBack,
  apiResponse,
  handleTextChange,
  loadingDL,
  handleDownload,
  showModal,
  closeModal,
  handleDonateClick,
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
          <Modal show={showModal} onHide={closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>Consider Donating to Help Us!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Button
                variant="warning"
                onClick={handleDonateClick}
                style={{
                  backgroundColor: "#FFD700",
                  borderColor: "#FFD700",
                  marginTop: "10px",
                  width: "calc(100% - 20px)",
                  margin: "10px",
                  fontSize: "1.2rem",
                }}
              >
                Donate
              </Button>
            </Modal.Body>
          </Modal>
        </div>
      </Col>
    </Row>
  );
}

export default AppealView;
