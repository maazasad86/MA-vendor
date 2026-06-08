import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Row, Col, Card, Nav, Tab, Badge, Alert } from 'react-bootstrap';

const Assemble = () => {
  const [activeTab, setActiveTab] = useState('Front');
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [assemblyName, setAssemblyName] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(1);
  
  // Selection state for assembly items
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    fetchBikes();
    fetchRawMaterials();
  }, []);

  const filterMaterials = useCallback(() => {
    let filtered = rawMaterials.filter(m => m.partType === activeTab);
    if (selectedBike) {
      filtered = filtered.filter(m => m.bike && m.bike._id === selectedBike);
    }
    setFilteredMaterials(filtered);
  }, [activeTab, selectedBike, rawMaterials]);

  useEffect(() => {
    filterMaterials();
  }, [filterMaterials]);

  const fetchBikes = async () => {
    try {
      const res = await fetch('/api/bikes');
      const data = await res.json();
      if (Array.isArray(data)) {
          setBikes(data);
      } else {
          setBikes([]);
      }
    } catch (err) {
      console.error('Error fetching bikes:', err);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const res = await fetch('/api/raw-materials');
      const data = await res.json();
      if (Array.isArray(data)) {
          setRawMaterials(data);
      } else {
          setRawMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };



  const handleItemSelect = (materialId, qualityName) => {
    setSelectedItems(prev => ({
      ...prev,
      [materialId]: qualityName
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBike) {
      setMessage({ type: 'danger', text: 'Please select a bike first!' });
      return;
    }

    const items = Object.entries(selectedItems).map(([materialId, qualityName]) => ({
      material: materialId,
      qualityName,
      usedQuantity: totalQuantity // Deduct 1 per assembly unit
    }));

    if (items.length === 0) {
        setMessage({ type: 'danger', text: 'Please select at least one material variation!' });
        return;
    }

    try {
      const res = await fetch('/api/assembles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assemblyType: activeTab,
          assemblyName,
          bike: selectedBike,
          items,
          totalQuantity
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `${activeTab} Assembly recorded successfully!` });
        setSelectedItems({});
        setAssemblyName('');
        setTotalQuantity(1);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'danger', text: `Error: ${errorData.error || 'Failed to record assembly'}` });
      }
    } catch (err) {
      console.error('Error recording assembly:', err);
      setMessage({ type: 'danger', text: 'Network error. Please check your connection.' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Bike Assembly </h3>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="!#" onClick={e => e.preventDefault()}>Bikes</a></li>
            <li className="breadcrumb-item active" aria-current="page">Assemble</li>
          </ol>
        </nav>
      </div>

      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({type:'', text:''})}>
          {message.text}
        </Alert>
      )}

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body p-0">
              <Tab.Container activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setSelectedItems({}); }}>
                <div className="card-header bg-white border-bottom-0 pb-0">
                  <Nav variant="tabs" className="bg-white border-bottom-0">
                    <Nav.Item>
                      <Nav.Link eventKey="Front" className="px-5 py-3 font-weight-bold">
                        <i className="mdi mdi-arrow-up-bold-circle-outline mr-2 text-primary"></i> FRONT
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="Rear" className="px-5 py-3 font-weight-bold">
                        <i className="mdi mdi-arrow-down-bold-circle-outline mr-2 text-info"></i> REAR
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="Brake Show" className="px-5 py-3 font-weight-bold">
                        <i className="mdi mdi-buffer mr-2 text-danger"></i> BRAKE SHOW
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
                
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4 align-items-end">
                    <Col md={4}>
                        <Form.Group className="mb-0">
                            <label className="font-weight-bold">Select Bike Model</label>
                            <Form.Control 
                                as="select" 
                                className="form-control"
                                value={selectedBike}
                                onChange={(e) => setSelectedBike(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Bike --</option>
                                {bikes.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-0">
                            <label className="font-weight-bold">Assembly Name (Reference)</label>
                            <Form.Control 
                                type="text" 
                                className="form-control"
                                placeholder="e.g. Batch #42 (Optional)"
                                value={assemblyName}
                                onChange={(e) => setAssemblyName(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group className="mb-0">
                            <label className="font-weight-bold">Units Produced</label>
                            <Form.Control 
                                type="number" 
                                className="form-control"
                                min="1"
                                value={totalQuantity}
                                onChange={(e) => setTotalQuantity(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                  </Row>

                  <h5 className="mb-3 border-bottom pb-2 font-weight-bold">
                    Materials for {activeTab} 
                    <Badge variant="pill" className="ml-2 bg-light text-dark border">{filteredMaterials.length}</Badge>
                  </h5>
                    <div className="row">
                        {filteredMaterials.map(m => {
                            const selectedQualityName = selectedItems[m._id];
                            const selectedQuality = selectedQualityName ? m.qualities.find(q => q.qualityName === selectedQualityName) : null;
                            const isLow = selectedQuality && selectedQuality.quantity <= (selectedQuality.alertThreshold || 10);

                            return (
                                <div key={m._id} className="col-md-6 grid-margin">
                                    <div className="card border shadow-none">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="mr-3">
                                                    <img 
                                                        src={m.image || "https://via.placeholder.com/60?text=Part"} 
                                                        alt={m.name} 
                                                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 font-weight-bold text-primary">{m.name}</h6>
                                                    <small className="text-muted">{(m.bike && m.bike.name) || 'General'}</small>
                                                </div>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="small font-weight-bold mb-0">Select Quality</label>
                                                {isLow && (
                                                    <Badge variant="danger" className="animate__animated animate__pulse animate__infinite">
                                                        LOW STOCK
                                                    </Badge>
                                                )}
                                            </div>
                                            <Form.Control 
                                                as="select" 
                                                className={`form-control form-control-sm ${isLow ? 'border-danger text-danger' : ''}`}
                                                value={selectedItems[m._id] || ''}
                                                onChange={(e) => handleItemSelect(m._id, e.target.value)}
                                            >
                                                <option value="">-- Not Selected --</option>
                                                {m.qualities.map((q, idx) => (
                                                    <option key={idx} value={q.qualityName} className={q.quantity <= (q.alertThreshold || 10) ? 'text-danger' : ''}>
                                                        {q.qualityName} (Stock: {q.quantity}) {q.quantity <= (q.alertThreshold || 10) ? ' - LOW' : ''}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredMaterials.length === 0 && (
                        <div className="text-center py-5 bg-light rounded mb-4">
                            <i className="mdi mdi-package-variant-closed h2 text-muted"></i>
                            <p className="mb-0 mt-2">No raw materials found for this {activeTab} category.</p>
                            <small>Configure materials in "Material Configuration" first.</small>
                        </div>
                    )}

                    <div className="text-right mt-4">
                        <Button variant="gradient-primary" type="submit" size="lg" className="px-5">
                            Record {activeTab} Assembly
                        </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Tab.Container>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assemble;
