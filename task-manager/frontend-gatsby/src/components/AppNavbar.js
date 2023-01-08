import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button';
import findImage from 'utils/find-image'
import User from 'store/User'
import { navigate } from 'gatsby'

const AppNavbar = () => {
  const navbarLogo = () => {
    return findImage('logo.svg').src
  }

  const currentUser = User.get('current')

  const onAddTaskButtonClick = (e) => {
    navigate('/create-task')
  }

  return (
    <Navbar id="main-navbar" expand="lg" variant="light">
      <Container fluid>
        <Navbar.Brand className="cursor-pointer mx-auto" href="/">
          <img src={navbarLogo()} alt="TaskManager" />
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          { currentUser &&
            <Button variant="primary" size="sm" className="me-4" onClick={onAddTaskButtonClick}>Ajouter une tâche</Button>
          }
          {currentUser && (
            <Navbar.Text>
              {'Connecté en tant que : '}
              <strong>
                <a title="LogOut" href="/logout/">
                  {currentUser.name}
                </a>
              </strong>
            </Navbar.Text>
          )}
          {!currentUser && (
            <>
              <Navbar.Text>
                <a href="/sign-in/">Se connecter</a>
              </Navbar.Text>
              <Navbar.Text className="mx-2">{'|'}</Navbar.Text>
              <Navbar.Text>
                <a href="/sign-up/">Créer un compte</a>
              </Navbar.Text>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppNavbar
