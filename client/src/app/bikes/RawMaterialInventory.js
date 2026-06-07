import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Badge, Alert, InputGroup, Modal, ProgressBar } from 'react-bootstrap';

const RawMaterialInventory = () => {
  const [materials, setMaterials] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [bikeFilter, setBikeFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedQualityIndex, setSelectedQualityIndex] = useState('');
  const [incomingQuantity, setIncomingQuantity] = useState('');
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/raw-materials');
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  // Fetch bikes for filter
  const fetchBikes = async () => {
    try {
      const res = await fetch('/api/bikes');
      const data = await res.json();
      setBikes(data);
    } catch (err) {
      console.error('Error fetching bikes:', err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchBikes();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setSelectedMaterialId('');
    setSelectedQualityIndex('');
    setIncomingQuantity('');
    setModalMode('add');
  };
  
  const handleShow = (mode = 'add') => {
    setModalMode(mode);
    setShowModal(true);
  };

  const openQuickAction = (materialId, qualityIndex, mode) => {
    setSelectedMaterialId(materialId);
    setSelectedQualityIndex(qualityIndex);
    setModalMode(mode);
    
    if (mode === 'edit') {
      const material = materials.find(m => m._id === materialId);
      if (material) {
        setIncomingQuantity(material.qualities[qualityIndex].quantity.toString());
      }
    } else {
        setIncomingQuantity('');
    }
    
    setShowModal(true);
  };

  const selectedMaterial = materials.find(m => m._id === selectedMaterialId);

  const handleStockAction = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || selectedQualityIndex === '') return;

    const updatedQualities = [...selectedMaterial.qualities];
    const currentQty = updatedQualities[selectedQualityIndex].quantity || 0;
    
    if (modalMode === 'add') {
      updatedQualities[selectedQualityIndex].quantity = currentQty + Number(incomingQuantity);
    } else {
      updatedQualities[selectedQualityIndex].quantity = Number(incomingQuantity);
    }

    try {
      const res = await fetch(`/api/raw-materials/${selectedMaterial._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedMaterial, qualities: updatedQualities }),
      });
      
      if (res.ok) {
        handleClose();
        setMessage({ 
          type: 'success', 
          text: modalMode === 'add' ? 'Stock Added Successfully!' : 'Inventory Balance Adjusted!' 
        });
        fetchMaterials();
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const getStockVariant = (q) => {
    const threshold = q.alertThreshold || 10;
    if (q.quantity <= threshold) return "danger";
    if (q.quantity <= threshold * 2.5) return "warning";
    return "success";
  };

  // Extract unique material names for the filter dropdown
  const uniqueMaterialNames = Array.from(new Set(materials.map(m => m.name)));

  // Filter materials by bike AND material name
  const filteredMaterials = materials.filter(m => {
    const matchesBike = bikeFilter ? (m.bike && m.bike._id === bikeFilter) : true;
    const matchesMaterial = materialFilter ? (m.name === materialFilter) : true;
    return matchesBike && matchesMaterial;
  });

  const currentBikeName = bikeFilter && bikes.find(b => b._id === bikeFilter) 
    ? bikes.find(b => b._id === bikeFilter).name 
    : "";

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between">
        <h3 className="page-title"> Inventory Control </h3>
        <div className="d-flex align-items-center mt-2 mt-md-0">
          <Form.Group className="mb-0 mr-2">
            <Form.Control 
              as="select" 
              className="form-control form-control-sm"
              value={bikeFilter}
              onChange={(e) => setBikeFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">By Bike Category</option>
              {bikes.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-0 mr-3">
            <Form.Control 
              as="select" 
              className="form-control form-control-sm"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">By Material Name</option>
              {uniqueMaterialNames.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Button variant="gradient-primary" size="sm" onClick={() => handleShow('add')}>
            <i className="mdi mdi-plus mr-1"></i> Add Stock
          </Button>
        </div>
      </div>

      {message.text && (
        <Alert variant={message.type} className="mb-4" dismissible onClose={() => setMessage({type:'', text:''})}>
          {message.text}
        </Alert>
      )}

      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Live Inventory Status</h4>
              <p className="card-description"> 
                Manage stock levels {currentBikeName && ` for ${currentBikeName}`} {materialFilter && ` (${materialFilter})`}
              </p>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th> Material </th>
                      <th> Variation </th>
                      <th> Part Type </th>
                      <th className="text-center"> Health </th>
                      <th className="text-center"> Quantity </th>
                      <th className="text-center"> Status </th>
                      <th className="text-right"> Action </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((m) => 
                      m.qualities.map((q, idx) => (
                        <tr key={`${m._id}-${idx}`}>
                          <td className="font-weight-bold">
                            {idx === 0 ? m.name : ""}
                          </td>
                          <td> {q.qualityName} </td>
                          <td>
                            {idx === 0 && (
                              <Badge variant="outline-info">
                                {m.partType || 'None'}
                              </Badge>
                            )}
                          </td>
                          <td className="text-center" style={{minWidth: '150px'}}>
                            <ProgressBar 
                              variant={getStockVariant(q)} 
                              now={Math.min((q.quantity / (q.alertThreshold * 4)) * 100, 100)} 
                              style={{height: '10px'}}
                            />
                          </td>
                          <td className="text-center font-weight-bold"> {q.quantity} </td>
                          <td className="text-center"> 
                             <Badge variant={`outline-${getStockVariant(q)}`}>
                               {q.quantity <= (q.alertThreshold || 10) ? 'LOW STOCK' : 'IN STOCK'}
                             </Badge>
                          </td>
                          <td className="text-right">
                             <Button 
                                variant="outline-info" 
                                size="sm" 
                                className="mr-2"
                                onClick={() => openQuickAction(m._id, idx, 'edit')}
                             >
                                <i className="mdi mdi-pencil mr-1"></i> Edit
                             </Button>
                             <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => openQuickAction(m._id, idx, 'add')}
                             >
                                <i className="mdi mdi-plus mr-1"></i> Add
                             </Button>
                          </td>
                        </tr>
                      ))
                    )}
                    {filteredMaterials.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4"> No inventory records available. </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 font-weight-bold ml-2">
            {modalMode === 'add' ? 'Add Incoming Stock' : 'Adjust Total Balance'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStockAction}>
          <Modal.Body className="px-4">
            <Form.Group className="mb-3 mt-2">
              <label>Raw Material</label>
              <Form.Control 
                as="select" 
                className="form-control"
                value={selectedMaterialId} 
                onChange={(e) => {
                  setSelectedMaterialId(e.target.value);
                  setSelectedQualityIndex('');
                }}
                disabled={modalMode === 'edit'}
                required
              >
                <option value="">-- Choose Material --</option>
                {materials.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </Form.Control>
            </Form.Group>

            {selectedMaterial && (
              <Form.Group className="mb-3 animate__animated animate__fadeIn">
                <label>Grade / Quality</label>
                <Form.Control 
                  as="select" 
                  className="form-control"
                  value={selectedQualityIndex} 
                  onChange={(e) => setSelectedQualityIndex(e.target.value)}
                  disabled={modalMode === 'edit'}
                  required
                >
                  <option value="">-- Choose Quality --</option>
                  {selectedMaterial.qualities.map((q, index) => (
                    <option key={index} value={index}>
                      {q.qualityName} (Available: {q.quantity})
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}

            <Form.Group className="mb-4">
              <label>{modalMode === 'add' ? 'How many units arrived?' : 'What is the correct total quantity?'}</label>
              <InputGroup>
                <Form.Control 
                  type="number" 
                  className="form-control border-right-0"
                  placeholder="Enter units" 
                  value={incomingQuantity}
                  onChange={(e) => setIncomingQuantity(e.target.value)}
                  required
                  min="0"
                />
                <InputGroup.Append>
                  <InputGroup.Text className="bg-white border-left-0">Units</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
              {modalMode === 'edit' && (
                <Alert variant="warning" className="small mt-2 p-2 border-0">
                  <i className="mdi mdi-alert-circle mr-1"></i>
                  Note: This will overwrite current stock level.
                </Alert>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4 pr-4">
            <Button variant="light" className="px-4" onClick={handleClose}>Cancel</Button>
            <Button variant={modalMode === 'add' ? 'success' : 'primary'} type="submit" className="px-4" disabled={!selectedMaterial || selectedQualityIndex === ''}>
              {modalMode === 'add' ? 'Confirm Addition' : 'Confirm Adjustment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RawMaterialInventory;
