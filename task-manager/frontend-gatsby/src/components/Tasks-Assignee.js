import React from 'react'

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { GET_ALL_TASKS_ASSIGNEE_TO_ONE_USER, DELETE_TASK_MUTATION, CREATE_COMMENT_MUTATION, UPDATE_TASK_STATE_MUTATION } from 'store/GraphqlQueries'
import { useQuery, useMutation } from '@apollo/react-hooks'

import { navigate } from 'gatsby'

import User from 'store/User'

function getStatusBadge(state) {
  switch(state) {
    case 'ACTIVE':
      return <Badge bg="success">{state}</Badge>
      break
    case 'PENDING':
      return <Badge bg="warning">{state}</Badge>
      break
    case 'CANCEL':
      return <Badge bg="secondary">{state}</Badge>
      break
    case 'FINISH':
      return <Badge bg="primary">{state}</Badge>
      break
  }

  return null
}

const Tasks = () => {
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION)
  const [updateTaskState] = useMutation(UPDATE_TASK_STATE_MUTATION)
  const [createComment] = useMutation(CREATE_COMMENT_MUTATION)

  const [show, setShow] = React.useState(false);
  const [modalComment, setModalComment] = React.useState(null);
  const [currentTaskId, setCurrentTaskId] = React.useState(null)
  const [currentCommentId, setCurrentCommentId] = React.useState(null)
  const [commentaire, setCommentaire] = React.useState(null)

  const [showModalState, setShowModalState] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState(null);
  const [selectedTaskStatus, setSelectedTaskStatus] = React.useState(null);
  const [newState, setnewState] = React.useState(null);

  const [listMadeUser, setListMadeUser] = React.useState(null)
  const [listAssigneeUser, setListAssigneeUser] = React.useState(null)

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseModalState = () => setShowModalState(false);
  const handleShowModalState = () => setShowModalState(true);

  var dataTasks = null
  if (User.get('current') != null) {
    console.log('--------- ALL TASK USER - ASSIGNEE ---------')
    const {data, loading, error} = useQuery(GET_ALL_TASKS_ASSIGNEE_TO_ONE_USER, {variables: {id: User.get('current').id}})
    console.log(data)

    if (data != null)
      dataTasks = data.tasks
  }

  var listTasksCards = <p>Aucune tâche disponible ...</p>;
  if (dataTasks != null && dataTasks.length > 0) {
    listTasksCards = dataTasks.map(function(task, idx){
      var listOfComments = task.Comment.map(function(comment, idx) {
        return (
          <Row className='ms-3' key={comment.id}>
            <small>
              {comment.ownerId.name} : {comment.content}
            </small>
          </Row>
        )
      }) 

      const onChangeStatusButtonClick = (e) => {
        setSelectedTaskStatus(task.state)
        setSelectedTaskId(task.id)
        handleShowModalState()
      }

      const onRespondButtonClick = (e) => {
        setCurrentTaskId(task.id)
        handleShow()
      }

      return (
        <Col key={task.id}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{task.title}</Card.Title>
              <Card.Text>
                {task.description != undefined ? task.description : "Aucune description"}
              </Card.Text>
              <Card.Text className='text-muted'>
                Status actuel : {getStatusBadge(task.state)}
              </Card.Text>

              <Row>
                <Col md={{ span: 4 }}>
                  <Card.Text className='text-muted'>
                    Assigné à : {task.Assignee[0].user.name}
                  </Card.Text>
                </Col>

                <Col md={{ span: 4, offset: 4 }}>
                  <Card.Text className='text-muted'>
                    Crée par : {task.ownerId.name}
                  </Card.Text>
                </Col>
              </Row>

              <hr/>

              <h6>Commentaires :</h6>

              {listOfComments.length > 0 ? listOfComments : "Aucun commentaire pour cette tâche"}

              <Row>
                <Col md={{ span: 4, offset: 8 }}>
                  <Button variant='primary' size='sm' className='mt-2' onClick={onRespondButtonClick}>
                    Ajouter un commentaire
                  </Button>
                </Col>
              </Row>
            </Card.Body>

            <Card.Footer>
              <Button variant="success" size="sm" onClick={onChangeStatusButtonClick}>Changer de status</Button>
            </Card.Footer>
          </Card>
        </Col>
        
        /*
        <td>{new Date('2022-12-25').toLocaleString()}</td>
        */
      )
    })
  }

  const onInputChange = (e) => {
    const value = e.target.value

    switch (e.target.name) {
      case 'commentaire':
        if (value == '') {
          setCommentaire(null)
        }

        setCommentaire(value)
        break
      case 'newState':
        if (value == '') {
          setSelectedTaskStatus(null)
        }
  
        setSelectedTaskStatus(value)
        break
    }
  }

  const onSendCommentModal = (e) => {
    createComment({ variables: {content: commentaire, ownerId: User.get('current').id, parentId: null, targetId: currentTaskId, targetType: "CREATE"} })
      .then((payload) => {
        setCommentaire(null)
        handleClose()

        navigate('/')
      })
      .catch((error) => {
        alert(error)
      })
  }

  const onSendUpdateTaskModal = (e) => {
    updateTaskState({ variables: {taskId: selectedTaskId, state: selectedTaskStatus} })
      .then((payload) => {
        setSelectedTaskId(null)
        setSelectedTaskStatus(null)
        handleCloseModalState()

        navigate('/')
      })
      .catch((error) => {
        alert(error)
      })
  }

  return (
    <div className="col">
      <h3>Mes tâches assignée</h3>

      <Row xs={1} md={2} className="g-4">
        {listTasksCards}
      </Row>

      <Form>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header>
            <Modal.Title>Envoyer une réponse</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicResponse">
              <FloatingLabel controlId="floatingLabelCommentaire" label="Commentaire">
                <Form.Control
                  as="textarea"
                  placeholder="Laissez un commentaire ici ..."
                  style={{ height: '100px' }}
                  name="commentaire"
                  onChange={onInputChange}
                  defaultValue={commentaire}
                />
              </FloatingLabel>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" onClick={onSendCommentModal}>
              Envoyer
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>

      <Form>
        <Modal show={showModalState} onHide={handleCloseModalState}>
          <Modal.Header>
            <Modal.Title>Mise à jour du status</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3" controlId="formBasicUpdateState">
            <Form.Label>Nouveau status :</Form.Label>
            <Form.Select name="newState" onChange={onInputChange}>
              <option value={null}>--- Sélectionnez un état ---</option>
              <option value="ACTIVE" className='text-success'>ACTIVE</option>
              <option value="PENDING" className='text-secondary'>PENDING</option>
              <option value="CANCEL" className='text-warning'>CANCEL</option>
              <option value="FINISH" className='text-primary'>FINISH</option>
            </Form.Select>
            <Form.Text className='text-muted'>Status actuel : {getStatusBadge(selectedTaskStatus)}</Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModalState}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" onClick={onSendUpdateTaskModal}>
              Valider
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  )
}

export default Tasks
