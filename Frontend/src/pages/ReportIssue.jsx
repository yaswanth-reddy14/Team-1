import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaHome, FaList } from 'react-icons/fa';

// Leaflet Icon Fixes
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- COMPONENTS ---

const SuccessModal = ({ isOpen, onClose, onNavigateDashboard, onNavigateComplaints }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <FaCheckCircle className="text-green-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Report Submitted</h3>
            <p className="text-sm text-gray-500">Thank you for your contribution!</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          Your issue has been successfully reported to the administration. You can track its status
          in the complaints section.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onNavigateDashboard}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <FaHome /> Go to Dashboard
          </button>
          <button
            onClick={onNavigateComplaints}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white font-medium hover:bg-blue-800 transition-colors"
          >
            <FaList /> View Complaints
          </button>
        </div>
      </div>
    </div>
  );
};

function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
}

// --- MAIN PAGE ---

export default function ReportIssue() {
  const navigate = useNavigate();

  // Form States
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [priority, setPriority] = useState('Select Priority');
  const [issueType, setIssueType] = useState('Select Issue Type');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const removeImage = index => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return updated;
    });
  };

  const resetForm = () => {
    setLocation(null);
    setImages([]);
    setPriority('Select Priority');
    setIssueType('Select Issue Type');
    if (formRef.current) formRef.current.reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- FIXED HANDLESUBMIT ---
  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please login again');
      return;
    }

    // 1. Capture Values
    const title = e.target.title.value.trim();
    const address = e.target.address.value.trim();
    const description = e.target.description.value.trim();

    // 2. VALIDATION (Returns early if invalid, preventing the loading toast)
    if (!title) return toast.error('Issue title is required');
    if (priority === 'Select Priority') return toast.error('Please select priority');
    if (issueType === 'Select Issue Type') return toast.error('Please select issue type');
    if (!address) return toast.error('Address is required');

    // ** Added Description Check **
    if (!description) return toast.error('Please describe the issue');

    if (!location) return toast.error('Please select location on map');
    if (images.length === 0) return toast.error('Please upload at least one image');

    // 3. Prepare Data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('priority', priority);
    formData.append('issueType', issueType);
    formData.append('address', address);
    formData.append('description', description);
    formData.append('location', JSON.stringify(location));
    images.forEach(img => formData.append('images', img));

    // 4. API Call with Toast Management
    let loadingToastId;

    try {
      // Start Loading Toast HERE (only if validation passed)
      loadingToastId = toast.loading('Submitting issue...');

      await axios.post('http://localhost:4000/api/issues/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Success Cleanup
      toast.dismiss(loadingToastId); // Dismiss the specific loading toast
      setShowSuccessModal(true);
      resetForm();
    } catch (err) {
      console.error(err);
      // Error Cleanup
      toast.dismiss(loadingToastId); // Dismiss the loading toast so it doesn't stick
      toast.error(err.response?.data?.message || 'Error reporting issue. Please try again.');
    }
  };

  return (
    <div className="flex flex-col relative">
      <AuroraBackground />
      <Navbar />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onNavigateDashboard={() => navigate('/dashboard')}
        onNavigateComplaints={() => navigate('/community-report')}
      />

      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="max-w-300 mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Report an Issue</h1>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative bg-white/80 rounded-3xl shadow-xl p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          >
            {/* Left Side */}
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-700">Issue Details</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Issue Title *</label>
                <input
                  name="title"
                  type="text"
                  placeholder="Eg: Garbage not collected"
                  className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority *</label>
                <CustomSelect
                  value={priority}
                  onChange={setPriority}
                  options={['Low', 'Medium', 'High']}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Issue Type *</label>
                <CustomSelect
                  value={issueType}
                  onChange={setIssueType}
                  options={['Garbage', 'Road Damage', 'Water Leakage', 'Street Light', 'Other']}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  name="address"
                  type="text"
                  placeholder="street/area, city, state, zip code"
                  className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Choose Images *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 shadow rounded-lg border-2 w-full"
                />
                {images.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="w-24 h-24 rounded-xl overflow-hidden border relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-700">Description and Location</h2>

              <textarea
                name="description"
                rows="5"
                placeholder="Describe the issue in detail..."
                className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 focus:border-cyan-400 focus:ring-cyan-100 outline-none transition"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Select Location on Map</label>
                <div className="h-65 rounded-2xl overflow-hidden border shadow-sm z-0">
                  <MapContainer center={[13.6288, 79.4192]} zoom={12} className="h-full w-full">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution="&copy; CARTO"
                    />
                    <LocationPicker setLocation={setLocation} />
                    {location && <Marker position={location} />}
                  </MapContainer>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click on the map to mark the exact location of the issue.
                </p>
              </div>
            </div>

            <div className="col-span-full flex justify-center mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto sm:min-w-75 px-10 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Submit Issue
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
