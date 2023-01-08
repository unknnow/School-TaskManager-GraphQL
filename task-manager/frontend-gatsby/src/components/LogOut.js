import React from 'react'

import Button from 'react-bootstrap/Button'

import { navigate } from 'gatsby'

import User from 'store/User'

const LogOut = () => {
  const logout = () => {
    User.unset('current')

    navigate('/')
  }

  const onClick = (e) => {
    e.preventDefault()

    logout()
  }

  return (
    <div className="col text-center">
      <h1>Etes-vous sur de vouloir vous déconnecter ?</h1>
      <p className="text-muted">{"Vous allez être redirigé vers la page d'accueil"}</p>
      <Button variant="danger" href="#logout" onClick={onClick}>
        Se déconnecter
      </Button>
    </div>
  )
}
export default LogOut
