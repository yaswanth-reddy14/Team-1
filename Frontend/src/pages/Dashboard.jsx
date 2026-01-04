import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaPlusCircle,
  FaListUl,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import VolunteerLocationModal from '../components/volunteerLocationModal';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';


/* ---------- Stats ---------- */
const stats = [
  { title: 'Total Reports', value: '24', icon: FaExclamationCircle, bgColor: 'bg-blue-200' },
  { title: 'Pending', value: '4', icon: FaClock, bgColor: 'bg-yellow-200' },
  { title: 'In Progress', value: '8', icon: FaClock, bgColor: 'bg-cyan-200' },
  { title: 'Resolved', value: '16', icon: FaCheckCircle, bgColor: 'bg-green-200' },
];

/* ---------- Activity ---------- */
const recentActivity = [
  'Pothole on Main Street resolved',
  'New streetlight issue reported',
  'Garbage dump complaint updated',
  'Illegal parking complaint added',
  'Overflowing drain reported',
  'Road sign damaged',
  'Street cleaning scheduled',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showVolunteerLocationModal, setShowVolunteerLocationModal] = useState(false);

  const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${BACKEND}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        if (user.role === 'Volunteer') {
          if (!user.coordinates || !user.coordinates.lat) {
          setShowVolunteerLocationModal(true);
          }
        }
      }
      catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [BACKEND]);
  const handleSaveLocation = async (coords) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND}/api/auth/update`, 
        { coordinates: coords }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Location updated successfully!");
      setShowVolunteerLocationModal(false); 
    } catch (err) {
      console.error("Failed to save location", err);
      toast.error("Failed to save location.");
    }
  };

  return (
    <>
      <AuroraBackground />

      <div className="min-h-screen relative">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-4 md:mb-10 px-6 lg:p-0">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Track and manage civic issues in your community</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-4 px-6 lg:p-0">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`rounded-xl shadow-sm p-6 flex justify-between ${stat.bgColor}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-lg">
                    <Icon size={24} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-4 px-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>

              <div className="activity-scroll min-h-[88px] h-[clamp(260px,40vh,360px)] overflow-y-auto pr-2 pb-5 snap-y snap-mandatory ">
                <div className="space-y-4">
                  {recentActivity.map((text, idx) => (
                    <div
                      key={idx}
                      className="snap-start bg-white/95 backdrop-blur-md
                                 rounded-2xl px-6 py-5 shadow-md border border-gray-200
                                 min-h-[88px]"
                    >
                      <p className="font-medium text-gray-900">{text}</p>
                      <p className="text-sm text-gray-500 mt-1">{idx + 2} hours ago</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mx-auto w-full sm:w-2/3 md:w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-4 px-6">
                <button
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-black bg-green-400 transition hover:shadow-md"
                  onClick={() => navigate('/report-issue')}
                >
                  <FaPlusCircle />
                  Report New Issue
                </button>

                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-black bg-blue-300 transition  hover:shadow-md">
                  <FaListUl />
                  View All Complaints
                </button>

                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-black bg-teal-400 transition  hover:shadow-md">
                  <FaMapMarkedAlt />
                  Issue Map
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
     {showVolunteerLocationModal && (
        <VolunteerLocationModal
          onClose={() => setShowVolunteerLocationModal(false)}
          onSave={handleSaveLocation} 
        />
      )}
    </>
  );
}
