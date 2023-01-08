import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import User from 'store/User'

export const getClient = () => {
  return new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache({
      possibleTypes: {},
    }),
    credentials: 'include',
    headers: {
      user: User.get('account', 'id') || null,
    },
  })
}

const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    name
  }
`

export const GET_ALL_USERS = gql`
  query getAllUsers {
    users {
      id
      name
      email
    }
  }
`

export const GET_ALL_TASKS_MADE_BY_ONE_USER = gql`
  query getAllTaskMadeByOneUser($id: String!) {
    tasks(where: {ownerId: {is: {id: {equals: $id}}}}) {
      id
      title
      description
      state
      ownerId {
        id
        name
      }
      Comment {
        id
        content
        ownerId {
          name
        }
      }
      Assignee {
        user {
          name
        }
      }
    }
  }
`

export const GET_ALL_TASKS_ASSIGNEE_TO_ONE_USER = gql`
  query getAllTaskAssigneeByOneUser($id: String!) {
    tasks(where: {Assignee: {every: {userId: {equals: $id}}}}) {
      id
      title
      description
      state
      ownerId {
        id
        name
      }
      Comment {
        id
        content
        ownerId {
          name
        }
      }
      Assignee {
        user {
          name
        }
      }
    }
  }
`

export const GET_CURRENT_USER = gql`
  query getCurrentUser($id: String!) {
    user(where: {id: $id}) {
      id
      email
      name
    }
  }
`

export const LOGIN_USER_MUTATION = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(where: { email: $email, password: $password }) {
      id
      name
    }
  }
`

export const CREATE_USER_MUTATION = gql`
  mutation CreateOneUser($email: String!, $password: String!, $name: String!, $passwordDigest: String!) {
    createOneUser(data: { email: $email, password: $password, name: $name, passwordDigest: $passwordDigest }) {
      id
      email
      name
    }
  }
`

export const CREATE_TASK_MUTATION = gql`
  mutation CreateOneTask($title: String!, $ownerId: String!, $state: TaskState!, $description: String, $userId: String!) {
    createOneTask(data: { title: $title, ownerId: {connect: {id: $ownerId}}, state: $state, description: $description, Assignee: {create: [{user: {connect: {id: $userId}}}]} }) {
      id
      title
      description
      state
      createdAt
    }
  }
`

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateOneComment($content: String!, $ownerId: String!, $parentId: String, $targetId: String!, $targetType: CommentTargetType!) {
    createOneComment(data: {content: $content, ownerId: {connect: {id: $ownerId}}, parentId: $parentId, targetId: {connect: {id: $targetId}}, targetType: $targetType }) {
      id
      userId
      taskId
      targetType
    }
  }
`

export const UPDATE_TASK_STATE_MUTATION = gql`
  mutation UpdateTaskState($taskId: String!, $state: TaskState!) {
    updateOneTask(data: {state: {set: $state}}, where: {id: $taskId}) {
      id
      title
      description
      state
    }
  }
`

export const DELETE_TASK_MUTATION = gql`
  mutation deleteOneTask($id: String!) {
    deleteManyAssignee(where: {taskId: {equals: $id}}) {
      count
    }
    deleteManyComment(where: {taskId: {equals: $id}}) {
      count
    }
    deleteOneTask(where: {id: $id}) {
      id
    }
  }
`