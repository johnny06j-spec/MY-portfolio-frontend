import React from 'react';
import { UserCheck } from 'lucide-react';

export default function AdminProfileHeader({
  darkMode,
  bioShort,
  setBioShort,
  setAvatarFile,
  setBannerFile,
  headerLoading,
  headerMsg,
  handleUpdateHeaderPhotos
}) {
  return (
    <form onSubmit={handleUpdateHeaderPhotos} className={`p-8 border rounded-2xl space-y-4 ${
      darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
    }`}>
      <h2 className="text-xl font-bold flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-sky-500" />
        Profile Header & Photos
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
  );
}