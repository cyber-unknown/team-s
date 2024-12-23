import React, { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { db } from '../../firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

const BookingModal = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  preSelectedHall,
  onSubmit
}) => {
  const [eventName, setEventName] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [designation, setDesignation] = useState('')
  const [selectedHall, setSelectedHall] = useState(preSelectedHall || '')
  const modalRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('Email', '==', user.email))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          setName(userData.Name || '')
          setEmail(userData.Email || '')
          setDepartment(userData.Department || '')
          setDesignation(userData.Designation || '')
        }
      }
    }
    fetchUserProfile()
  }, [user])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const bookingData = {
        date: selectedDate.toISOString().split('T')[0],
        department,
        designation,
        email,
        endTime: `${selectedDate.toISOString().split('T')[0]}T00:00:00`,
        eventName,
        hall: selectedHall,
        name,
        phone,
        slot: getSlotDetails(selectedTime),
        startTime: `${selectedDate.toISOString().split('T')[0]}T00:00:00`
      }

      await addDoc(collection(db, 'bookingapproval'), bookingData)
      alert(
        'Your booking request has been submitted for approval. An admin will review it shortly.'
      )
      onClose()
    } catch (error) {
      console.error('Error submitting booking request:', error)
      alert(
        'There was an error submitting your booking request. Please try again.'
      )
    }
  }

  const getSlotDetails = time => {
    switch (time) {
      case 'FD':
        return 'FD (9:00 AM - 4:00 PM)'
      case 'FN':
        return 'FN (9:00 AM - 1:00 PM)'
      case 'AN':
        return 'AN (1:00 PM - 4:00 PM)'
      default:
        return time
    }
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const timeSlotDetails = {
    FD: 'Full Day (9:00 AM - 4:00 PM)',
    FN: 'Forenoon (9:00 AM - 1:00 PM)',
    AN: 'Afternoon (1:00 PM - 4:00 PM)'
  }

  const designations = ['Faculty', 'HOD', 'Principal', 'Director', 'Student']

  const halls = [
    { id: 'platinum', name: 'Platinum Hall', location: 'Mini Theater' },
    { id: 'titanium', name: 'Titanium Hall', location: 'AB II – Gallery Hall' },
    { id: 'adithya', name: 'Adithya Hall', location: 'KSRCE – IQAC Hall' },
    { id: 'hemavathi', name: 'Hemavathi Hall', location: 'C Block' },
    { id: 'pearl', name: 'Pearl Hall', location: 'ECE' },
    {
      id: 'sapphire',
      name: 'Sapphire Hall',
      location: 'Choest Court – A Block'
    },
    { id: 'edison', name: 'Edison Hall', location: '' },
    {
      id: 'mounteverest',
      name: 'Mount Everest Hall',
      location: 'Conference Hall – C Block'
    },
    { id: 'diamond', name: 'Diamond Hall', location: 'MECH' },
    { id: 'emerald', name: 'Emerald Hall', location: 'CSE' },
    {
      id: 'dharmavathi',
      name: 'Dharmavathi Hall',
      location: 'Seminar Hall – B Block'
    },
    {
      id: 'chandrayan',
      name: 'Chandrayan Hall',
      location: 'Multi Utility Hall – F Block'
    },
    { id: 'garnet', name: 'Garnet Hall', location: 'IT' },
    { id: 'citrine', name: 'Citrine Hall', location: 'Conference Hall' },
    { id: 'dhenuka', name: 'Dhenuka Hall', location: 'C Block' },
    { id: 'darbar', name: 'Darbar Hall', location: 'C Block' },
    { id: 'spinel', name: 'Spinel Hall', location: 'Mini Conference Hall' },
    { id: 'ruby', name: 'Ruby Hall', location: 'KSRIT – IQAC Conference Hall' },
    { id: 'display', name: 'Display Hall', location: '' }
  ]

  useEffect(() => {
    setSelectedHall(preSelectedHall)
  }, [preSelectedHall])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div ref={modalRef} className='bg-white rounded-xl p-4 w-full max-w-2xl'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4 pb-2 border-b'>
          <h2 className='text-xl font-bold text-gray-900'>Book Hall</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3'
        >
          {/* Left Column */}
          <div className='space-y-4'>
            <div className='space-y-3'>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700'
                  htmlFor='name'
                >
                  Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none'
                  placeholder='Enter your name'
                />
              </div>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700'
                  htmlFor='department'
                >
                  Department <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='department'
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  required
                  className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none'
                  placeholder='Enter department'
                />
              </div>
            </div>

            <div className='space-y-3'>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700'
                  htmlFor='designation'
                >
                  Designation <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='designation'
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    required
                    className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none appearance-none bg-white'
                  >
                    <option value='' className='text-gray-400'>
                      Select Designation
                    </option>
                    {designations.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500'>
                    <svg
                      className='h-4 w-4'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700'
                  htmlFor='phone'
                >
                  Phone Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  id='phone'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none'
                  placeholder='Enter phone number'
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-4'>
            <div className='space-y-3'>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700'
                  htmlFor='eventName'
                >
                  Event Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='eventName'
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  required
                  className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none'
                  placeholder='Enter event name'
                />
              </div>
              <div>
                <label
                  className='block text-xs font-medium text-gray-700'
                  htmlFor='email'
                >
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none'
                  placeholder='Enter email address'
                />
              </div>
            </div>

            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-gray-700'>
                  Selected Hall <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700'>
                  {halls.find(h => h.id === selectedHall)?.name ||
                    'No hall selected'}
                </div>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-700'>
                  Selected Date & Time <span className='text-red-500'>*</span>
                </label>
                <div className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-700'>
                  {format(selectedDate, 'MMMM d, yyyy')} -{' '}
                  {timeSlotDetails[selectedTime] || selectedTime}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Full Width */}
          <div className='md:col-span-2 grid grid-cols-2 gap-3 pt-3 mt-2 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 bg-blue-600 hover:bg-blue-700'
            >
              Book Hall
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal
