import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Badge, Card, Alert, Button } from 'react-bootstrap';

const AssembleHistory = () => {
    const [assemblies, setAssemblies] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [bikeFilter, setBikeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchAssemblies = async () => {
        try {
            const res = await fetch('/api/assembles');
            const data = await res.json();
            setAssemblies(data);
        } catch (err) {
            console.error('Error fetching assemblies:', err);
        }
    };

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
        fetchAssemblies();
        fetchBikes();
    }, []);

    const filteredAssemblies = assemblies.filter(a => {
        const matchesBike = bikeFilter ? (a.bike && a.bike._id === bikeFilter) : true;
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssemblies.map((a) => (
                                            <tr key={a._id}>
                                                <td>
                                                    {new Date(a.createdAt).toLocaleDateString()} <br/>
                                                    <small className="text-muted">{new Date(a.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                                </td>
                                                <td className="font-weight-bold"> {(a.bike && a.bike.name) || 'N/A'} </td>
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
                                            </tr>
                                        ))}
                                        {filteredAssemblies.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5">
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
        </div>
    );
};

export default AssembleHistory;
