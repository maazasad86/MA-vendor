import React, { useState, useEffect } from 'react';
import { Form, Badge, Button, Modal, Alert } from 'react-bootstrap';

const AssembleHistory = () => {
    const [assemblies, setAssemblies] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [bikeFilter, setBikeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAssembly, setEditingAssembly] = useState(null);
    const [editName, setEditName] = useState('');
    const [editQuantity, setEditQuantity] = useState(0);

    const fetchAssemblies = async () => {
        try {
            const res = await fetch('/api/assembles');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAssemblies(data);
            } else {
                setAssemblies([]);
            }
        } catch (err) {
            console.error('Error fetching assemblies:', err);
        }
    };

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

    useEffect(() => {
        fetchAssemblies();
        fetchBikes();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assembly? Materials will be returned to stock.')) {
            try {
                const res = await fetch(`/api/assembles/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setMessage({ type: 'success', text: 'Record deleted and stock restored!' });
                    fetchAssemblies();
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

    const openEditModal = (a) => {
        setEditingAssembly(a);
        setEditName(a.assemblyName || '');
        setEditQuantity(a.totalQuantity);
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/assembles/${editingAssembly._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assemblyName: editName,
                    totalQuantity: editQuantity
                })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Assembly updated successfully!' });
                setShowEditModal(false);
                fetchAssemblies();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            console.error('Error updating:', err);
        }
    };

    const filteredAssemblies = assemblies.filter(a => {
        // Match if direct bike match OR if selected bike's category matches the assembly category
        const selectedBikeObj = bikes.find(b => b._id === bikeFilter);
        const matchesBike = bikeFilter ? (
            (a.bike && a.bike._id === bikeFilter) || 
            (a.bikeCategory && selectedBikeObj && a.bikeCategory === selectedBikeObj.category)
        ) : true;
        const matchesType = typeFilter ? a.assemblyType === typeFilter : true;
        return matchesBike && matchesType;
    });

    return (
        <div>
            <div className="page-header d-flex flex-wrap justify-content-between align-items-center">
                <h3 className="page-title text-primary font-weight-bold"> Ready to Sale (Assembly Logs) </h3>
                <div className="d-flex align-items-center mt-2 mt-md-0">
                    <Form.Group className="mb-0 mr-2">
                        <Form.Control 
                            as="select" 
                            className="form-control form-control-sm"
                            value={bikeFilter}
                            onChange={(e) => setBikeFilter(e.target.value)}
                        >
                            <option value="">All Bike Models</option>
                            {bikes.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-0">
                        <Form.Control 
                            as="select" 
                            className="form-control form-control-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Part Types</option>
                            <option value="Front">Front</option>
                            <option value="Rear">Rear</option>
                            <option value="Brake Show">Brake Show</option>
                        </Form.Control>
                    </Form.Group>
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
                            <h4 className="card-title">Completed Assemblies</h4>
                            <p className="card-description"> History of parts assembled and deducted from stock </p>
                            
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered">
                                    <thead className="bg-light">
                                        <tr>
                                            <th> Date </th>
                                            <th> Bike Model </th>
                                            <th> Assembly Type </th>
                                            <th className="text-center"> Quantity </th>
                                            <th> Parts Used </th>
                                            <th className="text-center"> Status </th>
                                            <th className="text-center"> Actions </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssemblies.map((a) => (
                                            <tr key={a._id}>
                                                <td>
                                                    {new Date(a.createdAt).toLocaleDateString()} <br/>
                                                    <small className="text-muted">{new Date(a.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                                </td>
                                                <td className="font-weight-bold"> 
                                                    {a.bikeCategory && <Badge variant="outline-dark" className="mr-1 border mb-1">Cat: {a.bikeCategory}</Badge>} <br/>
                                                    {(a.bike && a.bike.name) || 'N/A'} <br/>
                                                    {a.assemblyName && <small className="text-primary font-weight-normal">{a.assemblyName}</small>}
                                                </td>
                                                <td>
                                                    <Badge variant={
                                                        a.assemblyType === 'Front' ? 'primary' : 
                                                        a.assemblyType === 'Rear' ? 'info' : 'danger'
                                                    } className="px-3 py-2">
                                                        {a.assemblyType}
                                                    </Badge>
                                                </td>
                                                <td className="text-center font-weight-bold h5"> {a.totalQuantity} Units </td>
                                                <td>
                                                    <ul className="list-unstyled mb-0 small">
                                                        {a.items.map((item, idx) => (
                                                            <li key={idx} className="mb-1">
                                                                <span className="text-dark font-weight-bold">
                                                                    {(item.material && item.material.name) || 'Unknown Material'}:
                                                                </span> 
                                                                <span className="text-muted mr-2"> {item.qualityName}</span>
                                                                <Badge className="bg-secondary text-white">-{item.usedQuantity}</Badge>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="text-center">
                                                    <Badge pill variant="success" className="px-3">Ready to Sale</Badge>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center">
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm" 
                                                            className="mr-2 px-2 py-1"
                                                            onClick={() => openEditModal(a)}
                                                        >
                                                            <i className="mdi mdi-pencil"></i>
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="px-2 py-1"
                                                            onClick={() => handleDelete(a._id)}
                                                        >
                                                            <i className="mdi mdi-trash-can"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredAssemblies.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5">
                                                    <i className="mdi mdi-history h2 text-muted"></i>
                                                    <p className="mt-2 text-muted">No assembly records found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Edit Assembly Record</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-3">
                            <label className="font-weight-bold">Assembly Name (Reference)</label>
                            <Form.Control 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Edit batch name..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-0">
                            <label className="font-weight-bold">Total Units Produced</label>
                            <Form.Control 
                                type="number"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(parseInt(e.target.value))}
                                min="1"
                            />
                            <small className="text-info">Changing quantity will automatically adjust material stock.</small>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AssembleHistory;
