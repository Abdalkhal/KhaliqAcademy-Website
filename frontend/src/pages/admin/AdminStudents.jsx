import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { 
  ChevronLeft, Users, Search, Filter, Monitor, Smartphone, Globe,
  Clock, Calendar, Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const AdminStudents = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/courses')
      ])
      setStudents(studentsRes.data.students || [])
      setCourses(coursesRes.data.courses || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.activationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.devices?.some(d => d.browser?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCourse = selectedCourse === 'all' || 
      student.enrolledCourses?.some(e => e.courseId === selectedCourse)
    return matchesSearch && matchesCourse
  })

  const getDeviceIcon = (device) => {
    if (device === 'mobile') return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Students & Enrollments</h1>
              <p className="text-sm text-slate-400">Track all enrolled students and their devices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Total Students</p>
            <p className="text-2xl font-bold text-white">{students.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Active Today</p>
            <p className="text-2xl font-bold text-green-400">
              {students.filter(s => {
                const lastLogin = s.lastLogin ? new Date(s.lastLogin) : null
                return lastLogin && (new Date() - lastLogin) < 24 * 60 * 60 * 1000
              }).length}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Total Devices</p>
            <p className="text-2xl font-bold text-primary-400">
              {students.reduce((acc, s) => acc + (s.devices?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Avg Progress</p>
            <p className="text-2xl font-bold text-yellow-400">
              {students.length > 0 
                ? Math.round(students.reduce((acc, s) => acc + (s.enrolledCourses?.reduce((a, e) => a + (e.progress || 0), 0) || 0), 0) / 
                  (students.length * Math.max(students[0]?.enrolledCourses?.length || 1, 1))) 
                : 0}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code or device..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400">No students found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {/* Student Header */}
                <div className="p-5 border-b border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-900/30 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">Student #{student.id.slice(-6)}</h3>
                          <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                            {student.activationCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last login {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full
                        ${student.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {student.isActive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses */}
                {student.enrolledCourses && student.enrolledCourses.length > 0 && (
                  <div className="px-5 py-4 border-b border-slate-700/50">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Enrolled Courses</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.enrolledCourses.map((enrollment, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg px-3 py-2">
                          <p className="text-sm font-medium text-white">{enrollment.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 bg-slate-600 rounded-full h-1.5">
                              <div 
                                className="bg-primary-500 h-1.5 rounded-full"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">{enrollment.progress || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Devices */}
                {student.devices && student.devices.length > 0 && (
                  <div className="px-5 py-4">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Registered Devices ({student.devices.length}/2)</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {student.devices.map((device, idx) => (
                        <div key={idx} className="bg-slate-700/30 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                            {getDeviceIcon(device.device)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm text-white truncate">
                              {device.browser} on {device.os}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Globe className="h-3 w-3" />
                              <span className="truncate">{device.ipAddress}</span>
                              <span>•</span>
                              <span>Active {new Date(device.lastActive).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminStudents
