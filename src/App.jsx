import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Admin from './components/Admin';
import Navbar from './components/Navbar';
import ProjectCard from './components/ProjectCard';
import ProjectDetail from './components/ProjectDetail';
import AboutDetail from './components/AboutDetail';
import ContactForm from './components/ContactForm';
import heroImg from './assets/hero.png';
import { 
  Phone, 
  Database, 
  Globe, 
  Server, 
  Layout, 
  Wrench, 
  User, 
  Send,
  X as CloseIcon,
  Maximize2,
  ArrowRight
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const skillCategories = [
  {
    title: 'Frontend Development',
    icon: Layout,
    skills: ['React.js', 'JavaScript (ES6+)', 'Tailwind CSS', 'HTML5 & CSS3', 'Responsive Design', 'REST API Integration']
  },
  {
    title: 'Backend Engineering',
    icon: Server,
    skills: ['Node.js', 'Express.js', 'RESTful API Architecture', 'User Authentication', 'Payment Integration']
  },
  {
    title: 'Database & Cloud',
    icon: Database,
    skills: ['MongoDB Atlas', 'Mongoose ORM', 'Cloudinary Media Storage', 'Database Schema Design']
  },
  {
    title: 'Deployment & Tools',
    icon: Wrench,
    skills: ['Vercel', 'Render', 'Git & GitHub', 'Postman', 'Environment Security']
  }
];

function Home({ darkMode, setDarkMode, profile, projects, loadingProjects, setPreviewImage, setSelectedProject, setViewAboutPage }) {
  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-200 ${darkMode ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
      
      {/* Navbar */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onOpenAbout={() => setViewAboutPage(true)}
      />

      {/* Hero Header Section */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <div 
          onClick={() => profile.bannerUrl && setPreviewImage(profile.bannerUrl)}
          className={`relative group h-56 sm:h-72 rounded-2xl overflow-hidden border cursor-pointer ${
            darkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-100'
          }`}
        >
          {profile.bannerUrl ? (
            <>
              <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-bold">
                <Maximize2 className="w-5 h-5" /> Click to View Full Banner
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-sky-900/40 via-neutral-900 to-black flex items-center justify-center text-xs font-semibold text-neutral-500">
              No Banner Uploaded
            </div>
          )}
        </div>

        <div className="relative px-4 sm:px-8 text-center">
          <div className="flex justify-center -mt-16 sm:-mt-20">
            <div 
              onClick={() => setPreviewImage(profile.avatarUrl || heroImg)}
              className={`relative group w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 flex-shrink-0 shadow-2xl cursor-pointer ${
                darkMode ? 'border-black bg-neutral-900' : 'border-white bg-neutral-100'
              }`}
            >
              <img 
                src={profile.avatarUrl || heroImg} 
                alt="Johnny" 
                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = heroImg;
                }}
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${darkMode ? 'bg-neutral-900 border-neutral-800 text-sky-400' : 'bg-neutral-100 border-neutral-200 text-sky-600'}`}>
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Available for Freelance & Full-Stack Projects
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Hello, I'm <span className="text-sky-500">Johnny</span>
            </h1>

            <p className={`text-lg sm:text-xl font-medium max-w-2xl mx-auto ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Full-Stack Developer building practical web applications that solve real-world problems.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/10"
              >
                <Send className="w-4 h-4"/> Let's Talk
              </a>

              <a 
                href="https://wa.me/2347048695103" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.299.432 2.503 1.163 3.473l-.8 2.923 2.993-.785c.937.602 2.051.955 3.245.956 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.585-5.767-5.600-5.767zm3.327 8.283c-.144.405-.837.774-1.17.823-.312.045-.719.083-2.32-.577-1.921-.792-3.136-2.753-3.232-2.881-.096-.128-.775-1.033-.775-1.97 0-.937.489-1.398.663-1.59.175-.192.383-.24.512-.24.128 0 .256 0 .368.008.112.008.272-.043.424.321.16.385.544 1.329.592 1.425.048.096.08.208.016.336-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.202-.085.395.112.192.498.822 1.069 1.331.734.654 1.353.857 1.545.953.192.096.304.08.416-.048.112-.128.48-.56.608-.752.128-.192.256-.16.432-.096.176.064 1.12.528 1.312.624.192.096.32.144.368.224.048.08.048.464-.096.869z"/>
                </svg>
                WhatsApp
              </a>

              <a 
                href="https://x.com/X_CHAIN_G" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl border text-sm transition-all ${
                  darkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-black'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow on X
              </a>

              <a 
                href="tel:07048695103" 
                className={`inline-flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl border text-sm transition-all ${
                  darkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white' : 'bg-neutral-100 border-neutral-300 hover:bg-neutral-200 text-black'
                }`}
              >
                <Phone className="w-4 h-4"/> 07048695103
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className={`max-w-5xl mx-auto px-6 py-12 border-t ${darkMode ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-sky-500"/> About Me
        </h2>
        
        <p className={`text-base sm:text-lg leading-relaxed max-w-3xl mb-4 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
          {profile.bioShort || "Hi, I'm Johnny, a Full-Stack Developer who builds practical web applications that solve real-world problems. I work with React, JavaScript, Node.js, Express, and MongoDB to turn ideas into functional digital solutions."}
        </p>

        <button
          onClick={() => setViewAboutPage(true)}
          className="inline-flex items-center gap-2 text-sm font-bold text-sky-500 hover:text-sky-400 transition-colors"
        >
          Read full story & problem-solving approach <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Skills Section */}
      <section id="skills" className={`max-w-5xl mx-auto px-6 py-12 border-t ${darkMode ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-sky-500"/> Tech Stack & Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                    <IconComponent className="w-5 h-5"/>
                  </div>
                  <h3 className="text-lg font-bold">{cat.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill, sIdx) => (
                    <span key={sIdx} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'bg-white text-neutral-800 border-neutral-300'}`}>{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className={`max-w-5xl mx-auto px-6 py-12 border-t ${darkMode ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Globe className="w-6 h-6 text-sky-500"/> What I've Built
        </h2>

        {loadingProjects ? (
          <p className="text-sm text-neutral-400">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className={`p-8 border border-dashed rounded-2xl text-center text-neutral-400 ${darkMode ? 'border-neutral-800' : 'border-neutral-300'}`}>
            No projects added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {projects.map((p) => (
              <ProjectCard 
                key={p._id} 
                project={p} 
                darkMode={darkMode} 
                onViewDetail={setSelectedProject} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section id="contact" className={`max-w-5xl mx-auto px-6 py-12 border-t ${darkMode ? 'border-neutral-900' : 'border-neutral-200'}`}>
        <div className="max-w-xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Have a project in mind?</h2>
          <p className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>Let's build something useful together.</p>
        </div>
        <ContactForm darkMode={darkMode} />
      </section>

      {/* Footer */}
      <footer className={`max-w-5xl mx-auto px-6 py-12 border-t text-center text-sm ${darkMode ? 'border-neutral-900 text-neutral-500' : 'border-neutral-200 text-neutral-500'}`}>
        <p className="mb-2">Need a custom web application or school portal?</p>
        <p className="font-bold text-base mb-4 text-sky-500">Direct Line: 07048695103</p>
        <p className="text-xs opacity-70">&copy; {new Date().getFullYear()} Johnny. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [viewAboutPage, setViewAboutPage] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [profile, setProfile] = useState({ avatarUrl: '', bannerUrl: '', bioShort: '', bioFull: '' });
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/profile`);
      if (res.data) setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await axios.get(`${API_BASE_URL}/api/projects`);
      setProjects(res.data);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Modal / Detail Sub-views
  if (viewAboutPage) {
    return (
      <AboutDetail
        profile={profile}
        onBack={() => setViewAboutPage(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              darkMode={darkMode} 
              setDarkMode={setDarkMode}
              profile={profile}
              projects={projects}
              loadingProjects={loadingProjects}
              setPreviewImage={setPreviewImage}
              setSelectedProject={setSelectedProject}
              setViewAboutPage={setViewAboutPage}
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            <div>
              <div className="bg-neutral-900 border-b border-neutral-800 p-4 text-right px-6 flex justify-between items-center">
                <span className="text-sm font-semibold text-neutral-400">Admin Portal Mode</span>
                <button 
                  onClick={() => navigate('/')} 
                  className="text-xs px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-all font-bold"
                >
                  &larr; Back to Portfolio
                </button>
              </div>
              <Admin token={token} setToken={setToken} darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          } 
        />
      </Routes>

      {/* Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-neutral-800 text-white hover:bg-rose-500 transition-all"
            title="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}