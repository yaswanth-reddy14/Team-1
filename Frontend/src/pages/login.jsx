import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import sweepimg from '/public/sweep.jpg';
import AuroraBackground from '../components/AuroraBackground';
import { IoIosCloseCircleOutline } from 'react-icons/io';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // REMOVED: const [error, setError] = useState("");

  const navigate = useNavigate();
  const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const submit = async e => {
    e.preventDefault();

    // --- FIX START: Specific Validation ---
    if (!identifier.trim()) {
      toast.error('Email or username is required.');
      return;
    }

    if (!password) {
      toast.error('Password is required.');
      return;
    }
    // --- FIX END ---

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 404) {
        toast.error('User not found.');
        setLoading(false);
        return;
      }
      if (res.status === 401) {
        toast.error('Incorrect password.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Login successful!');

      // Navigate based on role if needed, or default to dashboard
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      console.error(err);
      toast.error('Network error — check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <AuroraBackground></AuroraBackground>
      {/* GLASS CARD */}
      <div
        className="relative z-10 w-full max-w-lg p-10
                      bg-white/80 backdrop-blur-xl backdrop-saturate-150
                      rounded-3xl shadow-2xl border border-white/30"
      >
        {/* BRAND */}
        <div className="flex items-center gap-4 mb-8 w-full">
          {/* LOGO */}
          <div
            className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/40 flex   items-center justify-center shadow-md"
          >
            <img src={sweepimg} alt="logo" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-contain" />
          </div>

          {/* TEXT + CLOSE */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              {/* TITLE AREA */}
              <h1 className="font-extrabold text-lg sm:text-2xl leading-tight">
                CIVIX CLEAN STREET
              </h1>

              {/* CLOSE BUTTON */}
              <button onClick={() => navigate('/landing')} className="flex-shrink-0">
                <IoIosCloseCircleOutline className="text-3xl sm:text-4xl text-gray-700 hover:text-red-500 transition" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-1">Report issues. Improve your community.</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Welcome back</h2>
        <p className="mb-6 text-sm">Sign in to continue to your dashboard</p>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-6">
          {/* Identifier */}
          <div>
            <label className="text-sm mb-1 block">Email or username</label>
            <input
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full border-2 p-3 rounded-2xl input-glow focus:border-cyan-400  focus:ring-cyan-100 hover:border-cyan-200 transition-transform duration-200"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className=" text-sm mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                placeholder=""
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 "
              >
                {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
              </button>
            </div>
          </div>


          {/* Submit */}
          <button
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg
                       bg-gradient-to-r from-teal-400 to-blue-500 shadow-lg
                       hover:opacity-90 transition"
          >
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-gray-800 mt-6 text-center text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-cyan-500 font-semibold hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
