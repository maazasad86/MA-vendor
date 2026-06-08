import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Badge, Button, Alert } from 'react-bootstrap';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [bikeFilter, setBikeFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        fetchSales();
        fetchBikes();
    }, []);

    const fetchBikes = async () => {
        try {
            const res = await fetch('/api/bikes');
            const data = await res.json();
            if (Array.isArray(data)) setBikes(data);
        } catch (err) { console.error(err); }
    };

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/sales');
            const data = await res.json();
            if (Array.isArray(data)) setSales(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(s => {
        const saleDate = new Date(s.saleDate);
        
        const matchesBike = bikeFilter ? s.bikeId === bikeFilter : true;
        const matchesPayment = paymentFilter ? (
            paymentFilter === 'Udhaar' ? s.dueAmount > 0 : s.paymentMethod === paymentFilter
        ) : true;
        
        const matchesDate = dateFilter ? saleDate.toISOString().split('T')[0] === dateFilter : true;
        const matchesMonth = monthFilter ? (saleDate.getMonth() + 1).toString() === monthFilter : true;
        const matchesYear = yearFilter ? saleDate.getFullYear().toString() === yearFilter : true;

        return matchesBike && matchesPayment && matchesDate && matchesMonth && matchesYear;
    });

    const totalSales = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalReceived = filteredSales.reduce((acc, s) => acc + (s.receivedAmount || 0), 0);
    const totalDue = filteredSales.reduce((acc, s) => acc + (s.dueAmount || 0), 0);

    return (
        <div>
            <div className="page-header">
                <h3 className="page-title text-primary font-weight-bold"> <i className="mdi mdi-history mr-2"></i> Sales History & Reports </h3>
            </div>

            <Row className="mb-4">
                <Col md={3}>
                    <Card className="bg-gradient-primary text-white border-0 shadow">
                        <Card.Body className="p-3">
                            <h6 className="small">Total Filtered Sales</h6>
                            <h4 className="mb-0">Rs. {totalSales.toLocaleString()}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-gradient-success text-white border-0 shadow">
                        <Card.Body className="p-3">
                            <h6 className="small">Cash/Online Received</h6>
                            <h4 className="mb-0">Rs. {totalReceived.toLocaleString()}</h4>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="bg-gradient-danger text-white border-0 shadow">
                        <Card.Body className="p-3">
                            <h6 className="small">Total Udhaar (Due)</h6>
                            <h4 className="mb-0">Rs. {totalDue.toLocaleString()}</h4>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-3">
                    <Row>
                        <Col md={2}>
                            <Form.Group className="mb-0">
                                <label className="extra-small font-weight-bold">Bike</label>
                                <Form.Control as="select" className="form-control-sm" value={bikeFilter} onChange={e => setBikeFilter(e.target.value)}>
                                    <option value="">All Bikes</option>
                                    {bikes.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-0">
                                <label className="extra-small font-weight-bold">Payment Status</label>
                                <Form.Control as="select" className="form-control-sm" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                                    <option value="">All Types</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="Udhaar">Udhaar (Due)</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-0">
                                <label className="extra-small font-weight-bold">Specific Date</label>
                                <Form.Control type="date" className="form-control-sm" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-0">
                                <label className="extra-small font-weight-bold">Month</label>
                                <Form.Control as="select" className="form-control-sm" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                                    <option value="">All Months</option>
                                    <option value="1">January</option><option value="2">February</option>
                                    <option value="3">March</option><option value="4">April</option>
                                    <option value="5">May</option><option value="6">June</option>
                                    <option value="7">July</option><option value="8">August</option>
                                    <option value="9">September</option><option value="10">October</option>
                                    <option value="11">November</option><option value="12">December</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group className="mb-0">
                                <label className="extra-small font-weight-bold">Year</label>
                                <Form.Control as="select" className="form-control-sm" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                            <Button variant="light" size="sm" onClick={() => {
                                setBikeFilter(''); setPaymentFilter(''); setDateFilter(''); setMonthFilter('');
                            }} block>Clear Filters</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="table-responsive">
                        <Table className="table-hover table-striped">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items Sold</th>
                                    <th>Method</th>
                                    <th className="text-right">Total Amount</th>
                                    <th className="text-right">Received</th>
                                    <th className="text-right text-danger">Balance (Udhaar)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan="7" className="text-center">Loading...</td></tr> : 
                                 filteredSales.length === 0 ? <tr><td colSpan="7" className="text-center">No sales found</td></tr> :
                                 filteredSales.map((sale, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="font-weight-bold">{sale.customerName}</div>
                                            <small className="text-muted">{sale.bikeName}</small>
                                        </td>
                                        <td>
                                            {sale.items.map((item, i) => (
                                                <div key={i} className="small">
                                                    - {item.name} ({item.qualityName}) x{item.quantity}
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            <Badge variant={sale.paymentMethod === 'Online' ? 'info' : 'secondary'}>
                                                {sale.paymentMethod}
                                            </Badge>
                                        </td>
                                        <td className="text-right font-weight-bold">Rs. {sale.totalAmount.toLocaleString()}</td>
                                        <td className="text-right text-success">Rs. {sale.receivedAmount.toLocaleString()}</td>
                                        <td className="text-right text-danger font-weight-bold">
                                            {sale.dueAmount > 0 ? `Rs. ${sale.dueAmount.toLocaleString()}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SalesHistory;
