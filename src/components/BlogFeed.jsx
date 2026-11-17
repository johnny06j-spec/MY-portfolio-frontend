import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from './Navbar';
import heroImg from '../assets/hero.png';
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  BarChart2,
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Music,
  FileText,
  Download,
  LogOut
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All', 'Dev Journey', 'Lifestyle', 'Thoughts', 'Music & Vibes', 'Resources'];

const getVisitorId = () => {
  let id = localStorage.getItem('portfolio_visitor_id');
  if (!id) {
    id = 'visitor_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('portfolio_visitor_id', id);
  }
  return id;
};

const decodeGoogleJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function BlogFeed({ profile, onBack, onOpenAbout, darkMode, setDarkMode }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [replyModalPost, setReplyModalPost] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [useGuestMode, setUseGuestMode] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});

  const [googleUser, setGoogleUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('portfolio_google_user') || 'null');
    } catch {
      return null;
    }
  });

  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('liked_blog_posts') || '{}');
    } catch {
      return {};
    }
  });

  const visitorId = getVisitorId();
  const avatarSrc = profile?.avatarUrl || heroImg;

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = decodeGoogleJwt(credentialResponse.credential);
    if (decoded) {
      const userObj = {
        name: decoded.name || decoded.email?.split('@')[0] || 'Visitor',
        email: decoded.email || '',
        picture: decoded.picture || '',
      };
      setGoogleUser(userObj);
      setUseGuestMode(false);
      localStorage.setItem('portfolio_google_user', JSON.stringify(userObj));
    }
  };

  const handleSignOutGoogle = () => {
    setGoogleUser(null);
    localStorage.removeItem('portfolio_google_user');
  };

  const renderFormattedText = (text) => {
    if (!text) return null;

    const cleaned = text
      .replace(/\*{3,}/g, '**')
      .replace(/([a-zA-Z0-9'’])\*\*([^*]+?)\*\*([a-zA-Z0-9])/g, '$1 **$2** $3')
      .replace(/([a-zA-Z0-9'’])\*\*([^*]+?)\*\*/g, '$1 **$2**')
      .replace(/\*\*([^*]+?)\*\*([a-zA-Z0-9])/g, '**$1** $2');

    const parts = cleaned.split(/(\*\*[^*]+?\*\*)/g);

    return (
      <p className={`text-base leading-relaxed mb-3 whitespace-pre-line ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={idx} className={`font-extrabold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                {part.slice(2, -2).trim()}
              </strong>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </p>
    );
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blog-posts`);
      const fetched = res.data || [];
      setPosts(fetched);

      const syncedLikes = { ...likedPostIds };
      fetched.forEach((p) => {
        if (Array.isArray(p.likedBy)) {
          syncedLikes[p._id] = p.likedBy.includes(visitorId);
        }
      });
      setLikedPostIds(syncedLikes);
      localStorage.setItem('liked_blog_posts', JSON.stringify(syncedLikes));

      const viewedSession = JSON.parse(sessionStorage.getItem('viewed_blog_posts') || '{}');
      fetched.forEach(async (p) => {
        if (!viewedSession[p._id]) {
          viewedSession[p._id] = true;
          sessionStorage.setItem('viewed_blog_posts', JSON.stringify(viewedSession));
          try {
            const viewRes = await axios.post(`${API_BASE_URL}/api/blog-posts/${p._id}/view`);
            if (viewRes.data?.success) {
              setPosts((prev) =>
                prev.map((item) => (item._id === p._id ? { ...item, views: viewRes.data.views } : item))
              );
            }
          } catch {
            // Silent fail
          }
        }
      });
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/blog-posts/${postId}/like`, { visitorId });
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p))
        );
        const updatedLikes = { ...likedPostIds, [postId]: res.data.liked };
        setLikedPostIds(updatedLikes);
        localStorage.setItem('liked_blog_posts', JSON.stringify(updatedLikes));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!replyModalPost || !commentText.trim() || submittingReply) return;

    setSubmittingReply(true);
    const targetPostId = replyModalPost._id;
    const resolvedAuthor = googleUser?.name || guestName.trim() || 'Visitor';

    try {
      const res = await axios.post(`${API_BASE_URL}/api/blog-posts/${targetPostId}/comment`, {
        author: resolvedAuthor,
        avatar: googleUser?.picture || '',
        text: commentText.trim(),
      });

      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === targetPostId ? { ...p, comments: res.data.comments } : p))
        );
        setExpandedComments((prev) => ({ ...prev, [targetPostId]: true }));
        setCommentText('');
        setReplyModalPost(null);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const scrollCarousel = (elementId, direction) => {
    const container = document.getElementById(elementId);
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAbout={onOpenAbout}
        onCloseBlog={onBack}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${
            darkMode
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-sky-400'
              : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:text-sky-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-sky-500" /> Johnny's Blog
          </h1>
          <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            My developer journey, lifestyle, music vibes, and shared resources.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                  : darkMode
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading blog posts...</p>
        ) : filteredPosts.length === 0 ? (
          <div className={`p-8 border border-dashed rounded-2xl text-center text-neutral-400 ${darkMode ? 'border-neutral-800' : 'border-neutral-300'}`}>
            No posts in this category yet.
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => {
              const carouselId = `blog-carousel-${post._id}`;
              const isExpanded = !!expandedPosts[post._id];
              const isLongPost = (post.content?.length || 0) > 260;
              const isLiked = !!likedPostIds[post._id];
              const isCommentsExpanded = !!expandedComments[post._id];
              const commentCount = post.comments?.length || 0;

              return (
                <article
                  key={post._id}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all shadow-lg ${
                    darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  {/* Author & Category Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarSrc}
                        alt="Johnny"
                        onError={(e) => { e.target.onerror = null; e.target.src = heroImg; }}
                        className="w-10 h-10 rounded-full object-cover border border-sky-500/40"
                      />
                      <div>
                        <h2 className="font-bold text-base leading-tight">Johnny</h2>
                        <span className="text-xs text-neutral-500">
                          @X_CHAIN_G · {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {post.category}
                    </span>
                  </div>

                  {/* Optional Blog Headline */}
                  {post.title && (
                    <h3 className="text-xl font-extrabold tracking-tight">{post.title}</h3>
                  )}

                  {/* Body Text with Bold Support & See More */}
                  <div>
                    <div className={!isExpanded ? 'line-clamp-4 overflow-hidden' : ''}>
                      {renderFormattedText(post.content)}
                    </div>

                    {isLongPost && (
                      <button
                        type="button"
                        onClick={() => setExpandedPosts((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors"
                      >
                        {isExpanded ? (
                          <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Read more... <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Attached Song / Audio Player */}
                  {post.audio?.url && (
                    <div className={`p-3.5 rounded-2xl border space-y-2 ${
                      darkMode ? 'bg-black/70 border-neutral-800' : 'bg-white border-neutral-200'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-500">
                        <Music className="w-4 h-4" />
                        <span className="truncate">{post.audio.title || 'Attached Track'}</span>
                      </div>
                      <audio controls className="w-full h-9">
                        <source src={post.audio.url} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Attached PDF / Document Card */}
                  {post.document?.url && (
                    <a
                      href={post.document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all group ${
                        darkMode
                          ? 'bg-black/70 border-neutral-800 hover:border-sky-500/50'
                          : 'bg-white border-neutral-200 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{post.document.name || 'Attached Document'}</p>
                          <p className="text-[11px] text-neutral-500">Click to open or download file</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-sky-500 flex-shrink-0" />
                    </a>
                  )}

                  {/* Photos & Videos Carousel */}
                  {post.media && post.media.length > 0 && (
                    <div className="relative group my-2">
                      {post.media.length > 1 && (
                        <button
                          onClick={() => scrollCarousel(carouselId, 'left')}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}

                      <div
                        id={carouselId}
                        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl py-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {post.media.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewMedia(item)}
                            className="snap-center flex-shrink-0 w-64 sm:w-80 aspect-square rounded-2xl overflow-hidden bg-black border border-neutral-800 relative cursor-pointer group/item"
                          >
                            {item.resourceType === 'video' ? (
                              <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.url} alt="Blog media" className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105" />
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-6 h-6" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {post.media.length > 1 && (
                        <button
                          onClick={() => scrollCarousel(carouselId, 'right')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* X-Style Engagement Bar */}
                  <div className={`flex items-center justify-between pt-3 border-t text-xs sm:text-sm font-medium ${
                    darkMode ? 'border-neutral-800/80 text-neutral-400' : 'border-neutral-200 text-neutral-600'
                  }`}>
                    <button
                      type="button"
                      onClick={() => { setReplyModalPost(post); setCommentText(''); }}
                      className="group flex items-center gap-1.5 hover:text-sky-500 transition-colors"
                    >
                      <span className="p-2 rounded-full group-hover:bg-sky-500/10">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                      <span>{commentCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLike(post._id)}
                      className={`group flex items-center gap-1.5 transition-colors ${
                        isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                      }`}
                    >
                      <span className="p-2 rounded-full group-hover:bg-rose-500/10">
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </span>
                      <span>{post.likes || 0}</span>
                    </button>

                    <div className="flex items-center gap-1.5 cursor-default">
                      <span className="p-2 rounded-full">
                        <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                      <span>{post.views || 0}</span>
                    </div>
                  </div>

                  {/* Replies List */}
                  {commentCount > 0 && (
                    <div className={`pt-3 border-t ${darkMode ? 'border-neutral-800/80' : 'border-neutral-200'}`}>
                      <button
                        type="button"
                        onClick={() => setExpandedComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                        className="text-xs font-bold text-sky-500 hover:underline mb-2"
                      >
                        {isCommentsExpanded ? 'Hide replies' : `View ${commentCount} ${commentCount === 1 ? 'reply' : 'replies'}`}
                      </button>

                      {isCommentsExpanded && (
                        <div className="space-y-3 mt-2">
                          {post.comments.map((c, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                              {c.avatar ? (
                                <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-neutral-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                                  {(c.author || 'V').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className={`flex-1 p-3 rounded-2xl border ${
                                darkMode ? 'bg-black/50 border-neutral-800' : 'bg-white border-neutral-200'
                              }`}>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-bold text-xs">{c.author || 'Visitor'}</span>
                                  <span className="text-[11px] text-neutral-500">
                                    · Replying to <span className="text-sky-500">@X_CHAIN_G</span>
                                  </span>
                                </div>
                                <p className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* X-STYLE REPLY COMPOSER MODAL */}
      {replyModalPost && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-12 sm:pt-20 px-4"
          onClick={() => setReplyModalPost(null)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => setReplyModalPost(null)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-800'}`}
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-sky-500">Reply</span>
            </div>

            <form onSubmit={handleAddComment} className="px-4 pb-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <img
                    src={avatarSrc}
                    alt="Johnny"
                    onError={(e) => { e.target.onerror = null; e.target.src = heroImg; }}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className={`w-0.5 flex-1 my-1 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-300'}`}></div>
                </div>

                <div className="flex-1 pb-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-bold">Johnny</span>
                    <span className="text-neutral-500 text-xs">@X_CHAIN_G</span>
                  </div>
                  <p className={`text-sm mt-1 line-clamp-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    {(replyModalPost.title ? `${replyModalPost.title} — ` : '') + replyModalPost.content.replace(/\*\*/g, '')}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Replying to <span className="text-sky-500">@X_CHAIN_G</span>
                  </p>
                </div>
              </div>

              {!googleUser && !useGuestMode ? (
                <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="text-xs">
                    <p className="font-bold">Use your Google name automatically</p>
                    <button
                      type="button"
                      onClick={() => setUseGuestMode(true)}
                      className="text-neutral-500 hover:underline mt-0.5"
                    >
                      Or continue without signing in
                    </button>
                  </div>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setUseGuestMode(true)}
                    theme={darkMode ? 'filled_black' : 'outline'}
                    shape="pill"
                    size="medium"
                  />
                </div>
              ) : (
                <div className="flex gap-3">
                  {googleUser?.picture ? (
                    <img src={googleUser.picture} alt={googleUser.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-500 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                      {(googleUser?.name || guestName.trim() || 'V').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    {googleUser ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-500">Replying as {googleUser.name}</span>
                        <button
                          type="button"
                          onClick={handleSignOutGoogle}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-rose-400"
                        >
                          <LogOut className="w-3 h-3" /> Change
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-sky-500 ${
                          darkMode ? 'bg-neutral-900/70 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-black'
                        }`}
                      />
                    )}

                    <textarea
                      rows="3"
                      required
                      autoFocus
                      placeholder="Post your reply"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className={`w-full bg-transparent text-base sm:text-lg focus:outline-none resize-none ${
                        darkMode ? 'text-white placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className={`pt-3 border-t flex items-center justify-between ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <span className="text-xs text-neutral-500">Everyone can see your reply</span>
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingReply}
                  className="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-sm"
                >
                  {submittingReply ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewMedia(null)}
        >
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-neutral-800 text-white hover:bg-rose-500"
          >
            <X className="w-6 h-6" />
          </button>
          {previewMedia.resourceType === 'video' ? (
            <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-2xl" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={previewMedia.url} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
}