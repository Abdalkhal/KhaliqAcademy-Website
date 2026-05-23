import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { 
  LayoutDashboard, BookOpen, Users, KeyRound, BarChart3, 
  LogOut, TrendingUp, DollarSign, Award, Clock, AlertTriangle,
  ChevronRight, Loader2
} from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setStats(res.data.stats)
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const menuItems = [
    { to: '/admin/courses', icon: BookOpen, label: 'Courses', desc: 'Manage courses & lectures', color: 'bg-blue-500' },
    { to: '/admin/codes', icon: KeyRound, label: 'Codes', desc: 'Generate & track codes', color: 'bg-green-500' },
    { to: '/admin/students', icon: Users, label: 'Students', desc: 'View enrollments', color: 'bg-purple-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Welcome back, Abdulkhaliq</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Users, label: 'Total Students', value: stats.totalStudents, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: KeyRound, label: 'Active Codes', value: stats.unusedCodes, color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: TrendingUp, label: 'Used Codes', value: stats.usedCodes, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-primary-500 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-1">{item.label}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Course Stats */}
        {stats?.courses && stats.courses.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Course Enrollments</h2>
            <div className="space-y-4">
              {stats.courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{course.title}</span>
                      <span className="text-slate-400">{course.enrolledCount} students</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((course.enrolledCount / (stats.totalStudents || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
