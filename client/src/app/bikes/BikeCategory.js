import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Card, Row, Col, Modal } from 'react-bootstrap';

const BikeCategory = () => {
  const [bikes, setBikes] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all bikes
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
    fetchBikes();
  }, []);

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setEditId(null);
    setName('');
    setImage(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (image) formData.append('image', image);

    const url = editId ? `/api/bikes/${editId}` : '/api/bikes/add';
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        body: formData,
      });
      if (res.ok) {
        handleClose();
        fetchBikes();
      }
    } catch (err) {
      console.error('Error saving bike:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bike?')) {
      try {
        const res = await fetch(`/api/bikes/${id}`, { method: 'DELETE' });
        if (res.ok) fetchBikes();
      } catch (err) {
        console.error('Error deleting bike:', err);
      }
    }
  };

  // Handle edit
  const handleEdit = (bike) => {
    setEditId(bike._id);
    setName(bike.name);
    handleShow();
  };

  return (
    <div>
      <div className="page-header">
        <h3 className="page-title"> Bikes Category </h3>
        <Button variant="primary" onClick={handleShow}>
          Add New Bike
        </Button>
      </div>

      <Row>
        <Col lg={12} className="grid-margin stretch-card">
          <Card>
            <Card.Body>
              <h4 className="card-title">Bikes List</h4>
              <div className="table-responsive">
                <Table className="table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bikes.map((bike) => (
                      <tr key={bike._id}>
                        <td>
                          <img 
                            src={bike.image} 
                            alt={bike.name} 
                            style={{ width: '50px', height: '50px', borderRadius: '5px' }} 
                          />
                        </td>
                        <td>{bike.name}</td>
                        <td>
                          <Button variant="info" size="sm" className="mr-2" onClick={() => handleEdit(bike)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(bike._id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit Form */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Bike' : 'Add New Bike'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <label>Bike Name</label>
              <Form.Control 
                type="text" 
                placeholder="Enter bike name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group>
              <label>Bike Image</label>
              <div className="custom-file">
                <Form.Control 
                  type="file" 
                  className="custom-file-input"
                  id="customFile"
                  onChange={(e) => setImage(e.target.files[0])}
                  required={!editId}
                />
                <label className="custom-file-label" htmlFor="customFile">
                  {image ? image.name : 'Choose bike image...'}
                </label>
              </div>
              {image && (
                <div className="mt-3 text-center">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt="preview" 
                    style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #9a55ff' }} 
                  />
                  <p className="text-small text-muted mt-1">Image Preview</p>
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editId ? 'Update' : 'Submit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BikeCategory;
