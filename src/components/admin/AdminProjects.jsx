import React from 'react';
import { PlusCircle, X, Upload, Edit3, Trash2 } from 'lucide-react';

export default function AdminProjects({
  darkMode,
  title,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  liveUrl,
  setLiveUrl,
  tags,
  setTags,
  highlights,
  setHighlights,
  setMediaFiles,
  loading,
  message,
  existingProjects,
  editingProjectId,
  projectUpdates,
  handleAddProjectUpdate,
  handleRemoveProjectUpdate,
  handleProjectUpdateChange,
  handleProjectUpdateFilesChange,
  handlePublishOrUpdateProject,
  handleStartEditProject,
  resetProjectForm,
  handleDeleteProject
}) {
  return (
    <>
      {/* ADD OR EDIT PROJECT FORM */}
      <form onSubmit={handlePublishOrUpdateProject} className={`p-4 sm:p-8 border rounded-2xl space-y-6 ${
        darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
      }`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-500" />
            {editingProjectId ? 'Edit Project' : 'Add New Project'}
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
          <div key={idx} className="relative pl-4 sm:pl-6 border-l-2 border-sky-500/40 space-y-3">
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

      {/* MANAGE PROJECTS LIST (RESPONSIVE FOR ALL SCREEN SIZES) */}
      <div className={`p-4 sm:p-8 border rounded-2xl space-y-4 ${
        darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
      }`}>
        <h2 className="text-xl font-bold">Manage Published Projects ({existingProjects.length})</h2>
        <div className="space-y-3">
          {existingProjects.map((proj) => (
            <div key={proj._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl gap-3 transition-all ${
              darkMode 
                ? `bg-black ${editingProjectId === proj._id ? 'border-sky-500 ring-1 ring-sky-500' : 'border-neutral-800'}`
                : `bg-white ${editingProjectId === proj._id ? 'border-sky-500 ring-1 ring-sky-500' : 'border-neutral-200'}`
            }`}>
              <div className="space-y-1 min-w-0 flex-1 w-full">
                <h3 className="font-bold text-base sm:text-lg break-words">{proj.title}</h3>
                <p className="text-xs opacity-60 leading-relaxed break-words">
                  {proj.category} • {proj.media?.length || 0} Media items
                  {proj.projectUpdates?.length > 0 && ` • ${proj.projectUpdates.length} update card(s)`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/20">
                <button 
                  onClick={() => handleStartEditProject(proj)} 
                  className="px-3 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteProject(proj._id)} 
                  className="px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}