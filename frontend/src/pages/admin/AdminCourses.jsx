import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { 
  Plus, Edit2, Trash2, Eye, BookOpen, DollarSign, Users, 
  ChevronLeft, Loader2, AlertTriangle, CheckCircle, X,
  Image as ImageIcon, Star
} from 'lucide-react'

const AdminCourses = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    level: 'beginner',
    featured: false,
    isPublished: false
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses')
      setCourses(res.data.courses || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      if (thumbnail) data.append('thumbnail', thumbnail)

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }

      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, data, config)
      } else {
        await api.post('/admin/courses', data, config)
      }

      setShowModal(false)
      setEditingCourse(null)
      resetForm()
      fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Error saving course')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/courses/${id}`)
      setDeleteConfirm(null)
      fetchCourses()
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting course')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      price: '',
      category: '',
      level: 'beginner',
      featured: false,
      isPublished: false
    })
    setThumbnail(null)
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      price: course.price,
      category: course.category || '',
      level: course.level,
      featured: course.featured,
      isPublished: course.isPublished
    })
    setShowModal(true)
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
              <h1 className="text-xl font-bold text-white">Courses</h1>
              <p className="text-sm text-slate-400">Manage your courses and content</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setEditingCourse(null); setShowModal(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400 mb-4">No courses yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-700">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {course.featured && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                        <Star className="h-3 w-3 inline" /> FEATURED
                      </span>
                    )}
                    {course.isPublished ? (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">LIVE</span>
                    ) : (
                      <span className="bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded">DRAFT</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {Number(course.price).toLocaleString()} IQD
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lectureCount} lectures
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolledCount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                    <Link
                      to={`/admin/courses/${course.id}/lectures`}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded-lg text-center transition-colors"
                    >
                      Lectures
                    </Link>
                    <button
                      onClick={() => openEdit(course)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(course)}
                      className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingCourse ? 'Edit Course' : 'New Course'}
              </h2>
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
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price (IQD)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-600"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-600"
                  />
                  Published
                </label>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </form>
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
                <h3 className="font-bold text-white">Delete Course?</h3>
                <p className="text-sm text-slate-400">This will also delete all lectures and codes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
