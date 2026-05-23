import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { 
  GraduationCap, Shield, Cpu, Network, Radio, Lock, 
  MessageCircle, Award, BookOpen, Users, Star, ExternalLink 
} from 'lucide-react'

const AboutPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchCourses()
  }, [])

  const stats = [
    { value: `${courses.length > 0 ? courses.length : '4'}+`, label: 'Courses Delivered' },
    { value: '100+', label: 'Students Helped' },
    { value: '100%', label: 'Simplified Content' },
    { value: '24/7', label: 'Telegram Support' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Shield className="h-4 w-4 text-primary-400" />
                Cyber Security Engineering Student
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Hi, I'm <span className="text-primary-400">Abdulkhaliq</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                A passionate Cyber Security Engineering student at Northern Technical University. 
                I create simplified courses to help students understand complex university subjects 
                without the confusion.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://t.me/khaliq29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact on Telegram
                </a>
                <a href="#courses" className="btn-secondary border-white/30 text-white hover:bg-white/10">
                  Browse Courses
                </a>
              </div>
            </div>

            {/* Profile Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-primary-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden shadow-xl border-4 border-white">
                  <img 
                    src="/khaliq.jpg" 
                    alt="Abdulkhaliq"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=Abdulkhaliq&background=2563eb&color=fff&size=256";
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold mb-1">Abdulkhaliq Abdulrahman Ramadan</h2>
                <p className="text-primary-400 font-medium mb-4">Cyber Security Engineering Student</p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-6">
                  <Award className="h-4 w-4" />
                  Northern Technical University
                </div>
                <div className="flex items-center justify-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why I Teach</h2>
            <p className="section-subtitle">
              My mission is to make complex subjects accessible to every student
            </p>
          </div>

          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              As a Cyber Security Engineering student at Northern Technical University, I understand 
              the challenges students face when trying to grasp complex technical concepts. University 
              courses can be overwhelming with dense textbooks and fast-paced lectures.
            </p>
            <p>
              That's why I started creating simplified courses that break down difficult topics into 
              easy-to-understand lessons. My approach focuses on practical understanding rather than 
              just theoretical knowledge, ensuring students can apply what they learn in real-world scenarios.
            </p>
            <p>
              I have successfully delivered courses in <strong>Computer Networks</strong>, 
              <strong> Computer Architecture</strong>, <strong>Digital Signal Processing</strong>, and 
              <strong> Hardware Security</strong> — all designed with the student's perspective in mind.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">My Courses</h2>
            <p className="section-subtitle">
              Specialized subjects I have delivered and continue to teach
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Link to={`/course/${course.id}`} key={course.id} className="card p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
                <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-7 w-7 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                </div>
              </Link>
            ))}
            {courses.length === 0 && !loading && (
              <div className="col-span-2 text-center text-slate-500 py-8 border-2 border-dashed border-slate-200 rounded-xl">
                Courses are being updated. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Teaching Method */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How I Teach</h2>
            <p className="section-subtitle">
              A student-centered approach to technical education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: BookOpen, 
                title: 'Simplified Content', 
                desc: 'Complex topics broken down into digestible lessons with clear explanations and visual aids.' 
              },
              { 
                icon: Users, 
                title: 'Student Perspective', 
                desc: 'Courses designed by a student who understands exactly where others struggle and get confused.' 
              },
              { 
                icon: MessageCircle, 
                title: 'Direct Support', 
                desc: 'Personal assistance via Telegram. Get your questions answered directly by the instructor.' 
              },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
                  <item.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-primary-100 mb-8">
            Browse my courses and get in touch on Telegram to begin your learning journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#courses" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              View All Courses
            </a>
            <a 
              href="https://t.me/khaliq29"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-700 text-white border-2 border-primary-400 px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Contact @khaliq29
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
