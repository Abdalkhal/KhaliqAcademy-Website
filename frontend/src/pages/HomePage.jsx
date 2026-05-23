import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { 
  Play, Users, BookOpen, Clock, ArrowRight, Star, Shield, Zap, Award 
} from 'lucide-react'

const HomePage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative text-center">
          <div className="space-y-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4 text-yellow-400" />
              Cyber Security Engineering Student
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Master University <br/>
              <span className="text-primary-400">Subjects with Ease</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-lg mx-auto">
              Simplified courses in Computer Networks, Architecture, DSP, and Hardware Security. 
              Learn from a fellow student who understands your challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/activate" className="btn-primary text-lg py-4 px-8">
                <Shield className="h-5 w-5 mr-2" />
                Get Access
              </Link>
              <Link to="/about" className="btn-secondary text-lg py-4 px-8 border-white/30 text-white hover:bg-white/10">
                About Me
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{courses.length}+ Courses</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Available Courses</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
          Choose from our carefully crafted courses designed to help you excel in your university studies
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="card group hover:-translate-y-1 transition-transform duration-300">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-200 overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <BookOpen className="h-12 w-12 text-primary-400" />
                      </div>
                    )}
                    {course.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        FEATURED
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {course.lectureCount || 0} lectures
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase">
                        {course.category || 'Course'}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolledCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.lectureCount || 0} lectures
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-600">
                          {Number(course.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 block">IQD</span>
                      </div>
                    </div>

                    <Link
                      to={`/course/${course.id}`}
                      className="mt-4 w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Simple 4-step process to get access to premium course content
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Course', desc: 'Browse and select the course you want to enroll in', icon: BookOpen },
              { step: '02', title: 'Contact on Telegram', desc: 'Message @khaliq29 to request course access', icon: ArrowRight },
              { step: '03', title: 'Get Your Code', desc: 'Receive a unique activation code after payment', icon: Shield },
              { step: '04', title: 'Start Learning', desc: 'Enter your code and unlock instant access', icon: Play },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="absolute inset-0 bg-primary-100 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform"></div>
                  <div className="relative bg-white border-2 border-primary-200 rounded-2xl p-6 shadow-sm">
                    <item.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">100%</div>
              <p className="text-slate-400">Secure Activation Codes</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">1-on-1</div>
              <p className="text-slate-400">Personal Support via Telegram</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">Lifetime</div>
              <p className="text-slate-400">Access After Activation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
