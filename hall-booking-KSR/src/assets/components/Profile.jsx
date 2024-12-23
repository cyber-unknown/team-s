import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { FiUser, FiMail, FiLogOut } from 'react-icons/fi'
import { MdOutlineWork, MdOutlineDomain } from 'react-icons/md'

const Profile = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data())
          } else {
            console.log('No such user document!')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-50'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-white shadow-xl rounded-2xl overflow-hidden transform transition-all hover:shadow-2xl'>
          {/* Header Section */}
          <div className='bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-6 relative overflow-hidden'>
            <div className='absolute inset-0 bg-pattern opacity-10'></div>
            <div className='relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6'>
              <div className='w-28 h-28 bg-white rounded-full p-1.5 shadow-lg transform transition-transform hover:scale-105'>
                <div className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center'>
                  <FiUser className='text-gray-400 w-16 h-16' />
                </div>
              </div>
              <div className='text-center md:text-left'>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  {userData?.Name || 'User Name'}
                </h1>
                <p className='text-lg text-blue-100 font-medium'>
                  {userData?.Role || 'Role'}
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className='px-6 py-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-gray-50 rounded-xl p-4 transform transition-all hover:shadow-md'>
                <div className='flex items-center space-x-3'>
                  <div className='bg-blue-100 p-2 rounded-lg'>
                    <MdOutlineWork className='text-blue-600 w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Faculty Code
                    </h3>
                    <p className='text-base font-semibold text-gray-800 mt-0.5'>
                      {userData?.FacultyCode || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-gray-50 rounded-xl p-4 transform transition-all hover:shadow-md'>
                <div className='flex items-center space-x-3'>
                  <div className='bg-indigo-100 p-2 rounded-lg'>
                    <MdOutlineDomain className='text-indigo-600 w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Department
                    </h3>
                    <p className='text-base font-semibold text-gray-800 mt-0.5'>
                      {userData?.Department || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-gray-50 rounded-xl p-4 transform transition-all hover:shadow-md'>
                <div className='flex items-center space-x-3'>
                  <div className='bg-purple-100 p-2 rounded-lg'>
                    <FiMail className='text-purple-600 w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </h3>
                    <p className='text-base font-semibold text-gray-800 mt-0.5'>
                      {user?.email || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className='mt-6 flex justify-center'>
              <button
                onClick={handleLogout}
                className='group relative flex items-center justify-center px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5'
              >
                <FiLogOut className='w-4 h-4 mr-2 transform transition-transform group-hover:rotate-180' />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
