import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api'
import { 
  Play, Pause, CheckCircle, Lock, ChevronLeft, ChevronRight, 
  Clock, MessageSquare, Award, ArrowLeft, Loader2, AlertTriangle,
  BookOpen, HelpCircle, FileText, Download, Volume2, Maximize, Settings
} from 'lucide-react'

const CourseContentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasCourseAccess, user } = useAuth()
  const [course, setCourse] = useState(null)
  const [currentLecture, setCurrentLecture] = useState(null)
  const [videoToken, setVideoToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [videoLoading, setVideoLoading] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isBlurred, setIsBlurred] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!hasCourseAccess(id)) {
      navigate(`/course/${id}`)
      return
    }
    fetchCourseContent()
  }, [id])

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault()
    
    const handleKeyDown = (e) => {
      // Prevent common screenshot shortcuts
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault()
        alert('Screenshots and recording are not allowed for this course.')
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true)
        if (videoRef.current) {
          videoRef.current.pause()
        }
      } else {
        setIsBlurred(false)
      }
    }

    const handleWindowBlur = () => {
      setIsBlurred(true)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }

    const handleWindowFocus = () => {
      setIsBlurred(false)
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

  const fetchCourseContent = async () => {
    try {
      const res = await api.get(`/courses/${id}/content`)
      setCourse(res.data.course)
      setProgress(res.data.course.progress || 0)

      // Set first incomplete lecture or first lecture
      const lectures = res.data.course.lectures || []
      const firstIncomplete = lectures.find(l => !l.isCompleted)
      if (firstIncomplete) {
        setCurrentLecture(firstIncomplete)
        loadVideo(firstIncomplete.id)
      } else if (lectures.length > 0) {
        setCurrentLecture(lectures[0])
        loadVideo(lectures[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.status === 403) {
        navigate(`/course/${id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadVideo = async (lectureId) => {
    setVideoLoading(true)
    try {
      const res = await api.post('/videos/token', { lectureId })
      setVideoToken(res.data.token)
    } catch (error) {
      console.error('Video token error:', error)
    } finally {
      setVideoLoading(false)
    }
  }

  const handleLectureClick = (lecture) => {
    setCurrentLecture(lecture)
    setQuizMode(false)
    setQuizResult(null)
    setQuizAnswers({})
    loadVideo(lecture.id)
  }

  const handleQuizSubmit = async () => {
    try {
      const answers = Object.values(quizAnswers)
      const res = await api.post(`/quiz/${currentLecture.id}/submit`, { answers })
      setQuizResult(res.data)
    } catch (error) {
      console.error('Quiz error:', error)
    }
  }

  const handleVideoEnded = async () => {
    // Mark lecture as completed
    try {
      await api.post(`/courses/${id}/progress`, { lectureId: currentLecture.id })
      // Refresh course data
      fetchCourseContent()
    } catch (error) {
      console.error('Progress update error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Course not found</p>
        </div>
      </div>
    )
  }

  const lectures = course.lectures || []
  const currentIndex = lectures.findIndex(l => l.id === currentLecture?.id)
  const completedCount = lectures.filter(l => l.isCompleted).length

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-800 border-r border-slate-700 flex-shrink-0 transition-all duration-300 overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700">
            <button 
              onClick={() => navigate(`/course/${id}`)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </button>
            <h2 className="font-bold text-white truncate">{course.title}</h2>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{Math.round((completedCount / lectures.length) * 100)}% Complete</span>
                <span>{completedCount}/{lectures.length}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / lectures.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lectures List */}
          <div className="flex-grow overflow-y-auto">
            {lectures.map((lecture, index) => (
              <button
                key={lecture.id}
                onClick={() => handleLectureClick(lecture)}
                className={`w-full text-left p-4 border-b border-slate-700 transition-all flex items-start gap-3
                  ${currentLecture?.id === lecture.id 
                    ? 'bg-primary-900/50 border-l-4 border-l-primary-500' 
                    : 'hover:bg-slate-700/50 border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {lecture.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold
                      ${currentLecture?.id === lecture.id ? 'border-primary-500 text-primary-500' : 'border-slate-500 text-slate-500'}`}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className={`text-sm font-medium truncate
                    ${currentLecture?.id === lecture.id ? 'text-white' : 'text-slate-300'}`}>
                    {lecture.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round((lecture.duration || 0) / 60)} min
                    </span>
                    {lecture.hasQuiz && (
                      <span className="text-xs bg-primary-900 text-primary-400 px-1.5 py-0.5 rounded">
                        Quiz
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <BookOpen className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            {currentLecture?.hasQuiz && (
              <button
                onClick={() => setQuizMode(!quizMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${quizMode ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <HelpCircle className="h-4 w-4" />
                {quizMode ? 'Back to Video' : 'Take Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Video / Quiz Area */}
        <div className="flex-grow bg-black flex items-center justify-center relative overflow-hidden">
          {quizMode ? (
            <QuizPanel 
              lecture={currentLecture} 
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizResult={quizResult}
              onSubmit={handleQuizSubmit}
              onClose={() => setQuizMode(false)}
            />
          ) : (
            <>
              {videoLoading ? (
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-primary-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Loading video...</p>
                </div>
              ) : videoToken ? (
                <div className="relative w-full h-full flex items-center justify-center group overflow-hidden">
                  <video
                    ref={videoRef}
                    src={`/api/videos/stream/${videoToken}`}
                    controls
                    className={`w-full h-full max-h-[calc(100vh-200px)] transition-all duration-300 ${isBlurred ? 'blur-2xl grayscale' : ''}`}
                    onEnded={handleVideoEnded}
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Watermark overlay */}
                  {!isBlurred && user && (
                    <div 
                      className="absolute pointer-events-none opacity-25 text-white/50 font-mono text-xl md:text-3xl font-bold whitespace-nowrap z-40 select-none watermark-float"
                    >
                      ID: {user.id}
                    </div>
                  )}

                  {/* Blur Overlay */}
                  {isBlurred && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                      <div className="text-center text-white bg-slate-900/90 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-2xl font-bold mb-2">Playback Paused</h3>
                        <p className="text-slate-300">Recording or leaving the window is not allowed.</p>
                        <p className="text-sm text-slate-500 mt-4">Click anywhere to resume.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Play className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Select a lecture to start learning</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Lecture Info */}
        {currentLecture && !quizMode && (
          <div className="bg-slate-800 border-t border-slate-700 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{currentLecture.title}</h2>
                  <p className="text-slate-400">{currentLecture.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentLecture.isCompleted && (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <button
                  onClick={() => currentIndex > 0 && handleLectureClick(lectures[currentIndex - 1])}
                  disabled={currentIndex <= 0}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => currentIndex < lectures.length - 1 && handleLectureClick(lectures[currentIndex + 1])}
                  disabled={currentIndex >= lectures.length - 1}
                  className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 disabled:opacity-30 transition-colors"
                >
                  Next Lecture
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Quiz Panel Component
const QuizPanel = ({ lecture, quizAnswers, setQuizAnswers, quizResult, onSubmit, onClose }) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuiz()
  }, [lecture])

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${lecture.id}`)
      setQuestions(res.data.questions || [])
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading quiz...</p>
      </div>
    )
  }

  if (quizResult) {
    return (
      <div className="max-w-2xl w-full mx-4 bg-slate-800 rounded-2xl p-8 border border-slate-700">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4
            ${quizResult.percentage >= 70 ? 'bg-green-900' : quizResult.percentage >= 50 ? 'bg-yellow-900' : 'bg-red-900'}`}>
            <Award className={`h-10 w-10 ${quizResult.percentage >= 70 ? 'text-green-400' : quizResult.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Score: {quizResult.score}/{quizResult.totalQuestions}
          </h2>
          <p className={`text-lg font-medium
            ${quizResult.percentage >= 70 ? 'text-green-400' : quizResult.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {quizResult.percentage}%
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {quizResult.results.map((result, idx) => (
            <div key={idx} className={`p-4 rounded-xl border
              ${result.isCorrect ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
              <p className="font-medium text-white mb-2">{idx + 1}. {result.question}</p>
              <p className="text-sm text-slate-400">Your answer: {result.userAnswer}</p>
              {!result.isCorrect && (
                <p className="text-sm text-green-400 mt-1">Correct: {result.correctAnswer}</p>
              )}
              {result.explanation && (
                <p className="text-sm text-slate-500 mt-2 italic">{result.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 btn-primary"
        >
          Back to Video
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl w-full mx-4 bg-slate-800 rounded-2xl p-8 border border-slate-700 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Quiz: {lecture.title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="space-y-3">
            <p className="font-medium text-white">{idx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((option, optIdx) => (
                <label 
                  key={optIdx}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${quizAnswers[q.id] === optIdx 
                      ? 'border-primary-500 bg-primary-900/30' 
                      : 'border-slate-700 hover:border-slate-500'
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={quizAnswers[q.id] === optIdx}
                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-slate-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={Object.keys(quizAnswers).length < questions.length}
        className="w-full mt-8 btn-primary py-4"
      >
        Submit Quiz
      </button>
    </div>
  )
}

export default CourseContentPage
