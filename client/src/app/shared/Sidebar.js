import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import { Trans } from 'react-i18next';

class Sidebar extends Component {

  state = {};

  toggleMenuState(menuState) {
    if (this.state[menuState]) {
      this.setState({[menuState] : false});
    } else if(Object.keys(this.state).length === 0) {
      this.setState({[menuState] : true});
    } else {
      Object.keys(this.state).forEach(i => {
        this.setState({[i]: false});
      });
      this.setState({[menuState] : true});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    document.querySelector('#sidebar').classList.remove('active');
    Object.keys(this.state).forEach(i => {
      this.setState({[i]: false});
    });

    const dropdownPaths = [
      {path:'/bikes/raw', state: 'inventoryMenuOpen'},
      {path:'/bikes/assemble', state: 'productionMenuOpen'},
      {path:'/pos', state: 'salesMenuOpen'},
      {path:'/sales-history', state: 'salesMenuOpen'},
    ];

    dropdownPaths.forEach((obj => {
      if (this.isPathActive(obj.path)) {
        this.setState({[obj.state] : true})
      }
    }));
 
  }

  render () {
    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <ul className="nav">
          <li className="nav-item nav-profile">
            <a href="!#" className="nav-link" onClick={evt =>evt.preventDefault()}>
              <div className="nav-profile-image">
                <img src={ require("../../assets/images/faces/face1.jpg") } alt="profile" />
                <span className="login-status online"></span> {/* change to offline or busy as needed */}
              </div>
              <div className="nav-profile-text">
                <span className="font-weight-bold mb-2"><Trans>David Grey. H</Trans></span>
                <span className="text-secondary text-small"><Trans>Project Manager</Trans></span>
              </div>
              <i className="mdi mdi-bookmark-check text-success nav-profile-badge"></i>
            </a>
          </li>
          <li className={ this.isPathActive('/dashboard') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/dashboard">
              <span className="menu-title"><Trans>Dashboard</Trans></span>
              <i className="mdi mdi-home menu-icon"></i>
            </Link>
          </li>
          
          {/* Sales & Billing Dropdown */}
          <li className={ this.isPathActive('/pos') || this.isPathActive('/sales-history') ? 'nav-item active' : 'nav-item' }>
            <div className={ this.state.salesMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('salesMenuOpen') } data-toggle="collapse">
              <span className="menu-title"><Trans>Sales & Billing</Trans></span>
              <i className="menu-arrow"></i>
              <i className="mdi mdi-cart menu-icon"></i>
            </div>
            <Collapse in={ this.state.salesMenuOpen }>
              <ul className="nav flex-column sub-menu">
                <li className="nav-item"> 
                  <Link className={ this.isPathActive('/pos') ? 'nav-link active' : 'nav-link' } to="/pos">
                    <Trans>POS (Quick Sale)</Trans>
                  </Link>
                </li>
                <li className="nav-item"> 
                  <Link className={ this.isPathActive('/sales-history') ? 'nav-link active' : 'nav-link' } to="/sales-history">
                    <Trans>Sales Records</Trans>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          <li className={ this.isPathActive('/bikes/category') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/bikes/category">
              <span className="menu-title"><Trans>Bikes Category</Trans></span>
              <i className="mdi mdi-motorbike menu-icon"></i>
            </Link>
          </li>

          {/* Inventory Management Dropdown */}
          <li className={ this.isPathActive('/bikes/raw') ? 'nav-item active' : 'nav-item' }>
            <div className={ this.state.inventoryMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('inventoryMenuOpen') } data-toggle="collapse">
              <span className="menu-title"><Trans>Inventory Management</Trans></span>
              <i className="menu-arrow"></i>
              <i className="mdi mdi-package-variant-closed menu-icon"></i>
            </div>
            <Collapse in={ this.state.inventoryMenuOpen }>
              <ul className="nav flex-column sub-menu">
                <li className="nav-item"> 
                  <Link className={ this.isPathActive('/bikes/raw-material') ? 'nav-link active' : 'nav-link' } to="/bikes/raw-material">
                    <Trans>Materials Config</Trans>
                  </Link>
                </li>
                <li className="nav-item"> 
                  <Link className={ this.isPathActive('/bikes/raw-material-inventory') ? 'nav-link active' : 'nav-link' } to="/bikes/raw-material-inventory">
                    <Trans>Stock Control</Trans>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>

          {/* Production & Assembly Dropdown */}
          <li className={ this.isPathActive('/bikes/assemble') ? 'nav-item active' : 'nav-item' }>
            <div className={ this.state.productionMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('productionMenuOpen') } data-toggle="collapse">
              <span className="menu-title"><Trans>Production & Sales</Trans></span>
              <i className="menu-arrow"></i>
              <i className="mdi mdi-settings menu-icon"></i>
            </div>
            <Collapse in={ this.state.productionMenuOpen }>
              <ul className="nav flex-column sub-menu">
                <li className="nav-item"> 
                  <Link 
                    to="/bikes/assemble" 
                    className={this.isPathActive('/bikes/assemble') && !this.isPathActive('/bikes/assemble-history') ? 'nav-link active' : 'nav-link'}
                  >
                    <Trans>New Assembly</Trans>
                  </Link>
                </li>
                <li className="nav-item"> 
                  <Link className={ this.isPathActive('/bikes/assemble-history') ? 'nav-link active' : 'nav-link' } to="/bikes/assemble-history">
                    <Trans>Ready to Sale</Trans>
                  </Link>
                </li>
              </ul>
            </Collapse>
          </li>
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname === path || this.props.location.pathname.startsWith(path + '/');
  }

  componentDidMount() {
    this.onRouteChanged();
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {
      
      el.addEventListener('mouseover', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }

}

export default withRouter(Sidebar);