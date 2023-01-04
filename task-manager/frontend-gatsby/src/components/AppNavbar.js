import React from 'react'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import findImage from 'utils/find-image'

const AppNavbar = () => {
  const navbarLogo = () => {
    return findImage('logo.svg').src
  }

  return (
    <Navbar id="main-navbar" expand="lg" bg="white" variant="light">
      <Container fluid>
        <Navbar.Brand className="cursor-pointer" href="/">
          <img src={navbarLogo()} alt="TaskManager" />
        </Navbar.Brand>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
