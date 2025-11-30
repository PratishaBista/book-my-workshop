import React from 'react'
import { Link } from 'react-router-dom'

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Discover Hands-On Learning Experiences in Nepal
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Connect with local artisans, learn new skills, and unleash your creativity. 
          From traditional crafts to modern workshops, your next learning adventure starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/signup" 
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Exploring Workshops
          </Link>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition">
            Become a Provider
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero