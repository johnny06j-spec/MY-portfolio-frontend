import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, LogOut, Sun, Moon } from 'lucide-react';

import AdminMessages from './admin/AdminMessages';
import AdminProfileHeader from './admin/AdminProfileHeader';
import AdminAboutPosts from './admin/AdminAboutPosts';
import AdminProjects from './admin/AdminProjects';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Admin({ token, setToken, darkMode, setDarkMode }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // 1. Profile Header & Photos State
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bioShort, setBioShort] = useState('');
  const [headerLoading, setHeaderLoading] = useState(false);
  const [headerMsg, setHeaderMsg] = useState('');

  // 2. Messages State
  const [messagesList, setMessagesList] = useState([]);

  // 3. About Feed Post CMS State
  const [aboutPostContent, setAboutPostContent] = useState('');
  const [aboutMediaFiles, setAboutMediaFiles] = useState([]);
  const [aboutPostLoading, setAboutPostLoading] = useState(false);
  const [aboutPostMsg, setAboutPostMsg] = useState('');
  const [existingAboutPosts, setExistingAboutPosts] = useState([]);
  const [editingAboutId, setEditingAboutId] = useState(null);
  const [threadSteps, setThreadSteps] = useState([]);

  // 4. Projects State
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
  const [projectUpdates, setProjectUpdates] = useState([]);

  const fetchAdminData = async () => {
    try {
      const projRes = await axios.get(`${API_BASE_URL}/api/projects`);
      setExistingProjects(projRes.data);

      const profileRes = await axios.get(`${API_BASE_URL}/api/profile`);
      if (profileRes.data?.bioShort) setBioShort(profileRes.data.bioShort);

      const aboutRes = await axios.get(`${API_BASE_URL}/api/about-posts`);
      setExistingAboutPosts(aboutRes.data);

      const msgRes = await axios.get(`${API_BASE_URL}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessagesList(msgRes.data);
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
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
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

  // --- MESSAGE HANDLERS ---
  const handleToggleRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update message status:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete message.');
    }
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
      const res = await axios.post(`${API_BASE_URL}/api/profile`, formData, {
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
        `${API_BASE_URL}/api/about-posts/${postId}/pin`,
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
        res = await axios.put(`${API_BASE_URL}/api/about-posts/${editingAboutId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/api/about-posts`, formData, {
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
      await axios.delete(`${API_BASE_URL}/api/about-posts/${id}`, {
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
        res = await axios.put(`${API_BASE_URL}/api/projects/${editingProjectId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/api/projects`, formData, {
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
      await axios.delete(`${API_BASE_URL}/api/projects/${id}`, {
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
            <p className="opacity-60 text-sm">Manage projects, profile details, messages, and publish thread posts.</p>
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

        {/* SECTION 1: INCOMING MESSAGES */}
        <AdminMessages
          messagesList={messagesList}
          darkMode={darkMode}
          handleToggleRead={handleToggleRead}
          handleDeleteMessage={handleDeleteMessage}
        />

        {/* SECTION 2: PROFILE HEADER & PHOTOS */}
        <AdminProfileHeader
          darkMode={darkMode}
          bioShort={bioShort}
          setBioShort={setBioShort}
          setAvatarFile={setAvatarFile}
          setBannerFile={setBannerFile}
          headerLoading={headerLoading}
          headerMsg={headerMsg}
          handleUpdateHeaderPhotos={handleUpdateHeaderPhotos}
        />

        {/* SECTION 3: ABOUT PAGE THREAD PUBLISHER */}
        <AdminAboutPosts
          darkMode={darkMode}
          aboutPostContent={aboutPostContent}
          setAboutPostContent={setAboutPostContent}
          aboutMediaFiles={aboutMediaFiles}
          setAboutMediaFiles={setAboutMediaFiles}
          aboutPostLoading={aboutPostLoading}
          aboutPostMsg={aboutPostMsg}
          existingAboutPosts={existingAboutPosts}
          editingAboutId={editingAboutId}
          threadSteps={threadSteps}
          handleAddThreadStep={handleAddThreadStep}
          handleRemoveThreadStep={handleRemoveThreadStep}
          handleThreadStepChange={handleThreadStepChange}
          handleThreadFilesChange={handleThreadFilesChange}
          handlePublishOrUpdateAboutPost={handlePublishOrUpdateAboutPost}
          handleStartEditAboutPost={handleStartEditAboutPost}
          resetAboutPostForm={resetAboutPostForm}
          handleDeleteAboutPost={handleDeleteAboutPost}
          handleUpdatePin={handleUpdatePin}
        />

        {/* SECTION 4: PROJECTS MANAGEMENT */}
        <AdminProjects
          darkMode={darkMode}
          title={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          liveUrl={liveUrl}
          setLiveUrl={setLiveUrl}
          tags={tags}
          setTags={setTags}
          highlights={highlights}
          setHighlights={setHighlights}
          setMediaFiles={setMediaFiles}
          loading={loading}
          message={message}
          existingProjects={existingProjects}
          editingProjectId={editingProjectId}
          projectUpdates={projectUpdates}
          handleAddProjectUpdate={handleAddProjectUpdate}
          handleRemoveProjectUpdate={handleRemoveProjectUpdate}
          handleProjectUpdateChange={handleProjectUpdateChange}
          handleProjectUpdateFilesChange={handleProjectUpdateFilesChange}
          handlePublishOrUpdateProject={handlePublishOrUpdateProject}
          handleStartEditProject={handleStartEditProject}
          resetProjectForm={resetProjectForm}
          handleDeleteProject={handleDeleteProject}
        />
      </div>
    </div>
  );
}