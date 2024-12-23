import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { createFacultyUser } from '../../utils/createFacultyUser';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const [facultyRequests, setFacultyRequests] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFacultyRequests();
      fetchBookingRequests();
    }
  }, [user, navigate]);

  const fetchFacultyRequests = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'facultysignup'));
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched faculty requests:', requests);
      setFacultyRequests(requests);
    } catch (err) {
      console.error('Error fetching faculty requests:', err);
      setError('Failed to load faculty requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'bookingapproval'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log('Individual booking request data:', data);
        return data;
      });
      console.log('All booking requests:', requests);
      setBookingRequests(requests);
    } catch (err) {
      console.error('Error fetching booking requests:', err);
      setError('Failed to load booking requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyAction = async (request, action) => {
    try {
      console.log('Processing faculty action:', action, 'for request:', request);
      if (action === 'approve') {
        // Get admin credentials from Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('Email', '==', user.email));
        const querySnapshot = await getDocs(q);
        const adminData = querySnapshot.docs[0].data();

        const result = await createFacultyUser({
          email: request.Email,
          password: request.Password,
          name: request.Name,
          department: request.Department,
          code: request.FacultyCode
        }, user.email, adminData.Password);

        if (!result.success) {
          throw new Error(result.error);
        }
      }
      await deleteDoc(doc(db, 'facultysignup', request.id));
      fetchFacultyRequests();
    } catch (err) {
      console.error(`Error ${action}ing faculty request:`, err);
      setError(`Failed to ${action} faculty request: ${err.message}`);
    }
  };

  const handleBookingAction = async (request, action) => {
    try {
      if (action === 'approve') {
        await setDoc(doc(db, 'bookings', request.id), {
          ...request,
          status: 'approved'
        });
      }
      await deleteDoc(doc(db, 'bookingapproval', request.id));
      fetchBookingRequests();
    } catch (err) {
      console.error(`Error ${action}ing booking request:`, err);
      setError(`Failed to ${action} booking request. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
      <nav className='bg-white shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                Admin Dashboard
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <div className='flex space-x-4'>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'faculty'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className='mr-2 h-5 w-5' />
              Faculty Requests ({facultyRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'booking'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className='mr-2 h-5 w-5' />
              Booking Requests ({bookingRequests.length})
            </button>
          </div>
        </div>

        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 p-4 mb-6'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <XCircle className='h-5 w-5 text-red-400' />
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className='bg-white rounded-xl shadow-lg p-6'>
          {activeTab === 'faculty' ? (
            <div>
              <h2 className='text-xl font-semibold mb-6 text-gray-800'>
                Faculty Sign-up Requests ({facultyRequests.length})
              </h2>
              {facultyRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No faculty requests pending</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Name
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Email
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Department
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Designation
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Faculty Code
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {facultyRequests.map((request) => (
                        <tr key={request.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.Name}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.Email}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.Department}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.Designation}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.FacultyCode}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                            <button
                              onClick={() => handleFacultyAction(request, 'approve')}
                              className='text-green-600 hover:text-green-900 mr-4'
                            >
                              <CheckCircle className='h-5 w-5' />
                            </button>
                            <button
                              onClick={() => handleFacultyAction(request, 'reject')}
                              className='text-red-600 hover:text-red-900'
                            >
                              <XCircle className='h-5 w-5' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className='text-xl font-semibold mb-6 text-gray-800'>
                Booking Requests ({bookingRequests.length})
              </h2>
              {bookingRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No booking requests pending</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Event Name
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Faculty Name
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Department
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Hall
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Time Slot
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {bookingRequests.map((request) => (
                        <tr key={request.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.eventName}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.name}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.department}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.hall}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.date}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {request.slot}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2'>
                            <button
                              onClick={() => handleBookingAction(request, 'approve')}
                              className='text-green-600 hover:text-green-900 inline-flex items-center'
                            >
                              <CheckCircle className='h-5 w-5' />
                            </button>
                            <button
                              onClick={() => handleBookingAction(request, 'reject')}
                              className='text-red-600 hover:text-red-900 inline-flex items-center'
                            >
                              <XCircle className='h-5 w-5' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
