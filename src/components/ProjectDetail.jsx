import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ExternalLink, Globe, CheckCircle2, Layers } from 'lucide-react';

export default function ProjectDetail({ project, onBack, darkMode }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const mediaList = project.media || [];

  // Helper to ensure proper bold spacing
  const formatMarkdownText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*{4,}/g, '**')
      .replace(/\*\*\s+/g, '**')
      .replace(/\s+\*\*/g, '**');
  };

  // Custom styling rules for ReactMarkdown elements
  const markdownComponents = {
    p: ({ children }) => (
      <div className={`text-sm leading-relaxed mb-4 whitespace-pre-line ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
        {children}
      </div>
    ),
    strong: ({ children }) => (
      <strong className={`font-extrabold block my-1 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
        {children}
      </strong>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1 mb-4">{children}</ul>
    ),
    li: ({ children }) => (
      <li className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{children}</li>
    ),
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-black text-white' : 'bg-white text-neutral-900'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        
        {/* Navigation Back Button */}
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
            darkMode 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-sky-400' 
              : 'bg-neutral-100 border-neutral-200 text-neutral-800 hover:text-sky-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        {/* Case Study Header */}
        <div className={`space-y-4 border-b pb-8 ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <span className="text-xs uppercase tracking-wider font-bold text-sky-500 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 inline-block">
            {project.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{project.title}</h1>
          
          <div className="text-base leading-relaxed max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {formatMarkdownText(project.description)}
            </ReactMarkdown>
          </div>
          
          {project.liveUrl && (
            <div className="pt-2">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-sky-500/10"
              >
                <Globe className="w-4 h-4" />
                Visit Live Platform
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Media Player Showcase */}
        {mediaList.length > 0 && (
          <div className="space-y-4">
            <div className={`rounded-2xl overflow-hidden border max-h-[480px] flex items-center justify-center shadow-2xl ${
              darkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-100'
            }`}>
              {mediaList[activeMediaIndex].resourceType === 'video' ? (
                <video
                  src={mediaList[activeMediaIndex].url}
                  controls
                  className="w-full max-h-[480px] object-contain"
                />
              ) : (
                <img
                  src={mediaList[activeMediaIndex].url}
                  alt={project.title}
                  className="w-full object-contain max-h-[480px]"
                />
              )}
            </div>

            {/* Thumbnail Navigation */}
            {mediaList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {mediaList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`w-20 h-14 rounded-xl border overflow-hidden flex-shrink-0 transition-all ${
                      activeMediaIndex === idx
                        ? 'border-sky-500 ring-2 ring-sky-500/30 scale-105'
                        : darkMode
                        ? 'border-neutral-800 opacity-60 hover:opacity-100'
                        : 'border-neutral-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.resourceType === 'video' ? (
                      <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${
                        darkMode ? 'bg-neutral-900 text-sky-400' : 'bg-neutral-200 text-sky-600'
                      }`}>
                        PLAY VIDEO
                      </div>
                    ) : (
                      <img src={item.url} alt="thumb" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Thread Updates / Milestones */}
        {project.projectUpdates && project.projectUpdates.length > 0 && (
          <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-sky-500">
              Project Milestones & Updates ({project.projectUpdates.length})
            </h2>

            <div className="space-y-6">
              {project.projectUpdates.map((upd, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-2xl border space-y-4 relative pl-6 border-l-4 border-l-sky-500 ${
                    darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  {upd.title && <h3 className="font-bold text-lg">{upd.title}</h3>}
                  
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    <ReactMarkdown components={markdownComponents}>
                      {formatMarkdownText(upd.description)}
                    </ReactMarkdown>
                  </div>

                  {/* Update Media Showcase */}
                  {upd.media && upd.media.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {upd.media.map((m, mIdx) => (
                        <div key={mIdx} className="rounded-xl overflow-hidden border border-neutral-800 max-h-60 bg-black flex items-center justify-center">
                          {m.resourceType === 'video' ? (
                            <video src={m.url} controls className="w-full max-h-60 object-contain" />
                          ) : (
                            <img src={m.url} alt="Update media" className="w-full max-h-60 object-contain" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Breakdown */}
        {project.highlights && project.highlights.length > 0 && (
          <div className={`p-8 rounded-2xl border space-y-4 ${
            darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-500" />
              Key System Capabilities
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.highlights.map((feature, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm ${
                  darkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack List */}
        {project.tags && project.tags.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider font-bold opacity-60 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border ${
                    darkMode 
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-300' 
                      : 'bg-neutral-100 border-neutral-200 text-neutral-800'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}