// Frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../components/AuroraBackground';

export default function Register() {
  const navigate = useNavigate();
  const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const [role, setRole] = useState('User');
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [loading, setLoading] = useState(false);

  const headline = ' Create Your Civix Account';

  // typing effect (small, fast)
  useEffect(() => {
    let i = 0;
    let cancelled = false;

    setTypedText(''); // always start empty

    function typeNext() {
      if (cancelled) return;

      if (i < headline.length) {
        setTypedText(prev => prev + headline.charAt(i));
        i++;
        setTimeout(typeNext, 35); // smooth speed
      }
    }

    typeNext();

    return () => {
      cancelled = true;
    };
  }, []);

  // simple validation, returns array of error messages (empty if ok)
  function validateFormData(form) {
    const errors = [];
    const name = form.full.value?.trim() || '';
    const user = form.user.value?.trim() || '';
    const email = form.email.value?.trim() || '';
    const location = form.location.value?.trim() || '';
    const pass = form.pass.value || '';
    const confirm = form.confirmPass.value || '';

    if (!name) errors.push('Full Name');
    if (!user) errors.push('Username');
    if (!email) errors.push('Email');
    if (!location) errors.push('Location');
    if (!pass) errors.push('Password');
    if (!confirm) errors.push('Confirm Password');
    if (pass && confirm && pass !== confirm) errors.push('Passwords do not match');
    if (pass && pass.length > 0 && pass.length < 6)
      errors.push('Password must be at least 6 characters');

    return errors;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    const form = e.target;
    const errs = validateFormData(form);
    if (errs.length) {
      // show a concise toast for 1 error, richer for multiple
      if (errs.length === 1) {
        toast.error(errs[0]);
      } else {
        toast.error(
          t => (
            <div>
              <div className="font-semibold mb-2">Fix these:</div>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {errs.map((er, idx) => (
                  <li key={idx}>{er}</li>
                ))}
              </ul>
            </div>
          ),
          { duration: 5000 }
        );
      }
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.full.value.trim(),
        username: form.user.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        location: form.location.value.trim(),
        password: form.pass.value,
        role,
      };

      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // server-side 400/409 etc
        const msg = data?.message || 'Registration failed';
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success('Registered successfully — please sign in');
      // optional: store token if backend returns one; here we redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 700);
    } catch (err) {
      console.error('Register error:', err);
      toast.error('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* aurora / bg accents (keeps your previous setup) */}

      <AuroraBackground></AuroraBackground>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl card p-6 md:p-10 flex flex-col md:flex-row gap-6">
          {/* Main form area */}
          <main className="flex-1 min-w-0 md:pr-6">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
              <span className="typing block">{typedText}</span>
            </h1>

            <p className="text-gray-600 mb-6">Help us build a cleaner community.</p>

            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Full Name *</label>
                  <input
                    name="full"
                    required
                    className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Username *</label>
                  <input
                    name="user"
                    required
                    className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Phone (optional)</label>
                  <input
                    name="phone"
                    className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Location *</label>
                  <input
                    name="location"
                    placeholder="City, State or address"
                    required
                    className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                  />
                </div>

                <div className="relative md:col-span-2">
                  <label className="block mb-1 text-sm">Password *</label>
                  <div className="relative">
                    <input
                      name="pass"
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="eye-btn"
                      onClick={() => setShowPass(s => !s)}
                    >
                      {showPass ? (
                        <FaEyeSlash className="text-xl" />
                      ) : (
                        <FaEye className="text-xl" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative md:col-span-2">
                  <label className="block mb-1 text-sm">Confirm Password *</label>
                  <div className="relative">
                    <input
                      name="confirmPass"
                      type={showCPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 transition-transform duration-200"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label={showCPass ? 'Hide confirm password' : 'Show confirm password'}
                      className="eye-btn"
                      onClick={() => setShowCPass(s => !s)}
                    >
                      {showCPass ? (
                        <FaEyeSlash className="text-xl" />
                      ) : (
                        <FaEye className="text-xl" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <CustomSelect
                  label="Role"
                  value={role}
                  onChange={val => setRole(val)}
                  options={['User', 'Volunteer']}
                />
              </div>

              <p className="text-gray-800 mt-6 text-center text-sm">
                Already a User ?{' '}
                <button
                  type='button'
                  onClick={() => navigate('/login')}
                  className="text-cyan-500 font-semibold hover:underline"
                >
                  Login
                </button>
              </p>

              <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </main>

          {/* Right side visual - hidden on small screens */}
          <aside className="hidden md:flex md:w-80 flex-col items-center justify-center p-6 rounded-xl bg-cyan-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/Register.png')] bg-center bg-cover opacity-10 pointer-events-none" />
            <div className="z-10 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-white/80 flex items-center justify-center shadow-md logo-float mb-4">
                <img
                  src="/Register.png"
                  alt="illustration"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <h2 className="text-lg font-extrabold text-center">Join the Movement</h2>
              <p className="text-gray-600 text-center mt-2 max-w-[200px]">
                Cleaner streets start with you.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
