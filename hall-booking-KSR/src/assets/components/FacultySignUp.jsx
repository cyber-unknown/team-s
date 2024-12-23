import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { addDoc, collection } from 'firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

const FacultySignUp = () => {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [facultyCode, setFacultyCode] = useState('')
  const [department, setDepartment] = useState('')
  const [designation, setDesignation] = useState('Designation')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsSubmitting(false)
      return
    }

    try {
      const docRef = await addDoc(collection(db, 'facultysignup'), {
        Email: email,
        Name: name,
        FacultyCode: facultyCode,
        Department: department,
        Designation: designation,
        Password: password
      })

      alert(
        'Your sign-up request has been submitted successfully. Please wait for admin approval.'
      )
      navigate('/login')
    } catch (error) {
      console.error('Error submitting sign-up request:', error)
      setError('Error submitting sign-up request: ' + error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-6'>
        {/* Title Inside the Box */}
        <h1 className='text-2xl font-bold text-center text-blue-900 mb-1'>
          KSR Hallbooking
        </h1>
        <p className='text-center text-gray-600 mb-6 text-sm'>
          Faculty Registration
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-4'>
            <div className='space-y-1'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'
              >
                Full Name
              </label>
              <input
                id='name'
                type='text'
                required
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Enter your full name'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <label
                  htmlFor='facultyCode'
                  className='block text-sm font-medium text-gray-700'
                >
                  Faculty Code
                </label>
                <input
                  id='facultyCode'
                  type='text'
                  required
                  className='block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={facultyCode}
                  onChange={e => setFacultyCode(e.target.value)}
                  placeholder='Enter code'
                />
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='designation'
                  className='block text-sm font-medium text-gray-700'
                >
                  Designation
                </label>
                <select
                  id='designation'
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  required
                  className='block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm appearance-none'
                >
                  <option value='Designation' disabled>
                    Select Role
                  </option>
                  <option value='Professor'>Professor</option>
                  <option value='Head of Department'>
                    Head of Department
                  </option>
                  <option value='Director'>Director</option>
                </select>
              </div>
            </div>

            <div className='space-y-1'>
              <label
                htmlFor='department'
                className='block text-sm font-medium text-gray-700'
              >
                Department
              </label>
              <input
                id='department'
                type='text'
                required
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder='Enter your department'
              />
            </div>

            <div className='space-y-1'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email Address
              </label>
              <input
                id='email'
                type='email'
                required
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Enter your email'
              />
            </div>

            <div className='space-y-1'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                required
                minLength={8}
                className='block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Create a password (min. 8 characters)'
              />
              <p className="mt-1 text-sm text-gray-500">Password must be at least 8 characters long</p>
            </div>
          </div>

          {error && (
            <div className='text-red-500 text-sm text-center'>{error}</div>
          )}

          <div className='space-y-3 pt-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type='button'
              onClick={() => navigate('/login')}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Back to Login
            </button>
          </div>
        </form>

        <footer className='mt-6 pt-4 text-center text-gray-600 text-sm border-t'>
          <p>
            &copy; Made by{' '}
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

export default FacultySignUp
