import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  Menu, X, GraduationCap, User, LogOut, Shield, BookOpen, Home, Info 
} from 'lucide-react'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = location.pathname.startsWith('/admin')

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About', icon: Info },
  ]

  if (isAuthenticated && user?.enrolledCourses?.length > 0) {
    navLinks.push({ 
      to: `/course/${user.enrolledCourses[0].courseId}/learn`, 
      label: 'My Courses', 
      icon: BookOpen 
    })
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-slate-900">Khaliq</span>
                <span className="text-xl font-bold text-primary-600">Academy</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === link.to 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="bg-primary-100 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden lg:inline">Student</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                <Link
                  to="/activate"
                  className="btn-primary text-sm py-2 px-4"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Activate Access
                </Link>
              </div>
            )}

            {/* Admin Link */}
            <Link
              to="/admin"
              className="ml-2 p-2 text-slate-400 hover:text-primary-600 transition-colors"
              title="Admin Panel"
            >
              <Shield className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === link.to 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            ) : (
              <Link
                to="/activate"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium bg-primary-600 text-white"
              >
                <Shield className="h-5 w-5" />
                Activate Access
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
