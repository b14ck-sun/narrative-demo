import { Row, Col, Form, Button, Spinner } from "react-bootstrap";

function FactsView({
  textBoxes,
  addTextBox,
  removeTextBox,
  handleInputChange,
  handleAppeal,
  handleFileUpload,
  files,
  loading,
}) {
  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(index, file);
    }
  };

  return (
    <>
      <Row className="justify-content-center mt-5">
        <Col md={8} className="text-center">
          <div className="p-3 border bg-light">
            <h4>Instructions</h4>
            <p>
              Make sure to address the following questions in the statement of
              facts and provide supporting documents, where applicable. You can
              add more facts or remove them if needed.
              <br />
              <br />
              1. Who is the taxpayer/seller/person involved?
              <br />
              2. What is the tax matter in respect of (income, property, other)?
              <br />
              3. Why do you believe the tax agency has mistakenly assessed tax?
              <br />
              4. Any additional facts you believe are relevant.
            </p>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col md={8}>
          {textBoxes.map((textBox, index) => (
            <Form.Group key={index} className="mb-3">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter Fact..."
                value={textBox}
                onChange={(event) => handleInputChange(index, event)}
                style={{ resize: "both" }}
              />
              <Button
                variant="secondary"
                className="mt-2"
                onClick={() =>
                  document.getElementById(`fileInput${index}`).click()
                }
              >
                Add Supporting Document
              </Button>
              <input
                type="file"
                accept="image/png, .jpg, .jpeg, .pdf"
                id={`fileInput${index}`}
                style={{ display: "none" }}
                onChange={(event) => handleFileChange(index, event)}
              />
              <Button
                variant="danger"
                className="mt-2 ms-2"
                onClick={() => removeTextBox(index)}
              >
                Remove Fact
              </Button>
              {files[index] &&
                Object.keys(files[index]).map((fileId) => (
                  <div key={fileId} style={{ fontSize: "small" }}>
                    {files[index][fileId].name} ({fileId})
                  </div>
                ))}
              <hr />
            </Form.Group>
          ))}
          <Button variant="primary" onClick={addTextBox} className="mb-3">
            Add New Fact
          </Button>
          <br />
          <br />
          <Button
            className="mb-5"
            variant="success"
            onClick={handleAppeal}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Waiting for response...
              </>
            ) : (
              "Generate Appeal"
            )}
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default FactsView;
