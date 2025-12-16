// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer';
/**
 * Profile page
 * - Fetches current user from GET /api/auth/me
 * - Shows account info including location
 * - Edit profile (name, phone, location, avatar preview) -> PUT /api/auth/update
 * - Change password -> PUT /api/auth/change-password
 * - Delete account -> DELETE /api/auth/delete
 *
 * Requires backend to implement the routes shown above and return JSON.
 */

export default function Profile() {
  const navigate = useNavigate();
  const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // editing state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    image: "", // dataURL (preview) — optional for prototype
  });
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef(null);

  // password change
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  // fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function fetchMe() {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          // invalid/expired token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please login again.");
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Failed to load profile");
          return;
        }

        const data = await res.json();
        // backend returns { user: {...} } (we support both shapes)
        const u = data.user || data;
        setUser(u);
        // set editing form defaults
        setForm({
          name: u.name || "",
          phone: u.phone || "",
          location: u.location || "",
          image: u.image || "",
        });
        setPreview(u.image || "");
        // store local copy (useful for UI if needed)
        localStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Network error — could not load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [BACKEND, navigate]);

  // input handlers
  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Max 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setForm((s) => ({ ...s, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Save profile (name/phone/location [+ image prototype])
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      navigate("/login");
      return;
    }

    // minimal validation
    if (!form.name?.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone?.trim() || "",
        location: form.location?.trim() || "",
        image: form.image || "",
        // NOTE: backend update route in this project only supports name/phone/location.
        // We keep `image` locally in this prototype. If you want server-side avatars,
        // implement an upload endpoint or save base64 on server with proper limits.
      };

      const res = await fetch(`${BACKEND}/api/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      // success - update UI & localStorage
      const updatedUser = data.user;

setUser(updatedUser);
setPreview(updatedUser.image || "");
localStorage.setItem("user", JSON.stringify(updatedUser));
toast.success("Profile updated");
setEditing(false);
;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Network error — update failed");
    }
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/login");
  };

  // delete account
  const handleDelete = async () => {
    if (!confirm("Delete account permanently? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/api/auth/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.message || "Failed to delete account");
        return;
      }
      toast.success("Account deleted");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/register");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error");
    }
  };

  // password handlers
  const handlePwChange = (e) => setPwForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const resetPwForm = () => setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const validateNewPassword = (pw) => {
    if (!pw || pw.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      navigate("/login");
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    const pwErr = validateNewPassword(newPassword);
    if (pwErr) {
      toast.error(pwErr);
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Failed to change password");
        return;
      }

      toast.success("Password updated");
      resetPwForm();
      setPwOpen(false);
    } catch (err) {
      console.error("Change password error:", err);
      toast.error("Network error");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">
          No profile available.{" "}
          <button className="text-cyan-600 ml-2" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "";

  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="box1 absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply bg-[#00d5ff]" />
        <div className="box2 absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px] translate-x-1/3 translate-y-1/3 mix-blend-multiply bg-[#007bff]" />
      </div>
      <div className="min-h-screen relative">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Top card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-4xl">
                {preview ? (
                  <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                ) : user.image ? (
                  <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-700">
                    {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-3xl font-bold">{user.name || '-'}</h2>
                <p className="text-gray-600">@{user.username || '-'}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditing(s => !s);
                      // ensure form is populated from current user (fresh)
                      setForm({
                        name: user.name || '',
                        phone: user.phone || '',
                        location: user.location || '',
                        image: user.image || '',
                      });
                      setPreview(user.image || '');
                    }}
                    className="bg-cyan-200 px-4 py-1.5 rounded-full shadow"
                  >
                    {editing ? 'Close Editor ✖️' : 'Edit Profile ✏️'}
                  </button>

                  {editing && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 border rounded-full"
                      >
                        Upload Photo
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full font-medium">
                {user.role || 'User'}
              </span>
              {memberSince && (
                <div className="text-sm text-gray-500 mt-2 italic">Member since {memberSince}</div>
              )}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Account info / edit */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-6">Account Information</h3>

              {!editing ? (
                <>
                  <div className="mb-6">
                    <p className="font-semibold">Full Name</p>
                    <p className="text-blue-600 text-lg">{user.name || '-'}</p>
                  </div>

                  <div className="mb-6">
                    <p className="font-semibold">Username</p>
                    <p className="text-blue-600 text-lg">@{user.username || '-'}</p>
                  </div>

                  <div className="mb-6">
                    <p className="font-semibold">Email</p>
                    <p className="text-blue-600 text-lg">{user.email || '-'}</p>
                  </div>

                  <div className="mb-6">
                    <p className="font-semibold">Phone Number</p>
                    <p className="text-blue-600 text-lg">{user.phone || '+91 - not set'}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-blue-600 text-lg">{user.location || '-'}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, State or address"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <p className="block text-sm font-medium mb-1">Profile Photo</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-4xl">
  {(editing ? preview : user.image) ? (
    <img
      src={editing ? preview : user.image}
      alt="avatar"
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-gray-700">
      {(user.name || user.username || "U").charAt(0).toUpperCase()}
    </span>
  )}
</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 border rounded"
                        >
                          Choose File
                        </button>
                        <button
                          onClick={() => {
                            setPreview('');
                            setForm(s => ({ ...s, image: '' }));
                          }}
                          className="px-3 py-1 border rounded"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        // revert to server values
                        setForm({
                          name: user.name || '',
                          phone: user.phone || '',
                          location: user.location || '',
                          image: user.image || '',
                        });
                        setPreview(user.image || '');
                      }}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Security & actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-2xl font-bold mb-6">Security and Privacy</h3>

              <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Change Password</p>
                  <p className="text-gray-600 text-sm">Update your civix account password</p>
                </div>
                <button
                  onClick={() => setPwOpen(s => !s)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full"
                >
                  {pwOpen ? 'Close' : 'Change'}
                </button>
              </div>

              {pwOpen && (
                <div className="mb-4 p-4 border rounded bg-white shadow-sm">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <input
                        name="currentPassword"
                        type="password"
                        value={pwForm.currentPassword}
                        onChange={handlePwChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <input
                        name="newPassword"
                        type="password"
                        value={pwForm.newPassword}
                        onChange={handlePwChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <input
                        name="confirmPassword"
                        type="password"
                        value={pwForm.confirmPassword}
                        onChange={handlePwChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleChangePassword}
                        disabled={pwLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
                      >
                        {pwLoading ? 'Saving...' : 'Save Password'}
                      </button>
                      <button
                        onClick={() => {
                          resetPwForm();
                          setPwOpen(false);
                        }}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Privacy Settings</p>
                  <p className="text-gray-600 text-sm">Manage who can see your profile</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-full">Manage</button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-cyan-300 rounded shadow"
                >
                  🔓 Logout
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-400 text-white rounded shadow"
                >
                  🗑 Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );
}
