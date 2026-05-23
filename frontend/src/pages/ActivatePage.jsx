import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api'
import { 
  Shield, KeyRound, ArrowRight, AlertCircle, CheckCircle, 
  Lock, GraduationCap, Loader2 
} from 'lucide-react'

const ActivatePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { activate } = useAuth()
  const [code, setCode] = useState('')
  const [courseId, setCourseId] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)

  React.useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data.courses || [])
      // Pre-select course from URL query if present
      const params = new URLSearchParams(location.search)
      const preselected = params.get('course')
      if (preselected) setCourseId(preselected)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleActivate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!code.match(/^KH-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      setError('Invalid code format. Example: KH-9X2A-7LMQ')
      setLoading(false)
      return
    }

    if (!courseId) {
      setError('Please select a course')
      setLoading(false)
      return
    }

    const result = await activate(code.toUpperCase(), courseId)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigate(`/course/${courseId}/learn`)
      }, 2000)
    } else {
      setError(result.message)
      if (result.code === 'DEVICE_LIMIT') {
        setStep(3)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Activate Your Course</h1>
          <p className="text-slate-600 mt-2">Enter your activation code to unlock course access</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Select Course' },
            { num: 2, label: 'Enter Code' },
            { num: 3, label: 'Access' }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block
                ${step >= s.num ? 'text-primary-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {s.num < 3 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-primary-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Activation Successful!</h2>
              <p className="text-slate-600 mb-4">
                Your course access has been unlocked. Redirecting to your course...
              </p>
              <div className="animate-pulse text-sm text-primary-600">
                <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                Redirecting...
              </div>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="p-8 space-y-6">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Course
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {courses.map((course) => (
                    <label 
                      key={course.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${courseId === course.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-slate-200 hover:border-primary-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="course"
                        value={course.id}
                        checked={courseId === course.id}
                        onChange={(e) => { setCourseId(e.target.value); setStep(2); }}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-sm text-slate-500">{Number(course.price).toLocaleString()} IQD</p>
                      </div>
                      {courseId === course.id && (
                        <CheckCircle className="h-5 w-5 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Code Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Activation Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="KH-XXXX-XXXX"
                    maxLength={12}
                    className="input-field pl-12 font-mono text-lg tracking-wider uppercase"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Format: KH-9X2A-7LMQ (auto-uppercase)
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    {error.includes('Device limit') && (
                      <p className="text-xs text-red-600 mt-1">
                        You can use max 2 devices. Contact @khaliq29 on Telegram for help.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !courseId || !code}
                className="w-full btn-primary text-lg py-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Activate Access
                  </>
                )}
              </button>

              {/* Help */}
              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-2">Don't have a code?</p>
                <a 
                  href="https://t.me/khaliq29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  Contact @khaliq29 on Telegram
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Lock className="h-4 w-4" />
          <span>Your code is securely validated and bound to your device</span>
        </div>
      </div>
    </div>
  )
}

export default ActivatePage
