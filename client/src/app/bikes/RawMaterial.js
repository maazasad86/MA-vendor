import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Badge, Alert, Modal, Row } from 'react-bootstrap';

const RawMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [bikeFilter, setBikeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [bike, setBike] = useState('');
  const [partType, setPartType] = useState('None');
  const [image, setImage] = useState(null);
  const [qualities, setQualities] = useState([{ qualityName: '', price: '', alertThreshold: 10 }]);

  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchMaterials = async (signal) => {
    try {
      const res = await fetch('/api/raw-materials', { signal });
      const data = await res.json();
      if (Array.isArray(data)) {
          setMaterials(data);
      } else {
          setMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const fetchBikes = async (signal) => {
    try {
      const res = await fetch('/api/bikes', { signal });
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

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadData = async () => {
        try {
            await fetchMaterials(signal);
            await fetchBikes(signal);
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    };

    loadData();
    return () => controller.abort();
  }, []);

  const handleAddQuality = () => {
    setQualities([...qualities, { qualityName: '', price: '', alertThreshold: 10 }]);
  };

  const handleRemoveQuality = (index) => {
    const values = [...qualities];
    values.splice(index, 1);
    setQualities(values);
  };

  const handleQualityChange = (index, event) => {
    const values = [...qualities];
    values[index][event.target.name] = event.target.value;
    setQualities(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('bike', bike);
    formData.append('partType', partType);
    formData.append('qualities', JSON.stringify(qualities));
    if (image) {
      formData.append('image', image);
    }

    const url = isEditing ? `/api/raw-materials/${currentId}` : '/api/raw-materials/add';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        setMessage({ type: 'success', text: isEditing ? 'Updated successfully!' : 'Added successfully!' });
        fetchMaterials();
        handleClose();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error submitting raw material:', err);
    }
  };

  const handleEdit = (m) => {
    setName(m.name);
    setBike(m.bike ? m.bike._id : '');
    setPartType(m.partType || 'None');
    setQualities(m.qualities.map(q => ({
      qualityName: q.qualityName,
      price: q.price,
      alertThreshold: q.alertThreshold || 10,
      quantity: q.quantity || 0
    })));
    setCurrentId(m._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const res = await fetch(`/api/raw-materials/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setMessage({ type: 'success', text: 'Deleted successfully!' });
          fetchMaterials();
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
          const data = await res.json();
          setMessage({ type: 'danger', text: 'Delete failed: ' + (data.error || 'Server error') });
        }
      } catch (err) {
        console.error('Error deleting:', err);
        setMessage({ type: 'danger', text: 'Network error while deleting.' });
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setIsEditing(false);
    setName('');
    setBike('');
    setPartType('None');
    setImage(null);
    setQualities([{ qualityName: '', price: '', alertThreshold: 10 }]);
  };

  const filteredMaterials = bikeFilter 
    ? materials.filter(m => m.bike && m.bike._id === bikeFilter)
    : materials;

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between">
        <h3 className="page-title"> Material Configuration </h3>
        <div className="d-flex align-items-center mt-2 mt-md-0">
          <Form.Group className="mb-0 mr-3">
            <Form.Control 
              as="select" 
              className="form-control form-control-sm"
              value={bikeFilter}
              onChange={(e) => setBikeFilter(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="">Filter by Bike</option>
              {bikes.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button variant="gradient-primary" size="sm" onClick={() => setShowModal(true)}>
            <i className="mdi mdi-plus mr-1"></i> Register Material
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
              <h4 className="card-title">Configured Raw Materials</h4>
              <p className="card-description"> Setup materials, images and variations </p>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th> UI </th>
                      <th> Material Name </th>
                      <th> Bike Category </th>
                      <th> Part Type </th>
                      <th className="text-center"> Variations </th>
                      <th className="text-center"> Created </th>
                      <th className="text-right"> Actions </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((m) => (
                      <tr key={m._id}>
                        <td>
                          <img 
                            src={m.image || "https://via.placeholder.com/40?text=RM"} 
                            alt={m.name} 
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                        </td>
                        <td className="font-weight-bold"> {m.name} </td>
                        <td>
                          <Badge variant="outline-primary">
                            {m.bike ? m.bike.name : 'General'}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant="outline-info">
                            {m.partType || 'None'}
                          </Badge>
                        </td>
                        <td className="text-center"> 
                          <Badge pill variant="info">{m.qualities.length} Types</Badge>
                        </td>
                        <td className="text-center"> 
                           {new Date(m.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="text-right">
                          <Button variant="link" size="sm" className="text-info p-0 mr-3" onClick={() => handleEdit(m)}>
                            <i className="mdi mdi-pencil-box-outline h5 m-0"></i>
                          </Button>
                          <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDelete(m._id)}>
                            <i className="mdi mdi-delete-outline h5 m-0"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredMaterials.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4"> No materials configured yet. </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 font-weight-bold">{isEditing ? 'Edit Material' : 'Register Material'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 pt-3">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label>Material Name</label>
                  <Form.Control 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Iron Road"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label>Bike Category</label>
                  <Form.Control 
                    as="select" 
                    className="form-control"
                    value={bike} 
                    onChange={(e) => setBike(e.target.value)} 
                    required
                  >
                    <option value="">-- Select Bike --</option>
                    {bikes.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label>Part Type</label>
                  <Form.Control 
                    as="select" 
                    className="form-control"
                    value={partType} 
                    onChange={(e) => setPartType(e.target.value)} 
                    required
                  >
                    <option value="None">None</option>
                    <option value="Front">Front</option>
                    <option value="Rear">Rear</option>
                    <option value="Brake Show">Brake Show</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label>Material Image</label>
                  <div className="custom-file">
                    <Form.Control 
                      type="file" 
                      className="custom-file-input"
                      id="customFile"
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                      {image ? image.name : 'Choose file...'}
                    </label>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                {image && (
                  <div className="mt-2 mb-3">
                     <img 
                      src={URL.createObjectURL(image)} 
                      alt="preview" 
                      style={{ height: '60px', borderRadius: '4px' }} 
                     />
                  </div>
                )}
              </Col>
            </Row>

            <h6 className="mt-4 mb-3 font-weight-bold border-bottom pb-2">Variations & Pricing</h6>
            {qualities.map((q, index) => (
              <Row key={index} className="mb-3 align-items-end bg-light p-2 rounded mx-0 border">
                <Col md={4}>
                  <Form.Group className="mb-0">
                    <label className="small">Quality Name</label>
                    <Form.Control 
                      name="qualityName" 
                      placeholder="e.g. Type A"
                      value={q.qualityName} 
                      onChange={(e) => handleQualityChange(index, e)} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-0">
                    <label className="small">Price (PKR)</label>
                    <Form.Control 
                      name="price" 
                      type="number" 
                      value={q.price} 
                      onChange={(e) => handleQualityChange(index, e)} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-0">
                    <label className="small text-danger">Alert Limit</label>
                    <Form.Control 
                      name="alertThreshold" 
                      type="number" 
                      value={q.alertThreshold} 
                      onChange={(e) => handleQualityChange(index, e)} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="text-right">
                  {qualities.length > 1 && (
                    <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveQuality(index)}>
                      <i className="mdi mdi-delete-variant h5 m-0"></i>
                    </Button>
                  )}
                </Col>
              </Row>
            ))}
            <Button variant="link" size="sm" className="mt-2 text-decoration-none" onClick={handleAddQuality}>
              <i className="mdi mdi-plus-circle mr-1"></i> Add Variation
            </Button>
          </Modal.Body>
          <Modal.Footer className="border-0 pb-4 pr-4">
            <Button variant="light" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Update Configuration' : 'Save Configuration'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default RawMaterial;
