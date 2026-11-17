import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from './Navbar';
import heroImg from '../assets/hero.png';
import { 
  ArrowLeft, 
  User, 
  Heart, 
  MessageCircle, 
  BarChart2,
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  X,
  Pin,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getVisitorId = () => {
  let id = localStorage.getItem('portfolio_visitor_id');
  if (!id) {
    id = 'visitor_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('portfolio_visitor_id', id);
  }
  return id;
};

// Decode Google JWT credential payload to extract name, email, and picture
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

export default function AboutDetail({ profile, onBack, darkMode, setDarkMode, setViewAdmin, onCloseAbout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModalPost, setReplyModalPost] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [useGuestMode, setUseGuestMode] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});

  // Saved Google Visitor Profile ({ name, email, picture })
  const [googleUser, setGoogleUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('portfolio_google_user') || 'null');
    } catch {
      return null;
    }
  });

  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('liked_about_posts') || '{}');
    } catch {
      return {};
    }
  });

  const visitorId = getVisitorId();
  const handleCloseView = onCloseAbout || onBack;
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

  const toggleExpandPost = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleCommentsList = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
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
            const boldContent = part.slice(2, -2).trim();
            return (
              <strong key={idx} className={`font-extrabold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                {boldContent}
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
      const res = await axios.get(`${API_BASE_URL}/api/about-posts`);
      const fetchedPosts = res.data || [];
      setPosts(fetchedPosts);

      const syncedLikes = { ...likedPostIds };
      fetchedPosts.forEach((p) => {
        if (Array.isArray(p.likedBy)) {
          syncedLikes[p._id] = p.likedBy.includes(visitorId);
        }
      });
      setLikedPostIds(syncedLikes);
      localStorage.setItem('liked_about_posts', JSON.stringify(syncedLikes));

      const viewedSession = JSON.parse(sessionStorage.getItem('viewed_about_posts') || '{}');
      fetchedPosts.forEach(async (p) => {
        if (!viewedSession[p._id]) {
          viewedSession[p._id] = true;
          sessionStorage.setItem('viewed_about_posts', JSON.stringify(viewedSession));
          try {
            const viewRes = await axios.post(`${API_BASE_URL}/api/about-posts/${p._id}/view`);
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
      console.error('Failed to load about posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/about-posts/${postId}/like`, {
        visitorId,
      });
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p))
        );
        const updatedLikes = { ...likedPostIds, [postId]: res.data.liked };
        setLikedPostIds(updatedLikes);
        localStorage.setItem('liked_about_posts', JSON.stringify(updatedLikes));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleOpenReplyModal = (post) => {
    setReplyModalPost(post);
    setCommentText('');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!replyModalPost || !commentText.trim() || submittingReply) return;

    setSubmittingReply(true);
    const targetPostId = replyModalPost._id;
    const resolvedAuthor = googleUser?.name || guestName.trim() || 'Visitor';

    try {
      const res = await axios.post(`${API_BASE_URL}/api/about-posts/${targetPostId}/comment`, {
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

  const renderMediaCarousel = (media, carouselId) => {
    if (!media || media.length === 0) return null;

    return (
      <div className="relative group my-2">
        {media.length > 1 && (
          <button
            onClick={() => scrollCarousel(carouselId, 'left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          id={carouselId}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setPreviewMedia(item)}
              className="snap-center flex-shrink-0 w-64 sm:w-80 aspect-square rounded-2xl overflow-hidden bg-black border border-neutral-800 relative cursor-pointer group/item"
            >
              {item.resourceType === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt="Media attachment" className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105" />
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {media.length > 1 && (
          <button
            onClick={() => scrollCarousel(carouselId, 'right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setViewAdmin={setViewAdmin} 
        onCloseAbout={handleCloseView}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <button
          onClick={handleCloseView}
          className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${
            darkMode 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-sky-400' 
              : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:text-sky-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-sky-500" /> About Johnny
        </h1>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading feed...</p>
        ) : posts.length === 0 ? (
          <div className={`p-8 border border-dashed rounded-2xl text-center text-neutral-400 ${darkMode ? 'border-neutral-800' : 'border-neutral-300'}`}>
            No posts published yet.
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => {
              const mainCarouselId = `carousel-main-${post._id}`;
              const isExpanded = !!expandedPosts[post._id];
              const isLongPost = (post.content?.length || 0) > 220;
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
                  {post.pinOrder > 0 && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-1">
                      <Pin className="w-3.5 h-3.5" />
                      <span>Pinned Post #{post.pinOrder}</span>
                    </div>
                  )}

                  {/* Header Author Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarSrc}
                      alt="Johnny"
                      onError={(e) => { e.target.onerror = null; e.target.src = heroImg; }}
                      className="w-10 h-10 rounded-full object-cover border border-sky-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-base leading-tight">Johnny</h2>
                        <span className="text-xs text-neutral-500">@X_CHAIN_G · {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Post Content */}
                  <div>
                    <div className={!isExpanded ? 'line-clamp-3 overflow-hidden' : ''}>
                      {renderFormattedText(post.content)}
                    </div>

                    {isLongPost && (
                      <button
                        type="button"
                        onClick={() => toggleExpandPost(post._id)}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            See more... <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {renderMediaCarousel(post.media, mainCarouselId)}

                  {/* Chained Thread Sub-Posts */}
                  {post.threadItems && post.threadItems.length > 0 && (
                    <div className="space-y-6 pt-2">
                      {post.threadItems.map((item, index) => {
                        const threadCarouselId = `carousel-thread-${post._id}-${index}`;
                        const threadKey = `${post._id}-thread-${index}`;
                        const isThreadExpanded = !!expandedPosts[threadKey];
                        const isLongThread = (item.content?.length || 0) > 220;

                        return (
                          <div key={index} className="relative pl-6 border-l-2 border-sky-500/30 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 font-extrabold flex items-center justify-center text-xs">
                                {index + 2}
                              </div>
                              <span className="text-xs font-bold opacity-60">Thread part {index + 2}</span>
                            </div>

                            <div>
                              <div className={!isThreadExpanded ? 'line-clamp-3 overflow-hidden' : ''}>
                                {renderFormattedText(item.content)}
                              </div>

                              {isLongThread && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpandPost(threadKey)}
                                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors"
                                >
                                  {isThreadExpanded ? (
                                    <>
                                      Show less <ChevronUp className="w-3.5 h-3.5" />
                                    </>
                                  ) : (
                                    <>
                                      See more... <ChevronDown className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {renderMediaCarousel(item.media, threadCarouselId)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* X-Style Engagement Bar: Reply, Like Toggle, Visibility/Views */}
                  <div className={`flex items-center justify-between pt-3 border-t text-xs sm:text-sm font-medium ${
                    darkMode ? 'border-neutral-800/80 text-neutral-400' : 'border-neutral-200 text-neutral-600'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleOpenReplyModal(post)}
                      className="group flex items-center gap-1.5 hover:text-sky-500 transition-colors"
                      title="Reply"
                    >
                      <span className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
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
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <span className="p-2 rounded-full group-hover:bg-rose-500/10 transition-colors">
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-125 ${
                          isLiked ? 'fill-rose-500 text-rose-500' : ''
                        }`} />
                      </span>
                      <span>{post.likes || 0}</span>
                    </button>

                    <div
                      className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-default"
                      title="Post Views"
                    >
                      <span className="p-2 rounded-full">
                        <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                      <span>{post.views || 0}</span>
                    </div>
                  </div>

                  {/* Replies Thread Preview */}
                  {commentCount > 0 && (
                    <div className={`pt-3 border-t ${darkMode ? 'border-neutral-800/80' : 'border-neutral-200'}`}>
                      <button
                        type="button"
                        onClick={() => toggleCommentsList(post._id)}
                        className="text-xs font-bold text-sky-500 hover:underline mb-2 flex items-center gap-1"
                      >
                        {isCommentsExpanded
                          ? 'Hide replies'
                          : `View ${commentCount} ${commentCount === 1 ? 'reply' : 'replies'}`}
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
                                <p className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                                  {c.text}
                                </p>
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

      {/* X-STYLE REPLY COMPOSER MODAL WITH 1-CLICK GOOGLE NAME */}
      {replyModalPost && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-12 sm:pt-20 px-4"
          onClick={() => setReplyModalPost(null)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => setReplyModalPost(null)}
                className={`p-2 rounded-full transition-colors ${
                  darkMode ? 'hover:bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-800'
                }`}
                aria-label="Close reply modal"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-sky-500">Reply</span>
            </div>

            <form onSubmit={handleAddComment} className="px-4 pb-4 space-y-3">
              {/* Original Post Context with Vertical Thread Line */}
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
                    <span className="text-neutral-500 text-xs">
                      @X_CHAIN_G · {new Date(replyModalPost.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 line-clamp-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    {replyModalPost.content.replace(/\*\*/g, '')}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Replying to <span className="text-sky-500">@X_CHAIN_G</span>
                  </p>
                </div>
              </div>

              {/* Google Identity Bar or 1-Click Sign-In */}
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
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-500 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                      {(googleUser?.name || guestName.trim() || 'V').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    {googleUser ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-500">
                          Replying as {googleUser.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleSignOutGoogle}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-rose-400"
                          title="Switch account"
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
                          darkMode
                            ? 'bg-neutral-900/70 border-neutral-800 text-white placeholder-neutral-500'
                            : 'bg-neutral-50 border-neutral-200 text-black placeholder-neutral-400'
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

              {/* Bottom Divider & X Rounded Reply Button */}
              <div className={`pt-3 border-t flex items-center justify-between ${
                darkMode ? 'border-neutral-800' : 'border-neutral-200'
              }`}>
                <span className="text-xs text-neutral-500">
                  Everyone can see your reply
                </span>

                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingReply}
                  className="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all"
                >
                  {submittingReply ? 'Replying...' : 'Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Lightbox Preview */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewMedia(null)}
        >
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-neutral-800 text-white hover:bg-rose-500 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {previewMedia.resourceType === 'video' ? (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={previewMedia.url}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}