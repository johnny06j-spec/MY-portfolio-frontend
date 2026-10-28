import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ContactForm({ darkMode }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact`, formData);
      if (response.data.success) {
        setStatus({
          loading: false,
          success: 'Message sent successfully! I will get back to you soon.',
          error: null,
        });
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      setStatus({
        loading: false,
        success: null,
        error: err.response?.data?.error || 'Unable to connect to server.',
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`max-w-lg mx-auto p-6 sm:p-8 rounded-2xl border space-y-4 ${
        darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200 shadow-sm'
      }`}
    >
      {status.success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm font-medium">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{status.success}</span>
        </div>
      )}

      {status.error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{status.error}</span>
        </div>
      )}

      <div>
        <label
          className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
            darkMode ? 'text-neutral-300' : 'text-neutral-700'
          }`}
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Your name"
          className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            darkMode
              ? 'bg-black border-neutral-800 text-white placeholder-neutral-500'
              : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'
          }`}
        />
      </div>

      <div>
        <label
          className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
            darkMode ? 'text-neutral-300' : 'text-neutral-700'
          }`}
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your.email@example.com"
          className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            darkMode
              ? 'bg-black border-neutral-800 text-white placeholder-neutral-500'
              : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'
          }`}
        />
      </div>

      <div>
        <label
          className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
            darkMode ? 'text-neutral-300' : 'text-neutral-700'
          }`}
        >
          Message
        </label>
        <textarea
          name="message"
          rows="4"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Tell me about your project or inquiry..."
          className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            darkMode
              ? 'bg-black border-neutral-800 text-white placeholder-neutral-500'
              : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'
          }`}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={status.loading}
        className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-sky-500/10"
      >
        <Send className="w-4 h-4" />
        {status.loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}