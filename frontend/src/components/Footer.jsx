import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Mail, ExternalLink, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Khaliq Academy</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium e-learning platform providing simplified courses in Computer Networks, 
              Architecture, DSP, and Hardware Security.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-primary-400 transition-colors">About Me</Link>
              </li>
              <li>
                <Link to="/activate" className="text-sm hover:text-primary-400 transition-colors">Activate Course</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <a 
                href="https://t.me/khaliq29" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Telegram: @khaliq29
              </a>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4" />
                Northern Technical University
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2024 Khaliq Academy. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by Abdulkhaliq
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
