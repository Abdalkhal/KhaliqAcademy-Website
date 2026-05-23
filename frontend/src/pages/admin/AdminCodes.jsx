import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { 
  Plus, Copy, Check, Trash2, ChevronLeft, Loader2, AlertTriangle, X,
  KeyRound, Search, Filter, Download, Calendar, CheckCircle, Clock
} from 'lucide-react'

const AdminCodes = () => {
  const navigate = useNavigate()
  const [codes, setCodes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [bulkCount, setBulkCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editCode, setEditCode] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editExpiryDays, setEditExpiryDays] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [codesRes, coursesRes] = await Promise.all([
        api.get('/admin/codes'),
        api.get('/admin/courses')
      ])
      setCodes(codesRes.data.codes || [])
      setCourses(coursesRes.data.courses || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedCourse) return
    setGenerating(true)
    try {
      const res = await api.post(`/admin/courses/${selectedCourse}/generate-code`, {
        expiryDays: expiryDays ? parseInt(expiryDays) : null
      })
      setGeneratedCode(res.data)
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating code')
    } finally {
      setGenerating(false)
    }
  }

  const handleBulkGenerate = async () => {
    if (!selectedCourse) return
    setGenerating(true)
    try {
      const res = await api.post('/admin/generate-bulk-codes', {
        courseId: selectedCourse,
        count: bulkCount,
        expiryDays: expiryDays ? parseInt(expiryDays) : null
      })
      // Show all generated codes
      alert(`Generated ${res.data.generated} codes!`)
      setShowBulkModal(false)
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating codes')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/codes/${id}`)
      setDeleteConfirm(null)
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEditExpiry = async () => {
    try {
      await api.put(`/admin/codes/${editCode.id}`, {
        expiryDays: editExpiryDays ? parseInt(editExpiryDays) : null,
        removeExpiry: editExpiryDays === ''
      })
      setShowEditModal(false)
      fetchData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating expiry')
    }
  }

  const filteredCodes = codes.filter(code => {
    const matchesFilter = filter === 'all' || 
      (filter === 'used' && code.isUsed) || 
      (filter === 'unused' && !code.isUsed)
    const matchesSearch = !searchTerm || 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

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
              <h1 className="text-xl font-bold text-white">Activation Codes</h1>
              <p className="text-sm text-slate-400">Generate and manage access codes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Bulk Generate
            </button>
            <button
              onClick={() => { setGeneratedCode(null); setShowGenerateModal(true); }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Generate Code
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search codes or courses..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
            {['all', 'unused', 'used'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${filter === f ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Total Codes</p>
            <p className="text-2xl font-bold text-white">{codes.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Used</p>
            <p className="text-2xl font-bold text-green-400">{codes.filter(c => c.isUsed).length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Available</p>
            <p className="text-2xl font-bold text-primary-400">{codes.filter(c => !c.isUsed).length}</p>
          </div>
        </div>

        {/* Codes Table */}
        {filteredCodes.length === 0 ? (
          <div className="text-center py-16">
            <KeyRound className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400">No codes found</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Code</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Course</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Expiry</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-900 text-primary-400 px-3 py-1.5 rounded-lg font-mono text-sm font-bold">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="p-1.5 text-slate-400 hover:text-primary-400 transition-colors"
                            title="Copy"
                          >
                            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{code.course?.title}</td>
                      <td className="px-6 py-4">
                        {code.isUsed ? (
                          <span className="inline-flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Used
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-primary-900/30 text-primary-400 text-xs px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3" /> Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {code.expiryDate ? (
                          new Date(code.expiryDate) < new Date() ? (
                            <span className="text-red-400">Expired</span>
                          ) : (
                            new Date(code.expiryDate).toLocaleDateString()
                          )
                        ) : (
                          'No expiry'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => { setEditCode(code); setEditExpiryDays(''); setShowEditModal(true); }}
                          className="p-2 text-slate-400 hover:text-primary-400 transition-colors"
                          title="Edit Expiry"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(code)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Code & Revoke Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Generate Single Code Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Generate Access Code</h2>
              <button onClick={() => { setShowGenerateModal(false); setGeneratedCode(null); }} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!generatedCode ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({Number(c.price).toLocaleString()} IQD)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Expiry (days) <span className="text-slate-500">- optional</span>
                  </label>
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    placeholder="Leave empty for no expiry"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedCourse || generating}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" />
                      Generate Code
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Code generated for</p>
                  <p className="font-bold text-white">{generatedCode.course?.title}</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <code className="text-2xl font-mono font-bold text-primary-400 tracking-wider">
                    {generatedCode.code}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedCode.code)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <p className="text-xs text-slate-500">
                  Share this code with your student. It can only be used once.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Bulk Generate Codes</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Codes</label>
                <input
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expiry (days) - optional</label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="Leave empty for no expiry"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                onClick={handleBulkGenerate}
                disabled={!selectedCourse || generating}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Generate {bulkCount} Codes
                  </>
                )}
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
                <h3 className="font-bold text-white">Delete Code?</h3>
                <p className="text-sm text-slate-400">Code: {deleteConfirm.code}</p>
              </div>
            </div>
            {deleteConfirm.isUsed && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                <strong>Warning:</strong> This code is already used. Deleting it will immediately revoke the student's access to the course.
              </div>
            )}
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

      {/* Edit Expiry Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Expiry Date</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Expiry (days from now)</label>
                <input
                  type="number"
                  value={editExpiryDays}
                  onChange={(e) => setEditExpiryDays(e.target.value)}
                  placeholder="Leave empty for no expiry"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                onClick={handleEditExpiry}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Update Expiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCodes
