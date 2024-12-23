import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import BookingModal from './BookingModal';

const Halls = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedDate = searchParams.get('date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [bookedHalls, setBookedHalls] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return;

      const bookingsRef = collection(db, 'bookings');
      const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
      
      console.log('Fetching bookings for date:', formattedDate);
      
      const q = query(
        bookingsRef,
        where('date', '==', formattedDate)
      );

      try {
        const querySnapshot = await getDocs(q);
        const booked = {};
        
        console.log('Found bookings:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          const booking = doc.data();
          const hallId = booking.hall;
          
          if (!booked[hallId]) {
            booked[hallId] = {
              FN: false,
              AN: false
            };
          }

          // Check the booking slot
          if (booking.slot.includes('FD')) {
            booked[hallId].FN = true;
            booked[hallId].AN = true;
          } else if (booking.slot.includes('FN')) {
            booked[hallId].FN = true;
          } else if (booking.slot.includes('AN')) {
            booked[hallId].AN = true;
          }
        });
        
        console.log('Final booked halls:', booked);
        setBookedHalls(booked);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  const handleBookNow = (hall) => {
    const date = searchParams.get('date');
    if (date) {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      navigate(`/timeslot?hallId=${hall.id}&date=${formattedDate}`);
    } else {
      // If no date is selected, navigate back to calendar
      navigate('/calendar');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHall(null);
  };

  const halls = [
    {
      id: 'platinum',
      name: 'Platinum Hall',
      location: 'Mini Theater',
      capacity: 300,
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80"
    },
    {
      id: 'titanium',
      name: 'Titanium Hall',
      location: 'AB II – Gallery Hall',
      capacity: 250,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
    },
    {
      id: 'adithya',
      name: 'Adithya Hall',
      location: 'KSRCE – IQAC Hall',
      capacity: 200,
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80"
    },
    {
      id: 'hemavathi',
      name: 'Hemavathi Hall',
      location: 'C Block',
      capacity: 150,
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80"
    },
    {
      id: 'pearl',
      name: 'Pearl Hall',
      location: 'ECE',
      capacity: 180,
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80"
    },
    {
      id: 'sapphire',
      name: 'Sapphire Hall',
      location: 'Choest Court – A Block',
      capacity: 200,
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80"
    },
    {
      id: 'edison',
      name: 'Edison Hall',
      location: 'Main Block',
      capacity: 120,
      image: "https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?auto=format&fit=crop&q=80"
    },
    {
      id: 'mounteverest',
      name: 'Mount Everest Hall',
      location: 'Conference Hall – C Block',
      capacity: 280,
      image: "https://images.unsplash.com/photo-1498409785966-ab341407de6e?auto=format&fit=crop&q=80"
    },
    {
      id: 'diamond',
      name: 'Diamond Hall',
      location: 'MECH',
      capacity: 220,
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80"
    },
    {
      id: 'emerald',
      name: 'Emerald Hall',
      location: 'CSE',
      capacity: 160,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80"
    },
    {
      id: 'dharmavathi',
      name: 'Dharmavathi Hall',
      location: 'Seminar Hall – B Block',
      capacity: 240,
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80"
    },
    {
      id: 'chandrayan',
      name: 'Chandrayan Hall',
      location: 'Multi Utility Hall – F Block',
      capacity: 350,
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80"
    },
    {
      id: 'garnet',
      name: 'Garnet Hall',
      location: 'IT',
      capacity: 180,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80"
    },
    {
      id: 'citrine',
      name: 'Citrine Hall',
      location: 'Conference Hall',
      capacity: 150,
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80"
    },
    {
      id: 'dhenuka',
      name: 'Dhenuka Hall',
      location: 'C Block',
      capacity: 200,
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80"
    },
    {
      id: 'darbar',
      name: 'Darbar Hall',
      location: 'C Block',
      capacity: 280,
      image: "https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?auto=format&fit=crop&q=80"
    },
    {
      id: 'spinel',
      name: 'Spinel Hall',
      location: 'Mini Conference Hall',
      capacity: 100,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
    },
    {
      id: 'ruby',
      name: 'Ruby Hall',
      location: 'KSRIET – IQAC Hall',
      capacity: 180,
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80"
    },
    {
      id: 'display',
      name: 'Display Hall',
      location: 'Main Block',
      capacity: 120,
      image: "https://images.unsplash.com/photo-1498409785966-ab341407de6e?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">Available Halls</h1>
      <p className="text-gray-600 text-center mb-8">
        For {selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : 'Select a date'}
      </p>
      {!selectedDate && (
        <p className="text-center text-red-500 mb-4">
          Please select a date to view hall availability
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => {
          const isFullyBooked = bookedHalls[hall.id]?.FN && bookedHalls[hall.id]?.AN;
          
          return (
            <div key={hall.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={hall.image}
                alt={hall.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{hall.name}</h3>
                <p className="text-gray-600 mb-2">{hall.location}</p>
                <p className="text-gray-600 mb-4">Capacity: {hall.capacity} people</p>
                <button
                  onClick={() => handleBookNow(hall)}
                  className={`w-full py-2 px-4 rounded ${
                    isFullyBooked
                      ? 'bg-red-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  disabled={isFullyBooked}
                >
                  {isFullyBooked ? 'Booked' : 'Book Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedHall={selectedHall}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Halls;
