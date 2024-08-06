import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row, Form, Spinner } from "react-bootstrap";

function ExplainView({
  handleFacts,
  handleExplainTextChange,
  loading,
  handlePartialServiceClick,
  handleFullServiceClick,
}) {
  const instructionsRef = useRef(null);
  const [textBoxHeight, setTextBoxHeight] = useState(0);
  const placeHolderText = `Enter your appeal story here...

Step. 1: Explain* why you are objecting to the tax assessment 
and press the “Generate Facts” button when finished.

*We recommend that you use Word or a similar program to write out
your explanation for objecting, and copy/paste the explanation here.

Step. 2: AI will extract the facts from your explanation and bring you to 
a page to edit those facts and upload supporting documentation.

Step. 3: From the facts page, press the “Generate Appeal” button 
and AI will generate a complete appeal letter for you in seconds.

Step. 4: If you are satisfied with the appeal letter press
the “Download” button and you will have the only copy of your
appeal letter. You can go back and edit your appeal letter as long
as you keep the same browser tab open.`;

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
            <h4>Welcome To ZheroTax</h4>
            <p>
              The AI powered appeal generation tool to the right is DIY and
              free. Just explain your tax objection in plain language and AI
              will do the rest in extracting the facts and writing a
              professional explanation to support your tax objection.
              <br />
              <br />
              We also offer paid options, where a former Canada Revenue Agency
              auditor, appeals or rulings officer will assist you in part, or in
              whole.
              <br />
              <br />
              If you want to represent yourself at appeals and just need someone
              to interview you and write a stronger appeal letter with relevant
              legislative and court references (where applicable), choose the
              Partial Service option below.
              <br />
              <br />
              If you need more support through an audit defence or appeal,
              choose the Full Service option and create a detailed request on
              the ZheroTax Marketplace.
            </p>
            <Button
              variant="warning"
              onClick={handlePartialServiceClick}
              style={{
                backgroundColor: "#C0C0C0",
                borderColor: "#C0C0C0",
                marginTop: "10px",
                width: "calc(50% - 20px)",
                margin: "10px",
                fontSize: "1.2rem",
              }}
            >
              Partial Service
            </Button>
            <Button
              variant="warning"
              onClick={handleFullServiceClick}
              style={{
                backgroundColor: "#FFD700",
                borderColor: "#FFD700",
                marginTop: "10px",
                width: "calc(50% - 20px)",
                margin: "10px",
                fontSize: "1.2rem",
              }}
            >
              Full Service
            </Button>
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
              placeholder={placeHolderText}
            />
          </Form.Group>
          <Button variant="success" onClick={handleFacts} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Waiting for response...
              </>
            ) : (
              "Generate Facts"
            )}
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ExplainView;
