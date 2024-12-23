import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchPendingRequests();
      fetchBookedEvents();
    }
  }, [user, navigate]);

  const fetchPendingRequests = async () => {
    try {
      const q = query(
        collection(db, 'bookingapproval'),
        where('email', '==', user.email)
      );
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingRequests(requests);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to load pending requests');
    }
  };

  const fetchBookedEvents = async () => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('email', '==', user.email)
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookedEvents(events);
    } catch (err) {
      console.error('Error fetching booked events:', err);
      setError('Failed to load booked events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Faculty Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <div key={request.id} className="border p-4 rounded bg-gray-50">
                    <p><strong>Hall:</strong> {request.hall}</p>
                    <p><strong>Event Name:</strong> {request.eventName}</p>
                    <p><strong>Name:</strong> {request.name}</p>
                    <p><strong>Date:</strong> {request.date}</p>
                    <p><strong>Time Slot:</strong> {request.slot}</p>
                    <p><strong>Department:</strong> {request.department}</p>
                    <p><strong>Contact:</strong> {request.phone}</p>
                    <p><strong>Status:</strong> <span className="text-yellow-600 font-medium">Pending</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Booked Events</h2>
            {bookedEvents.length === 0 ? (
              <p className="text-gray-500">No booked events</p>
            ) : (
              <div className="space-y-4">
                {bookedEvents.map(event => (
                  <div key={event.id} className="border p-4 rounded bg-green-50">
                    <p><strong>Hall:</strong> {event.hall}</p>
                    <p><strong>Event Name:</strong> {event.eventName}</p>
                    <p><strong>Name:</strong> {event.name}</p>
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Time Slot:</strong> {event.slot}</p>
                    <p><strong>Department:</strong> {event.department}</p>
                    <p><strong>Contact:</strong> {event.phone}</p>
                    <p><strong>Status:</strong> <span className="text-green-600 font-medium">Approved</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
