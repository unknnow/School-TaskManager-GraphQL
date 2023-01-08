import React from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import User from 'store/User'
import Task from 'store/Task'

import { CREATE_TASK_MUTATION, GET_ALL_USERS } from 'store/GraphqlQueries'
import { navigate } from 'gatsby'

const CreateTask = () => {
  const [title, setTitle] = React.useState(Task.get('new', 'title'))
  const [description, setDescription] = React.useState(Task.get('new', 'description'))
  const [state, setState] = React.useState(Task.get('new', 'state'))
  const [userAssignee, setUserAssignee] = React.useState(Task.get('new', 'userAssignee'))

  console.log(User.get('current').id)

  const [createTask] = useMutation(CREATE_TASK_MUTATION)
  
  const {data, loading, error} = useQuery(GET_ALL_USERS)

  var listOfUsersOptions = <option value="null">Aucun utilisateur existant</option>;
  if (data != null) {
    listOfUsersOptions = data.users.map(function(user, idx) {
      return (
        <option key={user.id} value={user.id}>{user.name} - {user.email}</option>
      )
    })
  }

  const onInputChange = (e) => {
    const value = e.target.value

    switch (e.target.name) {
      case 'title':
        if (value == '') {
          Task.set('new', { title: undefined })
        }

        setTitle(value)
        break
      case 'description':
        if (value == '') {
          Task.set('new', { description: undefined })
        }

        setDescription(value)
        break
      case 'state':
        if (value == '') {
          Task.set('new', { state: undefined })
        }

        setState(value)
        break
      case 'userAssignee':
        setUserAssignee(value)
        break
    }
  }

  console.log(userAssignee)

  const onSubmit = (e) => {
    e.preventDefault()

    if (title == undefined || state == undefined || userAssignee == undefined) {
      alert("Formulaire invalide !")
      return
    }

    createTask({ variables: { title: title, ownerId: User.get('current').id, state: state, description: description, userId: userAssignee } })
      .then((payload) => {
        navigate('/')
      })
      .catch((error) => {
        alert(error)
      })
  }

  return (
    <div className="col">
      <h5>Ajouter une nouvelle tâche</h5>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="formBasicTitle">
          <Form.Label>Titre :</Form.Label>
          <Form.Control
            type="text"
            placeholder="Titre"
            onChange={onInputChange}
            name="title"
            defaultValue={title}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicDescription">
          <Form.Label>Description :</Form.Label>
          <Form.Control
            type="text"
            placeholder="Description"
            onChange={onInputChange}
            name="description"
            defaultValue={description}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicState">
          <Form.Label>Status :</Form.Label>
          <Form.Select name="state" onChange={onInputChange}>
            <option value={null}>--- Sélectionnez un état ---</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCEL">CANCEL</option>
            <option value="FINISH">FINISH</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicAssignee">
          <Form.Label>Utilisateur assignée :</Form.Label>
          <Form.Select name="userAssignee" onChange={onInputChange}>
            <option value={null}>--- Sélectionnez un utlisateur ---</option>
            {listOfUsersOptions}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          Valider
        </Button>
      </Form>
    </div>
  )
}

export default CreateTask