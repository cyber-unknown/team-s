import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { db, auth } from '../../firebase'
import { useAuth } from '../contexts/AuthContext'
import { FaEnvelope, FaLock } from 'react-icons/fa'

const AdminFacultyLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (user) {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('Email', '==', user.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          if (userData.Role === 'admin') {
            navigate('/admin-dashboard')
          } else if (userData.Role === 'faculty') {
            navigate('/faculty-dashboard')
          }
        }
      }
    }

    checkAuthStatus()
  }, [user, navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // First try to login with Firebase Auth
      await login(email, password)
      
      // After successful login, get the user role
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('Email', '==', email.toLowerCase()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('No account found with this email')
        setIsSubmitting(false)
        return
      }

      const userData = querySnapshot.docs[0].data()

      if (userData.Role === 'admin') {
        navigate('/admin-dashboard')
      } else if (userData.Role === 'faculty') {
        navigate('/faculty-dashboard')
      } else {
        setError('Invalid user role')
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else {
        setError('Login failed. Please try again.')
      }
    }

    setIsSubmitting(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('Email', '==', email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setShowSignUpPrompt(true)
        setError('')
        setResetMessage('')
      } else {
        await sendPasswordResetEmail(auth, email)
        setResetMessage('Password reset email sent. Please check your inbox.')
        setError('')
        setShowSignUpPrompt(false)
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Failed to process your request. Please try again.')
      setShowSignUpPrompt(false)
    }
  }

  const handleSignUpRedirect = () => {
    navigate('/signup', { state: { email } })
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-8'>
        <h1 className='text-3xl font-bold text-center text-blue-900 mb-6'>
          KSR Hallbooking Login
        </h1>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email
            </label>
            <div className='relative'>
              <FaEnvelope className='absolute top-2.5 left-3 text-blue-900' />
              <input
                id='email'
                name='email'
                type='email'
                required
                className='block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={`Enter email`}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <div className='relative'>
              <FaLock className='absolute top-2.5 left-3 text-blue-900' />
              <input
                id='password'
                name='password'
                type='password'
                required
                className='block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Enter password'
              />
            </div>
          </div>

          {error && <div className='text-red-500 text-sm'>{error}</div>}
          {resetMessage && (
            <div className='text-green-500 text-sm'>{resetMessage}</div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          {showSignUpPrompt && (
            <div className='mt-4 text-center space-y-2'>
              <p className='text-sm text-gray-600'>
                No account found with this email.
              </p>
              <button
                type='button'
                onClick={handleSignUpRedirect}
                className='text-sm font-medium text-indigo-600 hover:text-indigo-500'
              >
                Would you like to sign up?
              </button>
            </div>
          )}

          <div className='mt-4 text-center space-y-2'>
            <button
              type='button'
              onClick={handleSignUpRedirect}
              className='text-sm font-medium text-indigo-600 hover:text-indigo-500'
            >
              Don't have an account? Sign up
            </button>
            <div>
              <button
                type='button'
                onClick={handleForgotPassword}
                className='text-sm font-medium text-indigo-600 hover:text-indigo-500'
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </form>
        <footer className='mt-auto py-4 text-center text-gray-600 text-sm border-t'>
          <p>
            {' '}
            Made by{' '}
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
    </div>
  )
}

export default AdminFacultyLogin
