import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, subDays, getDay } from 'date-fns';
import { db } from '../../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import BookingModal from './BookingModal';
import TimeSlot from './Timeslot';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Calendar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedHallId = searchParams.get('hallId');
  const selectedDateParam = searchParams.get('date');
  const selectedView = searchParams.get('view');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedView) {
      setView(selectedView);
    }
    if (selectedDateParam) {
      try {
        const parsedDate = new Date(selectedDateParam);
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid date parameter:', selectedDateParam);
          setCurrentDate(new Date());
        } else {
          setCurrentDate(parsedDate);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        setCurrentDate(new Date());
      }
    }
  }, [selectedView, selectedDateParam]);

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = [];
      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() });
      });
      setBookings(bookingsData);
    }, (error) => {
      console.error('Error fetching bookings:', error);
    });

    return () => unsubscribe();
  }, []);

  const isSlotBooked = (time) => {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const timeSlotMap = {
      'FD (9:00 AM - 4:00 PM)': 'Full Day',
      'FN (9:00 AM - 1:00 PM)': 'Forenoon',
      'AN (1:00 PM - 4:00 PM)': 'Afternoon'
    };
    
    const slotToCheck = timeSlotMap[time];
    
    return bookings.some(booking => 
      booking.hall === selectedHallId && 
      format(new Date(booking.startTime), 'yyyy-MM-dd') === currentDateStr && 
      booking.slot === slotToCheck
    );
  };

  const goToToday = () => setCurrentDate(new Date());
  const handlePrevious = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (view === 'month') {
      const prevMonth = subMonths(currentDate, 1);
      if (prevMonth >= startOfMonth(today)) {
        setCurrentDate(prevMonth);
      }
    } else {
      const prevDay = subDays(currentDate, 1);
      if (prevDay >= today) {
        setCurrentDate(prevDay);
      }
    }
  };
  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleDateClick = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    navigate(`/halls?date=${formattedDate}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = subDays(monthStart, getDay(monthStart));
    const endDate = addDays(monthEnd, 6 - getDay(monthEnd));
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks = [];
    for (let i = 0; i < dateRange.length; i += 7) {
      weeks.push(dateRange.slice(i, i + 7));
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={`text-center font-bold ${isMobile ? 'text-xs p-1 text-gray-600' : 'p-2'}`}>
            {isMobile ? day.substring(0, 3) : day}
          </div>
        ))}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map(date => (
              <button
                key={date.toString()}
                className={`
                  ${isMobile 
                    ? `relative h-14 w-full rounded-lg flex flex-col items-center justify-center transition-all duration-200
                      ${isSameMonth(date, currentDate)
                        ? isSameDay(date, new Date())
                          ? 'bg-blue-500 text-white shadow-sm'
                          : isPastDate(date)
                            ? 'bg-gray-50 text-gray-400'
                            : 'bg-white hover:bg-blue-50 hover:text-blue-600'
                        : 'bg-gray-50 text-gray-400'
                      }
                      ${isSameDay(date, currentDate) 
                        ? 'ring-2 ring-blue-400 ring-offset-2' 
                        : !isPastDate(date) && isSameMonth(date, currentDate)
                          ? 'border border-gray-100' 
                          : ''
                      }
                      ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}
                      `
                    : `h-24 p-2 border rounded-lg flex flex-col items-start justify-start transition-colors ${
                        isSameMonth(date, currentDate)
                          ? isSameDay(date, new Date())
                            ? 'bg-blue-500 text-white'
                            : isPastDate(date)
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-100'
                          : 'bg-gray-100 text-gray-400'
                      }`
                  }
                `}
                onClick={() => {
                  if (!isPastDate(date)) {
                    setCurrentDate(date);
                    handleDateClick(date);
                  }
                }}
                disabled={isPastDate(date)}
              >
                <span className={`
                  ${isMobile 
                    ? `text-sm font-medium ${isSameDay(date, currentDate) ? 'font-bold' : ''}`
                    : 'text-sm font-semibold'
                  }
                `}>
                  {format(date, 'd')}
                </span>
                {isMobile && isSameDay(date, new Date()) && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-200"></div>
                )}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <TimeSlot
        onBookingRequest={(time) => {
          setSelectedSlot({ date: currentDate, time });
          setIsModalOpen(true);
        }}
      />
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${isMobile ? 'p-4 bg-white rounded-lg shadow' : ''}`}>
        {isMobile && (
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button 
                onClick={goToToday}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Today
              </button>
            </div>
            <div className="flex justify-between items-center">
              <button 
                onClick={handlePrevious}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isPastDate(subMonths(currentDate, 1))}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={handleNext}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="p-4 bg-gray-50 border-b">
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'} mb-4`}>
              <h2 className="text-2xl font-bold">
                {view === 'month' 
                  ? format(currentDate, 'MMMM yyyy')
                  : format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <div>
                <button 
                  onClick={() => setView('month')} 
                  className={`px-4 py-2 rounded-lg mr-2 ${
                    view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setView('day')} 
                  className={`px-4 py-2 rounded-lg ${
                    view === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="p-4">
          {view === 'month' ? renderMonthView() : renderDayView()}
        </div>
      </div>
      {isModalOpen && selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedSlot.date}
          selectedTime={selectedSlot.time}
        />
      )}
    </div>
  );
};

export default Calendar;
