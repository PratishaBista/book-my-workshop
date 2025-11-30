import React from 'react'
import Header from '../components/landing/Header'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
    </div>
  )
}

export default LandingPage