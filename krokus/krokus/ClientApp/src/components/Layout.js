import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import './Layout.css';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
      return (
          <div className="layout-container">
        <NavMenu />
        <Container fluid className="map-container">
          {this.props.children}
        </Container>
      </div>
    );
  }
}
