import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Maximize2, X, Layers } from 'lucide-react';

export default function ProjectCard({ project, darkMode, onViewDetail }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mediaList = project.media || [];

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const currentMedia = mediaList[activeMediaIndex];

  return (
    <>
      <div
        className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          darkMode
            ? 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
            : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
        }`}
      >
        {/* Media Showcase */}
        {mediaList.length > 0 && (
          <div className="mb-6 space-y-3">
            <div
              className={`relative group rounded-xl overflow-hidden border min-h-[300px] max-h-[450px] flex items-center justify-center ${
                darkMode ? 'border-neutral-800 bg-black' : 'border-neutral-200 bg-neutral-100'
              }`}
            >
              {currentMedia.resourceType === 'video' ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="w-full max-h-[450px] object-contain"
                />
              ) : (
                <div 
                  className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => setIsModalOpen(true)}
                >
                  <img
                    src={currentMedia.url}
                    alt={project.title}
                    className="w-full max-h-[450px] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" />
                    Click to Enlarge
                  </div>
                </div>
              )}

              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-sky-500 transition-all opacity-80 hover:opacity-100 shadow-md"
                    title="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white hover:bg-sky-500 transition-all opacity-80 hover:opacity-100 shadow-md"
                    title="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {mediaList.length > 1 && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mediaList.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`w-16 h-12 rounded-lg border overflow-hidden flex-shrink-0 transition-all ${
                        activeMediaIndex === idx
                          ? 'border-sky-500 ring-2 ring-sky-500/30'
                          : darkMode
                          ? 'border-neutral-800 opacity-60 hover:opacity-100'
                          : 'border-neutral-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {item.resourceType === 'video' ? (
                        <div
                          className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${
                            darkMode ? 'bg-neutral-900 text-sky-400' : 'bg-neutral-200 text-sky-600'
                          }`}
                        >
                          VIDEO
                        </div>
                      ) : (
                        <img src={item.url} alt="thumb" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-mono text-neutral-500 whitespace-nowrap">
                  {activeMediaIndex + 1} / {mediaList.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title, Category & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-500 block">
                {project.category}
              </span>
              {project.projectUpdates && project.projectUpdates.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {project.projectUpdates.length} update(s)
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold">{project.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetail(project)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Case Study
            </button>

            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-all ${
                darkMode
                  ? 'bg-neutral-800 hover:bg-sky-500 hover:text-white text-neutral-200 border-neutral-700'
                  : 'bg-neutral-100 hover:bg-sky-500 hover:text-white text-neutral-800 border-neutral-300'
              }`}
            >
              Live Site <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className={`leading-relaxed mb-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.tags &&
            project.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className={`text-xs font-mono px-3 py-1 rounded-md border ${
                  darkMode
                    ? 'bg-neutral-800 text-neutral-300 border-neutral-700/60'
                    : 'bg-white text-neutral-800 border-neutral-300'
                }`}
              >
                {tag}
              </span>
            ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && currentMedia && currentMedia.resourceType === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-neutral-800 text-white hover:bg-rose-500 transition-all"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={currentMedia.url}
            alt={project.title}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}