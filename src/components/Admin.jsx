import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Lock, 
  PlusCircle, 
  LogOut, 
  Upload, 
  Trash2, 
  UserCheck, 
  Send, 
  Edit3, 
  X, 
  Sun, 
  Moon
} from 'lucide-react';

export default function Admin({ token, setToken, darkMode, setDarkMode }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // 1. Profile Header & Photos State
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bioShort, setBioShort] = useState('');
  const [headerLoading, setHeaderLoading] = useState(false);
  const [headerMsg, setHeaderMsg] = useState('');

  // 2. About Feed Post CMS State
  const [aboutPostContent, setAboutPostContent] = useState('');
  const [aboutMediaFiles, setAboutMediaFiles] = useState([]);
  const [aboutPostLoading, setAboutPostLoading] = useState(false);
  const [aboutPostMsg, setAboutPostMsg] = useState('');
  const [existingAboutPosts, setExistingAboutPosts] = useState([]);
  const [editingAboutId, setEditingAboutId] = useState(null);

  // Thread Steps with Per-Step Media Files
  const [threadSteps, setThreadSteps] = useState([]);

  // 3. Projects State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [tags, setTags] = useState('');
  const [highlights, setHighlights] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingProjects, setExistingProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Project Thread Updates State
  const [projectUpdates, setProjectUpdates] = useState([]);

  const fetchAdminData = async () => {
    try {
      const projRes = await axios.get('http://localhost:5000/api/projects');
      setExistingProjects(projRes.data);

      const profileRes = await axios.get('http://localhost:5000/api/profile');
      if (profileRes.data?.bioShort) setBioShort(profileRes.data.bioShort);

      const aboutRes = await axios.get('http://localhost:5000/api/about-posts');
      setExistingAboutPosts(aboutRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem('adminToken', res.data.token);
      }
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  // --- ABOUT THREAD HANDLERS ---
  const handleAddThreadStep = () => {
    setThreadSteps([...threadSteps, { content: '', files: [], existingMedia: [] }]);
  };

  const handleRemoveThreadStep = (index) => {
    setThreadSteps(threadSteps.filter((_, i) => i !== index));
  };

  const handleThreadStepChange = (index, value) => {
    const updated = [...threadSteps];
    updated[index].content = value;
    setThreadSteps(updated);
  };

  const handleThreadFilesChange = (index, filesList) => {
    const updated = [...threadSteps];
    updated[index].files = filesList;
    setThreadSteps(updated);
  };

  // --- PROJECT THREAD UPDATE HANDLERS ---
  const handleAddProjectUpdate = () => {
    setProjectUpdates([...projectUpdates, { title: '', description: '', files: [], existingMedia: [] }]);
  };

  const handleRemoveProjectUpdate = (index) => {
    setProjectUpdates(projectUpdates.filter((_, i) => i !== index));
  };

  const handleProjectUpdateChange = (index, field, value) => {
    const updated = [...projectUpdates];
    updated[index][field] = value;
    setProjectUpdates(updated);
  };

  const handleProjectUpdateFilesChange = (index, filesList) => {
    const updated = [...projectUpdates];
    updated[index].files = filesList;
    setProjectUpdates(updated);
  };

  // --- PROFILE HEADER SUBMIT ---
  const handleUpdateHeaderPhotos = async (e) => {
    e.preventDefault();
    setHeaderLoading(true);
    setHeaderMsg('');

    const formData = new FormData();
    if (avatarFile) formData.append('avatar', avatarFile);
    if (bannerFile) formData.append('banner', bannerFile);
    formData.append('bioShort', bioShort);

    try {
      const res = await axios.post('http://localhost:5000/api/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setHeaderMsg('Profile photos & short bio updated!');
        setAvatarFile(null);
        setBannerFile(null);
      }
    } catch (err) {
      setHeaderMsg(err.response?.data?.error || 'Failed to update profile header');
    } finally {
      setHeaderLoading(false);
    }
  };

  const handleUpdatePin = async (postId, newPinOrder) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/about-posts/${postId}/pin`,
        { pinOrder: newPinOrder },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update pin order:', err);
    }
  };

  // --- ABOUT POST SUBMIT ---
  const handlePublishOrUpdateAboutPost = async (e) => {
    e.preventDefault();
    if (!aboutPostContent.trim() && aboutMediaFiles.length === 0) return;

    setAboutPostLoading(true);
    setAboutPostMsg('');

    const formData = new FormData();
    formData.append('content', aboutPostContent);

    for (let i = 0; i < aboutMediaFiles.length; i++) {
      formData.append('aboutMediaFiles', aboutMediaFiles[i]);
    }

    const serializedSteps = threadSteps.map((step) => ({
      content: step.content.trim(),
      media: step.existingMedia || [],
    }));

    formData.append('threadItems', JSON.stringify(serializedSteps));

    threadSteps.forEach((step, idx) => {
      if (step.files && step.files.length > 0) {
        for (let i = 0; i < step.files.length; i++) {
          formData.append(`threadMedia_${idx}`, step.files[i]);
        }
      }
    });

    try {
      let res;
      if (editingAboutId) {
        res = await axios.put(`http://localhost:5000/api/about-posts/${editingAboutId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await axios.post('http://localhost:5000/api/about-posts', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (res.data.success) {
        setAboutPostMsg(editingAboutId ? 'Thread/Post updated!' : 'Thread/Post published!');
        resetAboutPostForm();
        fetchAdminData();
      }
    } catch (err) {
      setAboutPostMsg(err.response?.data?.error || 'Failed to save thread');
    } finally {
      setAboutPostLoading(false);
    }
  };

  const handleStartEditAboutPost = (post) => {
    setEditingAboutId(post._id);
    setAboutPostContent(post.content || '');
    setAboutMediaFiles([]);
    setThreadSteps(
      post.threadItems
        ? post.threadItems.map((item) => ({
            content: item.content || '',
            files: [],
            existingMedia: item.media || [],
          }))
        : []
    );
    setAboutPostMsg('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const resetAboutPostForm = () => {
    setEditingAboutId(null);
    setAboutPostContent('');
    setAboutMediaFiles([]);
    setThreadSteps([]);
  };

  const handleDeleteAboutPost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/about-posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingAboutId === id) resetAboutPostForm();
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  // --- PROJECT SUBMIT ---
  const handlePublishOrUpdateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('liveUrl', liveUrl);
    formData.append('tags', JSON.stringify(tags.split(',').map((t) => t.trim()).filter(Boolean)));
    formData.append('highlights', JSON.stringify(highlights.split(',').map((h) => h.trim()).filter(Boolean)));

    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append('mediaFiles', mediaFiles[i]);
    }

    const serializedUpdates = projectUpdates.map((upd) => ({
      title: upd.title.trim(),
      description: upd.description.trim(),
      media: upd.existingMedia || [],
    }));

    formData.append('projectUpdates', JSON.stringify(serializedUpdates));

    projectUpdates.forEach((upd, idx) => {
      if (upd.files && upd.files.length > 0) {
        for (let i = 0; i < upd.files.length; i++) {
          formData.append(`updateMedia_${idx}`, upd.files[i]);
        }
      }
    });

    try {
      let res;
      if (editingProjectId) {
        res = await axios.put(`http://localhost:5000/api/projects/${editingProjectId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await axios.post('http://localhost:5000/api/projects', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (res.data.success) {
        setMessage(editingProjectId ? 'Project updated!' : 'Project published!');
        resetProjectForm();
        fetchAdminData();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditProject = (proj) => {
    setEditingProjectId(proj._id);
    setTitle(proj.title || '');
    setCategory(proj.category || '');
    setDescription(proj.description || '');
    setLiveUrl(proj.liveUrl || '');
    setTags(proj.tags ? proj.tags.join(', ') : '');
    setHighlights(proj.highlights ? proj.highlights.join(', ') : '');
    setMediaFiles([]);
    setProjectUpdates(
      proj.projectUpdates
        ? proj.projectUpdates.map((upd) => ({
            title: upd.title || '',
            description: upd.description || '',
            files: [],
            existingMedia: upd.media || [],
          }))
        : []
    );
    setMessage('');
    window.scrollTo({ top: 900, behavior: 'smooth' });
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setTitle('');
    setCategory('');
    setDescription('');
    setLiveUrl('');
    setTags('');
    setHighlights('');
    setMediaFiles([]);
    setProjectUpdates([]);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingProjectId === id) resetProjectForm();
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
        <form onSubmit={handleLogin} className={`w-full max-w-md p-8 border rounded-2xl space-y-4 shadow-2xl ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-sky-500" />
              <h2 className="text-2xl font-bold">Admin Portal</h2>
            </div>
            {setDarkMode && (
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl border transition-all ${
                  darkMode ? 'bg-black border-neutral-800 text-amber-400' : 'bg-white border-neutral-300 text-neutral-800'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
          {loginError && <p className="text-rose-400 text-sm font-medium">{loginError}</p>}
          <div>
            <label className="block text-xs font-bold uppercase mb-1 opacity-70">Username</label>
            <input type="text" required value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 ${
              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
            }`} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 opacity-70">Password</label>
            <input type="password" required value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 ${
              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
            }`} />
          </div>
          <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 sm:p-12 transition-colors duration-200 ${
      darkMode ? 'bg-black text-white' : 'bg-white text-neutral-900'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className={`flex justify-between items-center border-b pb-6 ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div>
            <h1 className="text-3xl font-bold">Portfolio Control Center</h1>
            <p className="opacity-60 text-sm">Manage projects, profile details, and publish thread posts.</p>
          </div>
          <div className="flex items-center gap-3">
            {setDarkMode && (
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl border transition-all ${
                  darkMode ? 'bg-neutral-900 border-neutral-800 text-amber-400' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                }`}
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all text-sm font-semibold">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* SECTION 1: PROFILE HEADER & PHOTOS */}
        <form onSubmit={handleUpdateHeaderPhotos} className={`p-8 border rounded-2xl space-y-4 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-500" /> 1. Profile Header & Photos
          </h2>

          {headerMsg && <p className="text-sky-400 text-sm font-medium">{headerMsg}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Avatar Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className={`w-full px-4 py-2 rounded-xl border file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-semibold text-xs ${
                  darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                className={`w-full px-4 py-2 rounded-xl border file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-semibold text-xs ${
                  darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 opacity-70">Short Preview Bio</label>
            <textarea
              rows="2"
              value={bioShort}
              onChange={(e) => setBioShort(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 text-sm ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={headerLoading}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all"
          >
            {headerLoading ? 'Saving...' : 'Save Photos & Short Bio'}
          </button>
        </form>

        {/* SECTION 2: ABOUT PAGE THREAD PUBLISHER */}
        <form onSubmit={handlePublishOrUpdateAboutPost} className={`p-8 border rounded-2xl space-y-6 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-500" />
              {editingAboutId ? 'Edit Post / Thread' : '2. Publish X-Style Thread Post'}
            </h2>
            {editingAboutId && (
              <button
                type="button"
                onClick={resetAboutPostForm}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg border ${
                  darkMode ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          {aboutPostMsg && <p className="text-sky-400 text-sm font-medium">{aboutPostMsg}</p>}

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase opacity-70">
              Thread Post #1 (Main Post)
            </label>
            <textarea
              rows="4"
              required
              value={aboutPostContent}
              onChange={(e) => setAboutPostContent(e.target.value)}
              placeholder="Start your thread post..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-sky-500 text-sm ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`}
            ></textarea>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-60">
                Main Post Media (Images / Videos)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setAboutMediaFiles(e.target.files)}
                className={`w-full px-4 py-2 rounded-xl border file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-semibold text-xs ${
                  darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                }`}
              />
            </div>
          </div>

          {threadSteps.map((step, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-sky-500/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase text-sky-400">
                  Thread Post #{idx + 2}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveThreadStep(idx)}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>

              <textarea
                rows="3"
                value={step.content}
                onChange={(e) => handleThreadStepChange(idx, e.target.value)}
                placeholder={`Add part ${idx + 2} to your thread...`}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-sky-500 text-sm ${
                  darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                }`}
              ></textarea>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-60">
                  Thread Post #{idx + 2} Media (Attach image/video for this step)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleThreadFilesChange(idx, e.target.files)}
                  className={`w-full px-4 py-2 rounded-xl border file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-semibold text-xs ${
                    darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddThreadStep}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Add to Thread
          </button>

          <button
            type="submit"
            disabled={aboutPostLoading || (!aboutPostContent.trim() && aboutMediaFiles.length === 0)}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {aboutPostLoading ? 'Publishing...' : editingAboutId ? 'Update Thread' : 'Publish Thread'}
          </button>
        </form>

        {/* MANAGE ABOUT POSTS */}
        {existingAboutPosts.length > 0 && (
          <div className={`p-8 border rounded-2xl space-y-4 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Manage Published Posts ({existingAboutPosts.length})</h3>
              <span className="text-xs opacity-50">Double-click to cycle Pin order</span>
            </div>

            <div className="space-y-3">
              {existingAboutPosts.map((post) => (
                <div
                  key={post._id}
                  onDoubleClick={() => {
                    const nextPin = post.pinOrder === 0 ? 1 : post.pinOrder === 1 ? 2 : post.pinOrder === 2 ? 3 : 0;
                    handleUpdatePin(post._id, nextPin);
                  }}
                  className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all cursor-pointer ${
                    darkMode 
                      ? `bg-black ${editingAboutId === post._id ? 'border-sky-500 ring-1 ring-sky-500' : 'border-neutral-800 hover:border-neutral-700'}`
                      : `bg-white ${editingAboutId === post._id ? 'border-sky-500 ring-1 ring-sky-500' : 'border-neutral-200 hover:border-neutral-300'}`
                  }`}
                  title="Double-click to cycle Pin position"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {post.pinOrder > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          📌 Pinned #{post.pinOrder}
                        </span>
                      )}
                      <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs opacity-50 font-medium">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>• {post.media?.length || 0} main media file(s)</span>
                      {post.threadItems?.length > 0 && (
                        <span className="text-sky-400">• {post.threadItems.length} thread step(s)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select
                      value={post.pinOrder || 0}
                      onChange={(e) => handleUpdatePin(post._id, Number(e.target.value))}
                      className={`px-2 py-1.5 rounded-xl border text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer ${
                        darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
                      }`}
                    >
                      <option value={0}>Unpinned</option>
                      <option value={1}>📌 Pin #1</option>
                      <option value={2}>📌 Pin #2</option>
                      <option value={3}>📌 Pin #3</option>
                      <option value={4}>📌 Pin #4</option>
                    </select>

                    <button
                      onClick={() => handleStartEditAboutPost(post)}
                      className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 text-xs font-bold transition-all flex items-center gap-1"
                      title="Edit Post"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteAboutPost(post._id)}
                      className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: ADD OR EDIT PROJECT WITH THREAD UPDATES */}
        <form onSubmit={handlePublishOrUpdateProject} className={`p-8 border rounded-2xl space-y-6 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sky-500" />
              {editingProjectId ? 'Edit Project' : '3. Add New Project'}
            </h2>
            {editingProjectId && (
              <button
                type="button"
                onClick={resetProjectForm}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg border ${
                  darkMode ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          {message && <p className="text-sky-400 text-sm font-medium">{message}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Project Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Category</label>
              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Full-Stack Web App" className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 placeholder-neutral-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 opacity-70">Main Description</label>
            <textarea rows="3" required value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 ${
              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
            }`}></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Live URL</label>
              <input type="url" required value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">
                Main Showcase Media (Images / Videos)
              </label>
              <input type="file" multiple accept="image/*,video/*" onChange={(e) => setMediaFiles(e.target.files)} className={`w-full px-4 py-2 rounded-xl border file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-semibold text-xs ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`} />
            </div>
          </div>

          {/* Chained Project Updates / Thread Cards */}
          {projectUpdates.map((upd, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-sky-500/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase text-sky-400">
                  Project Update Card #{idx + 1}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveProjectUpdate(idx)}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>

              <input
                type="text"
                value={upd.title}
                onChange={(e) => handleProjectUpdateChange(idx, 'title', e.target.value)}
                placeholder="Update Title (e.g. Database Architecture or v2 Release)"
                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-sky-500 text-sm ${
                  darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                }`}
              />

              <textarea
                rows="3"
                value={upd.description}
                onChange={(e) => handleProjectUpdateChange(idx, 'description', e.target.value)}
                placeholder="Detail what was built or changed in this update..."
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-sky-500 text-sm ${
                  darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                }`}
              ></textarea>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-60">
                  Update #{idx + 1} Media File(s)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleProjectUpdateFilesChange(idx, e.target.files)}
                  className={`w-full px-4 py-2 rounded-xl border file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-semibold text-xs ${
                    darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddProjectUpdate}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Add Project Thread Update
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Node.js, Express, MongoDB" className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 placeholder-neutral-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1 opacity-70">Highlights / Features (comma-separated)</label>
              <input type="text" value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Portal integration, Online payments, Custom CMS" className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-sky-500 placeholder-neutral-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-sky-500/10">
            <Upload className="w-4 h-4" /> {loading ? 'Saving Project...' : editingProjectId ? 'Update Project' : 'Publish Project'}
          </button>
        </form>

        {/* EXISTING PROJECTS */}
        <div className={`p-8 border rounded-2xl space-y-4 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <h2 className="text-xl font-bold">Manage Published Projects ({existingProjects.length})</h2>
          <div className="space-y-3">
            {existingProjects.map((proj) => (
              <div key={proj._id} className={`flex justify-between items-center p-4 border rounded-xl transition-all ${
                darkMode 
                  ? `bg-black ${editingProjectId === proj._id ? 'border-sky-500 ring-1 ring-sky-500' : 'border-neutral-800'}`
                  : `bg-white ${editingProjectId === proj._id ? 'border-sky-500 ring-1 ring-sky-500' : 'border-neutral-200'}`
              }`}>
                <div>
                  <h3 className="font-bold text-lg">{proj.title}</h3>
                  <p className="text-xs opacity-60">
                    {proj.category} • {proj.media?.length || 0} Media items
                    {proj.projectUpdates?.length > 0 && ` • ${proj.projectUpdates.length} update card(s)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStartEditProject(proj)} className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 flex items-center gap-1.5 text-xs font-bold transition-all">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDeleteProject(proj._id)} className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 flex items-center gap-1.5 text-xs font-bold transition-all">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}