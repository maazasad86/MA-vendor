import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Badge, Alert, Table, Modal, InputGroup } from 'react-bootstrap';

const POS = () => {
    const [sourceType, setSourceType] = useState('All');
    const [bikeFilter, setBikeFilter] = useState('');
    const [partFilter, setPartFilter] = useState('');
    
    const [items, setItems] = useState([]);
    const [bikes, setBikes] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Cart State
    const [cart, setCart] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [customerName, setCustomerName] = useState('');
    const [receivedAmount, setReceivedAmount] = useState(0);

    useEffect(() => {
        fetchData();
        fetchBikes();
    }, [sourceType]);

    const fetchBikes = async () => {
        try {
            const res = await fetch('/api/bikes');
            const data = await res.json();
            if (Array.isArray(data)) setBikes(data);
        } catch (err) { console.error(err); }
    };

    const fetchData = async () => {
        try {
            const resRaw = await fetch('/api/raw-materials');
            const rawData = await resRaw.json();
            
            const resAsm = await fetch('/api/assembles');
            const asmData = await resAsm.json();

            let combined = [];

            if (Array.isArray(rawData)) {
                rawData.forEach(m => {
                    m.qualities.forEach((q, idx) => {
                        combined.push({
                            id: m._id,
                            type: 'Raw Material',
                            name: m.name,
                            quality: q.qualityName,
                            availableQuantity: q.quantity,
                            partType: m.partType,
                            bike: m.bike ? m.bike.name : 'General',
                            bikeId: m.bike ? m.bike._id : null,
                            qualityIndex: idx,
                            image: m.image,
                            price: 0 // Adding price support for future
                        });
                    });
                });
            }

            if (Array.isArray(asmData)) {
                asmData.forEach(a => {
                    combined.push({
                        id: a._id,
                        type: 'Ready to Sale',
                        name: (a.bike && a.bike.name) + ' ' + a.assemblyType,
                        quality: a.assemblyName || 'Standard',
                        availableQuantity: a.totalQuantity,
                        partType: a.assemblyType,
                        bike: a.bike ? a.bike.name : 'General',
                        bikeId: a.bike ? a.bike._id : null,
                        image: null,
                        price: 0
                    });
                });
            }
            setItems(combined);
        } catch (err) { console.error(err); }
    };

    const addToCart = (item) => {
        const existing = cart.find(i => i.id === item.id && i.type === item.type && i.quality === item.quality);
        if (existing) {
            if (existing.quantity >= item.availableQuantity) return;
            setCart(cart.map(i => (i.id === item.id && i.type === item.type && i.quality === item.quality) ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (id, type, quality) => {
        setCart(cart.filter(i => !(i.id === id && i.type === type && i.quality === quality)));
    };

    const updateCartQuantity = (id, type, quality, val) => {
        const item = items.find(i => i.id === id && i.type === type && i.quality === quality);
        if (val > item.availableQuantity) return;
        setCart(cart.map(i => (i.id === id && i.type === type && i.quality === quality) ? { ...i, quantity: parseInt(val) || 0 } : i));
    };

    const calculateTotal = () => {
        // Since price is not in current data, we can just return 0 or implement a dummy price
        return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        try {
            const saleData = {
                items: cart.map(i => ({
                    itemId: i.id,
                    itemType: i.type,
                    name: i.name,
                    qualityName: i.quality,
                    quantity: i.quantity,
                    price: i.price
                })),
                totalAmount: calculateTotal(),
                receivedAmount: receivedAmount,
                paymentMethod,
                customerName: customerName || 'Walking Customer',
                bikeId: cart.length > 0 ? cart[0].bikeId : null,
                bikeName: cart.length > 0 ? cart[0].bike : ''
            };

            const res = await fetch('/api/sales/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Sale recorded successfully!' });
                setCart([]);
                setShowCheckout(false);
                setReceivedAmount(0);
                setCustomerName('');
                fetchData();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) { console.error(err); }
    };

    const filteredItems = items.filter(i => {
        const matchesSource = sourceType === 'All' ? true : i.type === sourceType;
        const matchesBike = bikeFilter ? (i.bikeId === bikeFilter) : true;
        const matchesPart = partFilter ? (i.partType === partFilter) : true;
        return matchesSource && matchesBike && matchesPart;
    });

    return (
        <div className="pos-container">
            <div className="page-header">
                <h3 className="page-title text-primary font-weight-bold"> <i className="mdi mdi-cart-outline mr-2"></i> POS Dashboard </h3>
            </div>

            {message.text && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

            <Row>
                {/* Left Side: Product Selection */}
                <Col lg={8}>
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Body className="p-3">
                            <Row>
                                <Col md={4}>
                                    <Form.Control as="select" className="form-control-sm" value={sourceType} onChange={e => setSourceType(e.target.value)}>
                                        <option value="All">All Sources</option>
                                        <option value="Ready to Sale">Ready to Sale</option>
                                        <option value="Raw Material">Raw Material</option>
                                    </Form.Control>
                                </Col>
                                <Col md={4}>
                                    <Form.Control as="select" className="form-control-sm" value={bikeFilter} onChange={e => setBikeFilter(e.target.value)}>
                                        <option value="">All Bikes</option>
                                        {bikes.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </Form.Control>
                                </Col>
                                <Col md={4}>
                                    <Form.Control as="select" className="form-control-sm" value={partFilter} onChange={e => setPartFilter(e.target.value)}>
                                        <option value="">All Categories</option>
                                        <option value="Front">Front</option>
                                        <option value="Rear">Rear</option>
                                        <option value="Brake Show">Brake Show</option>
                                    </Form.Control>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="row">
                        {filteredItems.map((item, idx) => (
                            <Col md={6} xl={4} key={idx} className="mb-4">
                                <Card className="h-100 border-0 shadow-sm item-card" onClick={() => addToCart(item)} style={{cursor:'pointer', position:'relative'}}>
                                    {cart.find(i => i.id === item.id && i.type === item.type && i.quality === item.quality) && (
                                        <Badge variant="warning" style={{position:'absolute', top:'-5px', right:'-5px', borderRadius:'10px', padding:'5px 10px', boxShadow:'0 2px 5px rgba(0,0,0,0.2)'}}>
                                            {cart.find(i => i.id === item.id && i.type === item.type && i.quality === item.quality).quantity} in Cart
                                        </Badge>
                                    )}
                                    <Card.Body className="p-3 text-center">
                                        <Badge variant={item.type === 'Ready to Sale' ? 'success' : 'info'} className="mb-2">{item.type}</Badge>
                                        <h6 className="mb-1">{item.name}</h6>
                                        <small className="text-muted d-block mb-2">{item.quality}</small>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <Badge variant={item.availableQuantity < 5 ? 'danger' : 'light'} className="p-2">Stock: {item.availableQuantity}</Badge>
                                            <Button variant="outline-primary" size="sm" disabled={item.availableQuantity === 0}>
                                                Add <i className="mdi mdi-plus ml-1"></i>
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </div>
                </Col>

                {/* Right Side: Cart */}
                <Col lg={4}>
                    <Card className="shadow border-0 h-100" style={{minHeight: '600px'}}>
                        <Card.Header className="bg-white py-3 border-0">
                            <h5 className="mb-0 font-weight-bold"> <i className="mdi mdi-basket mr-2 text-primary"></i> Current Cart </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                <Table className="mb-0 border-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-3 border-0 py-2">Item</th>
                                            <th className="border-0 py-2">Qty</th>
                                            <th className="text-right px-3 border-0 py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-5 text-muted">Cart is empty</td></tr>
                                        ) : (
                                            cart.map((item, idx) => (
                                                <tr key={idx} className="border-bottom">
                                                    <td className="px-3 py-2">
                                                        <div className="font-weight-bold small">{item.name}</div>
                                                        <div className="text-muted extra-small">{item.quality}</div>
                                                    </td>
                                                    <td className="py-2" style={{width: '70px'}}>
                                                        <Form.Control 
                                                            type="number" 
                                                            size="sm" 
                                                            style={{height: '25px'}} 
                                                            value={item.quantity} 
                                                            onChange={e => updateCartQuantity(item.id, item.type, item.quality, e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-right px-3 py-2">
                                                        <i 
                                                            className="mdi mdi-delete text-danger" 
                                                            style={{cursor:'pointer'}} 
                                                            onClick={() => removeFromCart(item.id, item.type, item.quality)}
                                                        ></i>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-white border-0 pt-0">
                            <hr />
                            <div className="p-2">
                                <Button 
                                    variant="primary" 
                                    block 
                                    size="lg" 
                                    disabled={cart.length === 0}
                                    onClick={() => setShowCheckout(true)}
                                >
                                    Review & Checkout ({cart.length} Items)
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            {/* Checkout Modal */}
            <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Finalize Sale</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <label>Customer Name</label>
                            <Form.Control 
                                type="text" 
                                placeholder="Walking Customer" 
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                            />
                        </Form.Group>
                        <hr />
                        <h6>Items in Bill:</h6>
                        <div className="mb-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                            <Table size="sm" striped bordered>
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th className="text-center">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name} ({item.quality})</td>
                                            <td className="text-center font-weight-bold">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <label>Payment Method</label>
                                    <Form.Control as="select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online / Card</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <label>Total Units</label>
                                    <div className="h4 font-weight-bold text-primary">{cart.reduce((a, b) => a + b.quantity, 0)} Units</div>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group>
                            <label className="text-info font-weight-bold">Is this a Full Cash payment?</label>
                            <p className="text-muted small">If full payment is not received, the balance will be marked as Udhaar.</p>
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text>Cash Received</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control 
                                    type="number" 
                                    value={receivedAmount} 
                                    onChange={e => setReceivedAmount(e.target.value)}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowCheckout(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCheckout}>Complete Sale</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default POS;
