import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { AuthProvider, useAuth } from './assets/contexts/AuthContext'
import AdminFacultyLogin from './assets/components/AdminFacultyLogin'
import Calendar from './assets/components/Calendar'
import BookedEventsPage from './assets/components/BookedEventsPage'
import Halls from './assets/components/Halls'
import Timeslot from './assets/components/Timeslot'
import AdminDashboard from './assets/components/AdminDashboard'
import FacultySignUp from './assets/components/FacultySignUp'
import Layout from './assets/components/Layout'
import Profile from './assets/components/Profile'
import FacultyDashboard from './assets/components/FacultyDashboard'
import { db } from './firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

function RequireAuth ({ children, allowedRoles }) {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserRole () {
      if (user) {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('Email', '==', user.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          setUserRole(userData.Role)
        }
      }
      setLoading(false)
    }

    checkUserRole()
  }, [user])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to='/' replace />
  }

  return children
}

function App () {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<AdminFacultyLogin />} />
          <Route path='/signup' element={<FacultySignUp />} />

          <Route
            path='/'
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to='/calendar' replace />} />
            <Route path='calendar' element={<Calendar />} />
            <Route path='booked-events' element={<BookedEventsPage />} />
            <Route path='halls' element={<Halls />} />
            <Route path='timeslot' element={<Timeslot />} />
            <Route
              path='admin-dashboard'
              element={
                <RequireAuth allowedRoles={['admin']}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path='faculty-dashboard'
              element={
                <RequireAuth allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </RequireAuth>
              }
            />
            <Route path='profile' element={<Profile />} />
          </Route>

          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
