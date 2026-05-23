import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import CourseDetailPage from './pages/CourseDetailPage.jsx'
import CourseContentPage from './pages/CourseContentPage.jsx'
import ActivatePage from './pages/ActivatePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminCourses from './pages/admin/AdminCourses.jsx'
import AdminLectures from './pages/admin/AdminLectures.jsx'
import AdminCodes from './pages/admin/AdminCodes.jsx'
import AdminStudents from './pages/admin/AdminStudents.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/activate" element={<ActivatePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected Student Routes */}
          <Route path="/course/:id/learn" element={
            <ProtectedRoute>
              <CourseContentPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/courses" element={
            <AdminRoute>
              <AdminCourses />
            </AdminRoute>
          } />
          <Route path="/admin/courses/:id/lectures" element={
            <AdminRoute>
              <AdminLectures />
            </AdminRoute>
          } />
          <Route path="/admin/codes" element={
            <AdminRoute>
              <AdminCodes />
            </AdminRoute>
          } />
          <Route path="/admin/students" element={
            <AdminRoute>
              <AdminStudents />
            </AdminRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
