import React from 'react'
import Layout from 'components/Layout/Layout'
import Content from 'components/CreateTask'

const Page = () => (
  <Layout id="create-task" loginRequired={false}>
    <Content />
  </Layout>
)

export default Page
export { Head } from 'components/Layout/Head'