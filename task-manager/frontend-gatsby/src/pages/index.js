import React from 'react'
import Layout from 'components/Layout/Layout'
import Content from 'components/Tasks'
import Content2 from 'components/Tasks-Assignee'

const Home = () => (
  <Layout id="home" loginRequired={true}>
    <Content />
    <hr className="my-4" />
    <Content2 />
  </Layout>
)

export default Home
export { Head } from 'components/Layout/Head'
