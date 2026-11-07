import React from 'react';
import { Mail, CheckCircle2, Trash2 } from 'lucide-react';

export default function AdminMessages({ messagesList, darkMode, handleToggleRead, handleDeleteMessage }) {
  const unreadCount = messagesList.filter((m) => !m.read).length;

  return (
    <div className={`p-8 border rounded-2xl space-y-4 ${
      darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
    }`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Mail className="w-5 h-5 text-sky-500" />
          Incoming Messages ({messagesList.length})
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
          Unread: {unreadCount}
        </span>
      </div>

      {messagesList.length === 0 ? (
        <p className="text-sm opacity-50">No contact messages received yet.</p>
      ) : (
        <div className="space-y-3">
          {messagesList.map((msg) => (
            <div
              key={msg._id}
              className={`p-4 border rounded-xl space-y-2 transition-all ${
                msg.read
                  ? darkMode ? 'bg-black/50 border-neutral-800 opacity-70' : 'bg-white/50 border-neutral-200 opacity-70'
                  : darkMode ? 'bg-black border-sky-500/50 ring-1 ring-sky-500/30' : 'bg-white border-sky-500/50 ring-1 ring-sky-500/30'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    {msg.name}
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" title="Unread Message"></span>
                    )}
                  </h3>
                  <a href={`mailto:${msg.email}`} className="text-xs text-sky-400 hover:underline">
                    {msg.email}
                  </a>
                </div>
                <span className="text-xs opacity-50 font-medium">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm whitespace-pre-line opacity-90 leading-relaxed">{msg.message}</p>

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-neutral-800/40">
                <button
                  onClick={() => handleToggleRead(msg._id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all flex items-center gap-1 ${
                    msg.read
                      ? 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {msg.read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="text-xs px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-semibold hover:bg-rose-500/20 transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}