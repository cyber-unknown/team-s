import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BookingModal from './BookingModal';
import { format } from 'date-fns';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const TimeSlot = ({ onBookingRequest }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hallId = searchParams.get('hallId');  // Get from URL parameter
  const dateParam = searchParams.get('date');  // Get date from URL parameter
  const [selectedTime, setSelectedTime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('dateParam received:', dateParam);
  console.log('dateParam type:', typeof dateParam);

  // Ensure we have a valid date object
  const parsedDate = dateParam ? new Date(dateParam) : new Date();
  console.log('parsedDate:', parsedDate);

  // Fetch bookings from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsRef = collection(db, 'bookings');
        const bookingApprovalRef = collection(db, 'bookingapproval');
        
        // Get both approved bookings and pending approvals
        const [bookingsSnapshot, approvalsSnapshot] = await Promise.all([
          getDocs(query(
            bookingsRef,
            where('hall', '==', hallId),
            where('date', '==', format(parsedDate, 'yyyy-MM-dd'))
          )),
          getDocs(query(
            bookingApprovalRef,
            where('hall', '==', hallId),
            where('date', '==', format(parsedDate, 'yyyy-MM-dd'))
          ))
        ]);

        // Combine both approved and pending bookings
        const approvedBookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: 'approved'
        }));
        
        const pendingBookings = approvalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: 'pending'
        }));

        setBookings([...approvedBookings, ...pendingBookings]);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hallId) {
      fetchBookings();
    }
  }, [hallId, parsedDate]);

  // Get hall details based on hallId
  useEffect(() => {
    if (hallId) {
      const halls = [
        {
          id: 'platinum',
          name: 'Platinum Hall',
          location: 'Mini Theater',
          capacity: 300,
        },
        {
          id: 'titanium',
          name: 'Titanium Hall',
          location: 'AB II – Gallery Hall',
          capacity: 250,
        },
        {
          id: 'adithya',
          name: 'Adithya Hall',
          location: 'KSRCE – IQAC Hall',
          capacity: 200,
        },
        {
          id: 'hemavathi',
          name: 'Hemavathi Hall',
          location: 'C Block',
          capacity: 150,
        },
        {
          id: 'pearl',
          name: 'Pearl Hall',
          location: 'ECE',
          capacity: 180,
        },
        {
          id: 'sapphire',
          name: 'Sapphire Hall',
          location: 'Choest Court – A Block',
          capacity: 200,
        },
        {
          id: 'edison',
          name: 'Edison Hall',
          location: 'Main Block',
          capacity: 120,
        },
        {
          id: 'mounteverest',
          name: 'Mount Everest Hall',
          location: 'Conference Hall – C Block',
          capacity: 280,
        },
        {
          id: 'diamond',
          name: 'Diamond Hall',
          location: 'MECH',
          capacity: 220,
        },
        {
          id: 'emerald',
          name: 'Emerald Hall',
          location: 'CSE',
          capacity: 160,
        }
      ];
      const hall = halls.find(h => h.id === hallId);
      setSelectedHall(hall);
    }
  }, [hallId]);

  const timeSlots = [
    { 
      id: 'FD', 
      label: 'Full Day', 
      time: '9:00 AM - 4:00 PM', 
      duration: '7 hours',
      description: 'Full Day Session'
    },
    { 
      id: 'FN', 
      label: 'Forenoon', 
      time: '9:00 AM - 1:00 PM', 
      duration: '4 hours',
      description: 'Morning Session'
    },
    { 
      id: 'AN', 
      label: 'Afternoon', 
      time: '1:00 PM - 4:00 PM', 
      duration: '3 hours',
      description: 'Afternoon Session'
    }
  ];

  const isTimeSlotBooked = (slot) => {
    if (!bookings.length) return { isBooked: false };
    
    // If checking Full Day slot
    if (slot.id === 'FD') {
      // Check if either FN or AN is booked
      const hasConflict = bookings.some(booking => {
        const bookingSlot = booking.slot.split(' ')[0]; // Extract slot type (FN, AN, FD)
        return bookingSlot === 'FN' || bookingSlot === 'AN' || bookingSlot === 'FD';
      });
      return { 
        isBooked: hasConflict,
        isUnavailable: hasConflict,
        status: bookings.find(b => b.slot.startsWith('FD'))?.status
      };
    }
    
    // If checking FN or AN slot
    const isDirectlyBooked = bookings.some(booking => {
      const bookingSlot = booking.slot.split(' ')[0]; // Extract slot type (FN, AN, FD)
      return bookingSlot === slot.id || bookingSlot === 'FD';
    });
    
    const bookingDetails = bookings.find(b => b.slot.startsWith(slot.id));
    return { 
      isBooked: isDirectlyBooked,
      status: bookingDetails?.status
    };
  };

  const handleBookingRequest = (slot) => {
    const bookingStatus = isTimeSlotBooked(slot);
    if (bookingStatus.isBooked) {
      return;
    }
    setSelectedTime(slot.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTime(null);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      // Check again before submitting to ensure no conflicts
      const slotToBook = { id: selectedTime };
      const bookingStatus = isTimeSlotBooked(slotToBook);
      
      if (bookingStatus.isBooked) {
        alert('Sorry, this time slot is no longer available. Please select another slot.');
        handleCloseModal();
        return;
      }

      await onBookingRequest({
        ...bookingData,
        hall: hallId,
        date: format(parsedDate, 'yyyy-MM-dd'),
        slot: selectedTime
      });
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {selectedHall && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{selectedHall.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-sm sm:text-base">{selectedHall.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span className="text-sm sm:text-base">Capacity: {selectedHall.capacity} people</span>
                </div>
              </div>
            </div>
            <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mt-4 sm:mt-0 self-start sm:self-auto">
              {format(parsedDate, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Select Time Slots</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {timeSlots.map((slot) => {
            const bookingStatus = isTimeSlotBooked(slot);
            return (
              <div
                key={slot.id}
                className={`relative rounded-lg border p-3 sm:p-4 transition-all ${
                  bookingStatus.isBooked
                    ? bookingStatus.isUnavailable 
                      ? 'bg-gray-50 border-gray-200'
                      : bookingStatus.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                }`}
                onClick={() => !bookingStatus.isBooked && handleBookingRequest(slot)}
              >
                <div className="relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">{slot.label}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{slot.description}</p>
                    </div>
                    <span
                      className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full ${
                        bookingStatus.isBooked
                          ? bookingStatus.isUnavailable
                            ? 'bg-gray-100 text-gray-600'
                            : bookingStatus.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {bookingStatus.isBooked 
                        ? bookingStatus.isUnavailable 
                          ? 'Unavailable'
                          : bookingStatus.status === 'pending'
                            ? 'Pending'
                            : 'Booked'
                        : 'Available'
                      }
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Time: {slot.time}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Duration: {slot.duration}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedDate={parsedDate}
          selectedTime={selectedTime}
          preSelectedHall={hallId}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default TimeSlot;