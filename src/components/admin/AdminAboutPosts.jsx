import React from 'react';
import { Send, X, PlusCircle, Edit3, Trash2 } from 'lucide-react';

export default function AdminAboutPosts({
  darkMode,
  aboutPostContent,
  setAboutPostContent,
  setAboutMediaFiles,
  aboutPostLoading,
  aboutPostMsg,
  existingAboutPosts,
  editingAboutId,
  threadSteps,
  handleAddThreadStep,
  handleRemoveThreadStep,
  handleThreadStepChange,
  handleThreadFilesChange,
  handlePublishOrUpdateAboutPost,
  handleStartEditAboutPost,
  resetAboutPostForm,
  handleDeleteAboutPost,
  handleUpdatePin,
  aboutMediaFiles
}) {
  return (
    <>
      {/* THREAD PUBLISHER FORM */}
      <form onSubmit={handlePublishOrUpdateAboutPost} className={`p-4 sm:p-8 border rounded-2xl space-y-6 ${
        darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
      }`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-500" />
            {editingAboutId ? 'Edit Post / Thread' : 'Publish X-Style Thread Post'}
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
          <div key={idx} className="relative pl-4 sm:pl-6 border-l-2 border-sky-500/40 space-y-3">
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

      {/* MANAGE ABOUT POSTS LIST */}
      {existingAboutPosts.length > 0 && (
        <div className={`p-4 sm:p-8 border rounded-2xl space-y-4 ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Manage Published Posts ({existingAboutPosts.length})</h3>
            <span className="text-xs opacity-50 hidden sm:inline">Double-click to cycle Pin order</span>
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
                <div className="space-y-2 flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.pinOrder > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                        📌 Pinned #{post.pinOrder}
                      </span>
                    )}
                    <p className="text-sm font-medium line-clamp-2 break-words">{post.content}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs opacity-50 font-medium flex-wrap">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.media?.length || 0} main media file(s)</span>
                    {post.threadItems?.length > 0 && (
                      <span className="text-sky-400">{post.threadItems.length} thread step(s)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/20">
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
                    className="px-3 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 text-xs font-bold transition-all flex items-center gap-1"
                    title="Edit Post"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteAboutPost(post._id)}
                    className="px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}