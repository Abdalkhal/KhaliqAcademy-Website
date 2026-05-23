import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { 
  Plus, Edit2, Trash2, Play, ChevronLeft, Loader2, AlertTriangle, X,
  Video, FileText, HelpCircle, GripVertical, Upload
} from 'lucide-react'

const AdminLectures = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingLecture, setEditingLecture] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    isPreview: false,
    videoDuration: 0
  })
  const [videoFile, setVideoFile] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [courseRes, lecturesRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/admin/courses/${id}/lectures`)
      ])
      setCourse(courseRes.data.course)
      setLectures(lecturesRes.data.lectures || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    setVideoFile(file)
    if (file) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        setFormData(prev => ({ ...prev, videoDuration: Math.round(video.duration) }));
      }
      video.src = URL.createObjectURL(file);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      data.append('courseId', id)
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      if (videoFile) data.append('video', videoFile)

      await api.post('/admin/lectures', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving lecture')
    }
  }

  const handleDelete = async (lectureId) => {
    try {
      await api.delete(`/admin/lectures/${lectureId}`)
      setDeleteConfirm(null)
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleQuizSave = async () => {
    try {
      await api.post(`/admin/lectures/${editingLecture.id}/quiz`, {
        questions: quizQuestions
      })
      setShowQuizModal(false)
      setEditingLecture(null)
      setQuizQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving quiz')
    }
  }

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])
  }

  const removeQuizQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
  }

  const updateQuizQuestion = (index, field, value) => {
    const updated = [...quizQuestions]
    updated[index][field] = value
    setQuizQuestions(updated)
  }

  const updateQuizOption = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions]
    updated[qIndex].options[oIndex] = value
    setQuizQuestions(updated)
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', order: lectures.length, isPreview: false, videoDuration: 0 })
    setVideoFile(null)
  }

  const openQuizModal = (lecture) => {
    setEditingLecture(lecture)
    if (lecture.quizCount > 0) {
      // Load existing quiz
      api.get(`/quiz/${lecture.id}`).then(res => {
        // Convert to editable format
        const questions = res.data.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: 0, // We don't get this from public API, admin needs to re-set
          explanation: ''
        }))
        setQuizQuestions(questions)
      }).catch(() => {
        setQuizQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])
      })
    } else {
      setQuizQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }])
    }
    setShowQuizModal(true)
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
              onClick={() => navigate('/admin/courses')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{course?.title}</h1>
              <p className="text-sm text-slate-400">Manage lectures and quizzes</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Lecture
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {lectures.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400 mb-4">No lectures yet</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add First Lecture
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture, index) => (
              <div key={lecture.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 font-bold">
                  {index + 1}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-white">{lecture.title}</h3>
                    {lecture.isPreview && (
                      <span className="bg-green-900 text-green-400 text-xs px-2 py-0.5 rounded">Preview</span>
                    )}
                    {lecture.hasVideo && (
                      <span className="bg-blue-900 text-blue-400 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                        <Video className="h-3 w-3" /> Video
                      </span>
                    )}
                    {lecture.quizCount > 0 && (
                      <span className="bg-purple-900 text-purple-400 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" /> {lecture.quizCount} Q
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{lecture.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Duration: {Math.round((lecture.videoDuration || 0) / 60)} min</span>
                    <span>Resources: {lecture.resourcesCount || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openQuizModal(lecture)}
                    className="p-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 rounded-lg transition-colors"
                    title="Manage Quiz"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setEditingLecture(lecture); setFormData({ ...lecture }); setShowModal(true); }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(lecture)}
                    className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Lecture Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">New Lecture</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      checked={formData.isPreview}
                      onChange={(e) => setFormData({...formData, isPreview: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    Free Preview
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Video File</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-2">Max 500MB. MP4, WebM, OGG</p>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors">
                Create Lecture
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Manage Quiz: {editingLecture?.title}</h2>
              <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-slate-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Question {qIndex + 1}</h4>
                    <button
                      onClick={() => removeQuizQuestion(qIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter question..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                    placeholder="Explanation (optional)"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              ))}
              <button
                onClick={addQuizQuestion}
                className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-primary-500 hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
              <button
                onClick={handleQuizSave}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Save Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Delete Lecture?</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLectures
