import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import HallBookingForm from './hall-bookingform'

const BookedEventsPage = () => {
  const [bookedEvents, setBookedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHall, setSelectedHall] = useState('all')
  const [allEvents, setAllEvents] = useState([])
  const [error, setError] = useState(null)
  const [selectedEventForForm, setSelectedEventForForm] = useState(null)

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
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings')
        const q = query(bookingsRef, orderBy('startTime', 'asc'))
        const querySnapshot = await getDocs(q)

        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        const events = querySnapshot.docs
          .map(doc => {
            const data = doc.data()
            console.log('Fetched event:', data)
            const hallInfo = halls.find(h => h.id === data.hall) || {}

            let startTime, endTime
            const slotType = data.slot.split(' ')[0]

            switch (slotType) {
              case 'FD':
                startTime = '9:00 AM'
                endTime = '4:00 PM'
                break
              case 'FN':
                startTime = '9:00 AM'
                endTime = '1:00 PM'
                break
              case 'AN':
                startTime = '1:00 PM'
                endTime = '4:00 PM'
                break
              default:
                startTime = format12Hour(data.startTime)
                endTime = format12Hour(data.endTime)
            }

            return {
              id: doc.id,
              ...data,
              hallName: hallInfo.name || 'Unknown Hall',
              hallLocation: hallInfo.location || 'Location not specified',
              date:
                data.date ||
                new Date(data.startTime).toISOString().split('T')[0],
              startTime,
              endTime
            }
          })
          .filter(event => {
            const eventDate = new Date(event.date)
            return eventDate >= currentDate
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))

        console.log('Processed events:', events)
        setAllEvents(events)
        setBookedEvents(events)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const format12Hour = date => {
    try {
      if (typeof date === 'string') {
        date = new Date(date)
      }

      if (!(date instanceof Date) || isNaN(date)) {
        console.warn('Invalid date:', date)
        return 'Invalid Time'
      }

      return date
        .toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        .replace(/^0/, '') // Remove leading zero
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid Time'
    }
  }

  const getSlotFullName = slot => {
    const slotMap = {
      FD: 'Full Day',
      FN: 'Forenoon',
      AN: 'Afternoon'
    }
    return slotMap[slot.split(' ')[0]] || slot
  }

  const handleHallChange = e => {
    const hallId = e.target.value
    setSelectedHall(hallId)

    if (hallId === 'all') {
      setBookedEvents(allEvents)
    } else {
      const filteredEvents = allEvents.filter(event => event.hall === hallId)
      setBookedEvents(filteredEvents)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Booked Events
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Manage and view all upcoming hall bookings
              </p>
            </div>
            <div className='relative'>
              <select
                value={selectedHall}
                onChange={handleHallChange}
                className='w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer bg-white'
              >
                <option value='all'>All Halls</option>
                {halls.map(hall => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>
              <svg
                className='absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
            role='alert'
          >
            <strong className='font-bold'>Error: </strong>
            <span className='block sm:inline'>{error}</span>
          </div>
        )}

        {/* Events Table */}
        {loading ? (
          <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
            <p className='mt-4 text-lg text-gray-600'>Loading events...</p>
          </div>
        ) : bookedEvents.length === 0 ? (
          <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            <h3 className='mt-4 text-lg font-medium text-gray-900'>
              No events found
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {selectedHall !== 'all'
                ? `No events booked for ${
                    halls.find(hall => hall.id === selectedHall)?.name
                  }`
                : 'No upcoming events scheduled'}
            </p>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Date & Time
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Hall Details
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Event Details
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Organizer Details
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {bookedEvents.map(event => (
                    <tr
                      key={event.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {formatDate(event.date)}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {event.startTime} - {event.endTime}
                        </div>
                        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                          {getSlotFullName(event.slot)}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {event.hallName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {event.hallLocation}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {event.eventName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {event.department}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {event.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {event.designation}
                        </div>
                        <div className='text-sm text-gray-500'>
                          <div>{event.phone}</div>
                          <div>{event.email}</div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => setSelectedEventForForm(event)}
                          className='text-indigo-600 hover:text-indigo-900'
                        >
                          Download Form
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {selectedEventForForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg max-h-[90vh] overflow-y-auto'>
            <div className='p-4 border-b border-gray-200 flex justify-between items-center'>
              <h2 className='text-xl font-bold'>Hall Booking Form</h2>
              <button
                onClick={() => setSelectedEventForForm(null)}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>
            <HallBookingForm selectedEvent={selectedEventForForm} />
          </div>
        </div>
      )}
    </div>
  )
}

export default BookedEventsPage
