
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { 
  ArrowLeft, 
  User, 
  Heart, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  Maximize2,
  X,
  Pin
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AboutDetail({ profile, onBack, darkMode, setDarkMode, setViewAdmin }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/about-posts`);
      setPosts(res.data);
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
      const res = await axios.post(`${API_BASE_URL}/api/about-posts/${postId}/like`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p))
        );
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/about-posts/${postId}/comment`, {
        author: commentAuthor.trim() || 'Visitor',
        text: commentText.trim(),
      });

      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
        );
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
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
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} setViewAdmin={setViewAdmin} />

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
              const isCommentsOpen = openCommentsPostId === post._id;

              return (
                <article
                  key={post._id}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all shadow-lg ${
                    darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  {/* Pinned Badge */}
                  {post.pinOrder > 0 && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-1">
                      <Pin className="w-3.5 h-3.5" />
                      <span>Pinned Post #{post.pinOrder}</span>
                    </div>
                  )}

                  {/* Header Author Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-sky-500/20">
                      J
                    </div>
                    <div>
                      <h2 className="font-bold text-base leading-tight">Johnny</h2>
                      <p className="text-xs text-neutral-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Main Post Content & Media */}
                  <p className={`text-base leading-relaxed whitespace-pre-line ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                    {post.content}
                  </p>
                  {renderMediaCarousel(post.media, mainCarouselId)}

                  {/* Chained Thread Sub-Posts */}
                  {post.threadItems && post.threadItems.length > 0 && (
                    <div className="space-y-6 pt-2">
                      {post.threadItems.map((item, index) => {
                        const threadCarouselId = `carousel-thread-${post._id}-${index}`;
                        return (
                          <div key={index} className="relative pl-6 border-l-2 border-sky-500/30 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 font-extrabold flex items-center justify-center text-xs">
                                {index + 2}
                              </div>
                              <span className="text-xs font-bold opacity-60">Thread part {index + 2}</span>
                            </div>

                            <p className={`text-base leading-relaxed whitespace-pre-line ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                              {item.content}
                            </p>

                            {renderMediaCarousel(item.media, threadCarouselId)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions: Like & Comment Counters */}
                  <div className="flex items-center gap-6 pt-2 border-t border-neutral-800/60 text-sm font-semibold">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-2 text-neutral-400 hover:text-rose-500 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${post.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes || 0} Likes</span>
                    </button>

                    <button
                      onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post._id)}
                      className="flex items-center gap-2 text-neutral-400 hover:text-sky-500 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>

                  {/* Comments Section Drawer */}
                  {isCommentsOpen && (
                    <div className="pt-4 border-t border-neutral-800 space-y-4">
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((c, i) => (
                            <div key={i} className={`p-3 rounded-xl border text-xs space-y-1 ${
                              darkMode ? 'bg-black/60 border-neutral-800' : 'bg-white border-neutral-200'
                            }`}>
                              <p className="font-bold text-sky-400">{c.author}</p>
                              <p className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{c.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-neutral-500 italic">No comments yet. Be the first to comment!</p>
                        )}
                      </div>

                      <form onSubmit={(e) => handleAddComment(post._id, e)} className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your name (optional)"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-sky-500 ${
                            darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                          }`}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-sky-500 ${
                              darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                            }`}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" /> Post
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

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