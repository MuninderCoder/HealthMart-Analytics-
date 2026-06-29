import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Stats from '../components/Stats'
import HowItWorks from '../components/HowItWorks'
import Dashboard from '../components/Dashboard'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <Dashboard />
      </main>
      <Footer />
    </div>
  )
}
