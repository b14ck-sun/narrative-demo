import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row, Form } from "react-bootstrap";

function ExplainView({ handleFacts, handleExplainTextChange }) {
  const instructionsRef = useRef(null);
  const [textBoxHeight, setTextBoxHeight] = useState(0);

  useEffect(() => {
    if (instructionsRef.current) {
      setTextBoxHeight(instructionsRef.current.clientHeight);
    }
  }, [instructionsRef]);

  return (
    <Container fluid className="mt-5">
      <Row>
        <Col md={4}>
          <div ref={instructionsRef} className="p-3 border bg-light">
            <h4>Instructions</h4>
            <p>
              <b>Step. 1:</b> Explain* why you are objecting to the tax
              assessment and press the “Generate Facts” button when finished.
              <br />
              <br />
              *We recommend that you use Word or a similar program to write out
              your explanation for objecting, and copy/paste the explanation
              into the box on the right.
              <br />
              <br />
              <b>Step. 2:</b> AI will extract the facts from your explanation
              and bring you to a page to edit those facts and upload supporting
              documentation.
              <br />
              <br />
              <b>Step. 3:</b> From the facts page, press the “Generate Appeal”
              button and AI will generate a complete appeal letter for you in
              seconds.
              <br />
              <br />
              <b>Step. 4:</b> If you are satisfied with the appeal letter press
              the “Download” button and you will have the only copy of your
              appeal letter. You can go back and edit your appeal letter as long
              as you keep the same browser tab open.
            </p>
          </div>
        </Col>
        <Col md={8}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              as="textarea"
              rows={10}
              style={{ height: textBoxHeight }}
              //   value={initialText}
              onChange={(event) => handleExplainTextChange(event)}
              placeholder="Copy and paste your appeal story here..."
            />
          </Form.Group>
          <Button onClick={handleFacts}>Generate Facts</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ExplainView;
