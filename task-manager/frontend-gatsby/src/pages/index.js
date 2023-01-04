import React from 'react'
import Layout from 'components/Layout/Layout'

const Home = () => (
  <Layout id="home" loginRequired={true}>
    <div className="col">{'Task Manager'}</div>
  </Layout>
)

export default Home
export { Head } from 'components/Layout/Head'
