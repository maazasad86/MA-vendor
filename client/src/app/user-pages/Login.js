import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: ''
    };
  }

  handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      this.props.history.push('/dashboard');
    } else {
      this.setState({ error: 'Invalid Username or Password!' });
    }
  };

  render() {
    return (
      <div>
        <div className="d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="auth-form-light text-left py-5 px-4 px-sm-5 rounded shadow">
                <div className="brand-logo text-center mb-4">
                  <img src="C:/Users/LENOVO/.gemini/antigravity/brain/2b70e0b2-d7f8-4f92-9d4a-8136ae94b1f5/admin_login_logo_1780598168073.png" alt="Admin Logo" style={{ height: '100px', width: 'auto' }} />
                </div>
                <Form className="pt-2" onSubmit={this.handleLogin}>
                  {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
                  <Form.Group className="d-flex search-field">
                    <Form.Control 
                      type="text" 
                      placeholder="Username" 
                      size="lg" 
                      className="h-auto" 
                      value={this.state.username}
                      onChange={(e) => this.setState({ username: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="d-flex search-field">
                    <Form.Control 
                      type="password" 
                      placeholder="Password" 
                      size="lg" 
                      className="h-auto" 
                      value={this.state.password}
                      onChange={(e) => this.setState({ password: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <div className="mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    >
                      SIGN IN
                    </button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <label className="form-check-label text-muted">
                        <input type="checkbox" className="form-check-input" defaultChecked />
                        <i className="input-helper"></i>
                        Keep me signed in
                      </label>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>  
      </div>
    )
  }
}

export default withRouter(Login)
