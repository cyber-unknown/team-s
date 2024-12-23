import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiUser, FiMenu, FiX } from 'react-icons/fi'
import { MdCalendarToday, MdEvent, MdDashboard } from 'react-icons/md'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('Email', '==', user.email))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          setUserRole(userData.Role)
        }
      }
    }
    fetchUserRole()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-blue-600 text-white shadow-md'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-3'>
              <button
                className='md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400'
                onClick={toggleMobileMenu}
                aria-label='Toggle menu'
              >
                {isMobileMenuOpen ? (
                  <FiX className='w-6 h-6' />
                ) : (
                  <FiMenu className='w-6 h-6' />
                )}
              </button>
              <Link to="/" className='flex items-center'>
                <span className='text-xl font-bold text-white'>
                  KSR Hall Booking
                </span>
              </Link>
            </div>

            <div className='flex items-center space-x-6'>
              <nav className='hidden md:block'>
                <ul className='flex items-center space-x-2'>
                  <li>
                    <Link
                      to='/calendar'
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname === '/calendar'
                          ? 'bg-white text-blue-600'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Calendar
                    </Link>
                  </li>
                  <li>
                    <Link
                      to='/booked-events'
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname === '/booked-events'
                          ? 'bg-white text-blue-600'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Booked Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={userRole === 'admin' ? '/admin-dashboard' : '/faculty-dashboard'}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname === (userRole === 'admin' ? '/admin-dashboard' : '/faculty-dashboard')
                          ? 'bg-white text-blue-600'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className='h-6 w-px bg-blue-400 hidden md:block'></div>
              <button
                onClick={handleProfileClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-700'
                }`}
                aria-label='Profile'
              >
                <FiUser className='w-5 h-5' />
                <span className='hidden md:block'>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-0 z-50 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div
          className={`fixed inset-x-0 top-16 bg-white shadow-lg transform transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="py-2 border-b border-gray-100">
            <div className="px-6 py-2">
              <p className="text-sm font-medium text-gray-500">MENU</p>
            </div>
          </div>
          <nav className="py-2">
            <ul className="space-y-1 px-3">
              <li>
                <Link
                  to="/calendar"
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === '/calendar'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <MdCalendarToday className="w-5 h-5 mr-3" />
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  to="/booked-events"
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === '/booked-events'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <MdEvent className="w-5 h-5 mr-3" />
                  Booked Events
                </Link>
              </li>
              <li>
                <Link
                  to={userRole === 'admin' ? '/admin-dashboard' : '/faculty-dashboard'}
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === (userRole === 'admin' ? '/admin-dashboard' : '/faculty-dashboard')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MdDashboard className="w-6 h-6 mr-3" />
                  Dashboard
                </Link>
              </li>
              <li className="mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleProfileClick}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === '/profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <FiUser className="w-5 h-5 mr-3" />
                  Profile
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <main className='container mx-auto py-8 px-4'>
        <Outlet />
      </main>
      <footer className='mt-auto py-4 text-center text-gray-600 text-sm border-t'>
        <p>
          &#169; Made by{' '}
          <a
            href='https://www.linkedin.com/in/vikash-t-designer/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:underline'
          >
            Vikash T
          </a>{' '}
          and{' '}
          <a
            href='https://www.linkedin.com/in/tharun-s-b5521228a/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:underline'
          >
            Tharun S
          </a>{' '}
          of CSE Department
        </p>
      </footer>
    </div>
  )
}

export default Layout
