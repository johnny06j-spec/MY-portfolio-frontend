import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Music, FileText, Image as ImageIcon, Trash2, Edit3, Send, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BLOG_CATEGORIES = ['Dev Journey', 'Lifestyle', 'Thoughts', 'Music & Vibes', 'Resources'];

export default function AdminBlogPosts({ token, darkMode, existingBlogPosts, onRefresh }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dev Journey');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Dev Journey');
    setContent('');
    setMediaFiles([]);
    setAudioFile(null);
    setAudioTitle('');
    setDocFile(null);
    setDocName('');
  };

  const handleStartEdit = (post) => {
    setEditingId(post._id);
    setTitle(post.title || '');
    setCategory(post.category || 'Dev Journey');
    setContent(post.content || '');
    setAudioTitle(post.audio?.title || '');
    setDocName(post.document?.name || '');
    setMediaFiles([]);
    setAudioFile(null);
    setDocFile(null);
    setStatusMsg('');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setStatusMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('content', content);
    if (audioTitle) formData.append('audioTitle', audioTitle);
    if (docName) formData.append('documentName', docName);

    for (let i = 0; i < mediaFiles.length; i++) {
      formData.append('blogMedia', mediaFiles[i]);
    }
    if (audioFile) formData.append('blogAudio', audioFile);
    if (docFile) formData.append('blogDocument', docFile);

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/blog-posts/${editingId}`
        : `${API_BASE_URL}/api/blog-posts`;
      const method = editingId ? 'put' : 'post';

      const res = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setStatusMsg(editingId ? 'Blog post updated!' : 'Blog post published!');
        resetForm();
        onRefresh();
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.error || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/blog-posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingId === id) resetForm();
      onRefresh();
    } catch {
      alert('Failed to delete blog post');
    }
  };

  return (
    <div className="space-y-8">
      {/* Publisher Card */}
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded-2xl border space-y-5 ${
          darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            {editingId ? 'Edit Blog Post' : 'Publish to Blog & Lifestyle'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:underline"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        {statusMsg && (
          <p className="text-sm font-semibold text-sky-500">{statusMsg}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase opacity-70 mb-1">
              Headline / Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Late-night debugging & building my school ERP..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-sky-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase opacity-70 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-sky-500 ${
                darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
              }`}
            >
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase opacity-70 mb-1">
            Post Content (Wrap words in **double asterisks** to bold)
          </label>
          <textarea
            rows="5"
            required
            placeholder="Share your dev journey, lifestyle update, thoughts, or notes..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-sky-500 ${
              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
            }`}
          />
        </div>

        {/* Media Attachments Grid: Photos/Videos, Song/Audio, PDF/Doc */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Photos / Videos */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            darkMode ? 'bg-black/60 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <label className="flex items-center gap-1.5 text-xs font-bold text-sky-500">
              <ImageIcon className="w-4 h-4" /> Photos & Videos
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setMediaFiles(Array.from(e.target.files))}
              className="text-xs w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-sky-500 file:text-white file:font-bold cursor-pointer"
            />
            {mediaFiles.length > 0 && (
              <p className="text-[11px] opacity-70">{mediaFiles.length} file(s) selected</p>
            )}
          </div>

          {/* Song / Audio */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            darkMode ? 'bg-black/60 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
              <Music className="w-4 h-4" /> Attach Song / Audio
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files[0] || null)}
              className="text-xs w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-bold cursor-pointer"
            />
            <input
              type="text"
              placeholder="Song / Track title (optional)"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              className={`w-full px-2.5 py-1 rounded-lg border text-xs ${
                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-black'
              }`}
            />
          </div>

          {/* PDF / Document */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            darkMode ? 'bg-black/60 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <label className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
              <FileText className="w-4 h-4" /> Attach PDF / Doc
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              onChange={(e) => setDocFile(e.target.files[0] || null)}
              className="text-xs w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-rose-500 file:text-white file:font-bold cursor-pointer"
            />
            <input
              type="text"
              placeholder="Document label (optional)"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className={`w-full px-2.5 py-1 rounded-lg border text-xs ${
                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-black'
              }`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-all"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Publishing...' : editingId ? 'Update Blog Post' : 'Publish Blog Post'}
        </button>
      </form>

      {/* Existing Blog Posts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Published Blog Posts ({existingBlogPosts.length})</h3>
        {existingBlogPosts.length === 0 ? (
          <p className="text-sm opacity-60">No blog posts published yet.</p>
        ) : (
          <div className="space-y-3">
            {existingBlogPosts.map((post) => (
              <div
                key={post._id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  darkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                      {post.category}
                    </span>
                    <span className="text-xs opacity-50">
                      {new Date(post.createdAt).toLocaleDateString()} · {post.likes || 0} Likes · {post.views || 0} Views
                    </span>
                  </div>
                  {post.title && <h4 className="font-bold text-sm">{post.title}</h4>}
                  <p className="text-xs opacity-75 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 text-[11px] opacity-60 pt-1">
                    {post.media?.length > 0 && <span>📷 {post.media.length} media</span>}
                    {post.audio?.url && <span>🎵 {post.audio.title || 'Audio'}</span>}
                    {post.document?.url && <span>📄 {post.document.name || 'PDF/Doc'}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(post)}
                    className="p-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post._id)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}