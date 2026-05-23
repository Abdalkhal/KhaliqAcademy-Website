import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api'
import { 
  ArrowLeft, Play, Users, Clock, BookOpen, Shield, CheckCircle, 
  Lock, Star, MessageCircle, ChevronRight, AlertTriangle 
} from 'lucide-react'

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, hasCourseAccess } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`)
      setCourse(res.data.course)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Not Found</h2>
        <p className="text-slate-600 mb-6">The course you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  const hasAccess = hasCourseAccess(id)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </button>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {course.category}
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full capitalize">
                  {course.level} Level
                </span>
                {course.featured && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ FEATURED
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-500" />
                  <span className="font-medium">{course.enrolledCount || 0}</span> students enrolled
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-500" />
                  <span className="font-medium">{course.lectureCount || 0}</span> lectures
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-500" />
                  <span className="font-medium">{Math.round((course.totalDuration || 0) / 60)}</span> hours
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full aspect-video object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl mb-6 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary-400" />
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-slate-900">
                    {Number(course.price).toLocaleString()}
                    <span className="text-lg font-normal text-slate-500"> IQD</span>
                  </div>
                </div>

                {hasAccess ? (
                  <Link
                    to={`/course/${id}/learn`}
                    className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Continue Learning
                  </Link>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowContact(true)}
                      className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
                    >
                      <Shield className="h-5 w-5" />
                      Get Access
                    </button>
                    <p className="text-xs text-center text-slate-500">
                      Secure activation code required
                    </p>
                  </div>
                )}

                {/* Features List */}
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  {[
                    'Full lifetime access',
                    'Access on 1 device',
                    'Quiz assessments included'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Content</h2>

            {course.lectures && course.lectures.length > 0 ? (
              <div className="space-y-3">
                {course.lectures.map((lecture, index) => (
                  <div 
                    key={lecture.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                      ${lecture.isPreview 
                        ? 'bg-white border-slate-200 hover:border-primary-300 cursor-pointer' 
                        : 'bg-slate-50 border-slate-200 opacity-75'
                      }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                      ${lecture.isPreview ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-400'}`}>
                      {lecture.isPreview ? (
                        <Play className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          Lecture {index + 1}
                        </span>
                        {lecture.isPreview && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Preview
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900">{lecture.title}</h3>
                      {lecture.description && (
                        <p className="text-sm text-slate-500 mt-1">{lecture.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round((lecture.duration || 0) / 60)} min
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Course content coming soon</p>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">About the Instructor</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                  <Star className="h-7 w-7 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Abdulkhaliq Abdulrahman</p>
                  <p className="text-sm text-slate-500">Cyber Security Engineering</p>
                  <p className="text-xs text-slate-400">Northern Technical University</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-primary-100 mb-4">
                Contact me directly on Telegram for any questions about courses or enrollment.
              </p>
              <a 
                href="https://t.me/khaliq29"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                @khaliq29
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Get Your Access Code</h3>
              <p className="text-slate-600">
                To enroll in <span className="font-semibold">{course.title}</span>, contact me on Telegram to receive your unique activation code.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Course Price:</span>
                  <span className="font-bold text-slate-900">{Number(course.price).toLocaleString()} IQD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-900">Telegram</span>
                </div>
              </div>
              <a 
                href="https://t.me/khaliq29"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Message @khaliq29
              </a>
              <button
                onClick={() => setShowContact(false)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetailPage
