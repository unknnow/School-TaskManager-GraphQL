import React from 'react'
import { useMutation } from '@apollo/react-hooks'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import User from 'store/User'

import { CREATE_USER_MUTATION, LOGIN_USER_MUTATION } from 'store/GraphqlQueries'
import { navigate } from 'gatsby'

const SignUp = () => {
  const [name, setName] = React.useState(User.get('new', 'name'))
  const [email, setEmail] = React.useState(User.get('new', 'email'))
  const [password, setPassword] = React.useState()
  const [signUp] = useMutation(CREATE_USER_MUTATION)
  const [signIn] = useMutation(LOGIN_USER_MUTATION)

  const onInputChange = (e) => {
    User.set('new', { [e.target.name]: e.target.value })
    switch (e.target.name) {
      case 'name':
        setName(e.target.value)
        break
      case 'email':
        setEmail(e.target.value)
        break
      case 'password':
        setPassword(e.target.value)
        break
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()

    signUp({ variables: { email: email, password: password, name: name, passwordDigest: "" } })
      .then((payload) => {
        signIn({ variables: { email: email, password: password } })
          .then((payload) => {
            User.set('current', payload.data.loginUser)
            navigate('/')
          })
          .catch((error) => {
            alert(error)
          })
      })
      .catch((error) => {
        alert(error)
      })
  }

  return (
    <div className="col">
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Your Name here"
            onChange={onInputChange}
            defaultValue={name}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={onInputChange}
            defaultValue={email}
          />
          <Form.Text className="text-muted">
            {"We'll never share your email with anyone else."}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            onChange={onInputChange}
            defaultValue={password}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Créer
        </Button>
      </Form>
    </div>
  )
}

export default SignUp
