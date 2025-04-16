import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Card, 
  Spinner, 
  Button, 
  ListGroup, 
  Row, 
  Col, 
  ProgressBar, 
  Badge, 
  Container 
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Results() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  
  // Get filename from location state (passed during navigation from Upload)
  const filename = location.state?.filename;
  const pdfUrl = filename ? `http://localhost:5000/uploads/${filename}` : null;

  useEffect(() => {
    if (filename) {
      fetchAnalysis();
    } else {
      setError("No document selected. Please upload a document first.");
      setLoading(false);
    }
  }, [filename]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      
      // Call the analyze_document endpoint
      const response = await fetch("http://localhost:5000/analyze_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || "Error analyzing document");
    } finally {
      setLoading(false);
    }
  };

  const getScoreVariant = (score) => {
    if (score >= 100) return "success";
    if (score >= 90) return "info";
    if (score >= 80) return "warning";
    if (score >= 70) return "secondary";
    return "danger";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Card className="text-center">
          <Card.Body>
            <Card.Title>Error</Card.Title>
            <Card.Text>{error}</Card.Text>
            <Button variant="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <Container fluid className="px-4 py-3">
      {/* Top Center Heading */}
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="display-5 fw-bold">{analysis?.heading || "Document Analysis Results"}</h1>
        </Col>
      </Row>

      {/* Main Two-Column Layout */}
      <Row className="g-4">
        {/* Left Column (PDF Viewer) */}
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Document Preview</h5>
              {pdfUrl && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => window.open(pdfUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
              )}
            </Card.Header>
            <Card.Body className="p-0" style={{ height: "calc(100vh - 200px)" }}>
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-100 h-100 border-0"
                  title="PDF Preview"
                  onError={() => setError("Failed to load PDF preview. Please try again.")}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                  <p>No PDF available for preview</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column (Details Section) */}
        <Col md={6}>
          <div className="d-flex flex-column h-100" style={{ height: "calc(100vh - 200px)" }}>
            {/* Overall Score */}
            <Row className="mb-3">
              <Col>
                <Card className="shadow-sm">
                  <Card.Body className="py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-0">Overall Evaluation</h5>
                        <p className="text-muted mb-0">Document Compliance Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <div 
                            style={{ width: "80px", height: "80px" }} 
                            className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                          >
                            <span className="fs-2 fw-bold">{analysis?.evaluation?.overall_score || "N/A"}</span>
                          </div>
                          <Badge 
                            bg={getScoreVariant(analysis?.evaluation?.overall_score)}
                            className="position-absolute bottom-0 start-50 translate-middle-x mb-1"
                          >
                            {analysis?.evaluation?.overall_rating || "No Rating"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Three scrollable sections */}
            <div className="flex-grow-1 d-flex flex-column gap-3">
              {/* Enhancements Section */}
              <Card className="shadow-sm flex-grow-1" style={{ maxHeight: "33%" }}>
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Enhancement Suggestions</h5>
                </Card.Header>
                <Card.Body className="p-2 overflow-auto">
                  {analysis?.enhancement_suggestions?.length > 0 ? (
                    <ListGroup variant="flush">
                      {analysis.enhancement_suggestions.map((suggestion, index) => (
                        <ListGroup.Item key={index} className="py-2 border-bottom">
                          <div className="d-flex">
                            <div className="me-2 text-primary">
                              <i className="bi bi-lightbulb-fill"></i>
                            </div>
                            <div>{suggestion}</div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted mb-0">No enhancement suggestions available.</p>
                  )}
                </Card.Body>
              </Card>

              {/* Summary Section */}
              <Card className="shadow-sm flex-grow-1" style={{ maxHeight: "33%" }}>
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Summary</h5>
                </Card.Header>
                <Card.Body className="overflow-auto">
                  {analysis?.summary?.length > 0 ? (
                    analysis.summary.map((point, index) => (
                      <p key={index} className={index < analysis.summary.length - 1 ? "mb-2" : "mb-0"}>
                        {point}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted mb-0">No summary available.</p>
                  )}
                </Card.Body>
              </Card>

              {/* Evaluation Results Section */}
              <Card className="shadow-sm flex-grow-1" style={{ maxHeight: "33%" }}>
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Evaluation Results</h5>
                </Card.Header>
                <Card.Body className="p-0 overflow-auto">
                  {analysis?.evaluation?.section_scores ? (
                    <ListGroup variant="flush">
                      {Object.entries(analysis.evaluation.section_scores).map(([key, data], index) => (
                        <ListGroup.Item key={index} className="py-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                              <span className="text-capitalize fw-bold">{key.replace(/_/g, ' ')}</span>
                              <Badge bg={getScoreVariant(data.score)} className="ms-2">{data.rating}</Badge>
                            </div>
                            <Badge bg={getScoreVariant(data.score)}>{data.score}</Badge>
                          </div>
                          <ProgressBar 
                            now={data.score} 
                            variant={getScoreVariant(data.score)} 
                            className="mb-1" 
                            style={{ height: "8px" }}
                          />
                          <small className="text-muted">{data.justification}</small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-muted p-3 mb-0">No evaluation results available.</p>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Results;