import React from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import User from 'store/User'
import { LOGIN_USER_MUTATION, GET_CURRENT_USER } from 'store/GraphqlQueries'
import { navigate } from 'gatsby'

const SignIn = () => {
  const [email, setEmail] = React.useState(User.get('new', 'email'))
  const [password, setPassword] = React.useState()
  const [signIn] = useMutation(LOGIN_USER_MUTATION)

  /*
  console.log('--------- CURRENT USER ---------');
  var {data, loading, error} = useQuery(GET_CURRENT_USER, {variables: {id: 'clcixdeg30000uf64xlkbyzmg'}})
  console.log(data);
  */

  const onInputChange = (e) => {
    const value = e.target.value

    switch (e.target.name) {
      case 'email':
        if (value == '') {
          User.set('new', { email: undefined })
        }

        setEmail(value)
        break
      case 'password':
        setPassword(value)
        break
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()

    signIn({ variables: { email: email, password: password } })
      .then((payload) => {
        console.log(payload)
        if (payload.data.loginUser != null) {
          User.set('current', payload.data.loginUser)
          navigate('/')
        } else {
          alert("Utilisateur introuvable !")
        }
      })
      .catch((error) => {
        alert(error)
      })
  }

  return (
    <div className="col">
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter email"
            onChange={onInputChange}
            name="email"
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
            placeholder="Password"
            onChange={onInputChange}
            name="password"
            defaultValue={password}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Connexion
        </Button>
      </Form>
    </div>
  )
}
export default SignIn
