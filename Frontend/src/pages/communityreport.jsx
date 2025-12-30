import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusProgressBar from '../components/StatusProgressBar';
import CustomSelect from '../components/CustomSelect';

import {
  FaMapMarkerAlt,
  FaClock,
  FaTimes,
  FaTrash,
  FaThumbsUp,
  FaThumbsDown,
  FaRoad,
  FaTint,
  FaLightbulb,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND = 'http://localhost:4000';

const ISSUE_TYPE_META = {
  Garbage: { icon: FaTrash, color: 'text-green-600', bg: 'bg-green-100' },
  'Road Damage': { icon: FaRoad, color: 'text-gray-700', bg: 'bg-gray-200' },
  'Water Leakage': { icon: FaTint, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Street Light': { icon: FaLightbulb, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  Other: { icon: FaExclamationTriangle, color: 'text-red-600', bg: 'bg-red-100' },
};

const PRIORITY_STYLES = {
  Low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  High: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <FaTrash className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Complaint</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "<span className="font-semibold">{title}</span>"?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportCard = React.memo(({ report, userId, onViewDetails, onVote, isLoading }) => {
  const issueMeta = ISSUE_TYPE_META[report.issueType] || ISSUE_TYPE_META.Other;
  const priorityStyle = PRIORITY_STYLES[report.priority] || PRIORITY_STYLES.Low;
  const IssueIcon = issueMeta.icon;

  const isUpvoted = useMemo(
    () => Array.isArray(report.upvotes) && report.upvotes.includes(userId),
    [report.upvotes, userId]
  );

  const isDownvoted = useMemo(
    () => Array.isArray(report.downvotes) && report.downvotes.includes(userId),
    [report.downvotes, userId]
  );

  const upvoteCount = Array.isArray(report.upvotes) ? report.upvotes.length : 0;
  const downvoteCount = Array.isArray(report.downvotes) ? report.downvotes.length : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-4 items-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${issueMeta.bg}`}>
            <IssueIcon className={`text-xl ${issueMeta.color}`} />
          </div>
          <h3 className="font-semibold text-lg">{report.title}</h3>
        </div>
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${priorityStyle.bg} ${priorityStyle.text}`}
        >
          {report.priority}
        </span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 break-words">{report.description}</p>

      <div className="pt-4 mt-auto">
        <div className="flex flex-wrap gap-4 justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt />
            <span className="truncate max-w-[10rem] sm:max-w-[14rem] md:max-w-[18rem]">
              {report.address}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock />
            {new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <button
            onClick={() => onViewDetails(report)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View Details
          </button>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => onVote(report._id, 'upvote')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold transition-colors border
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                ${
                  isUpvoted
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50 hover:text-green-600'
                }
              `}
            >
              <FaThumbsUp />
              {upvoteCount}
            </button>

            <button
              onClick={() => onVote(report._id, 'downvote')}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold transition-colors border
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                ${
                  isDownvoted
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600'
                }
              `}
            >
              <FaThumbsDown />
              {downvoteCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ReportCard.displayName = 'ReportCard';

export default function CommunityReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [votingLoading, setVotingLoading] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: '',
    issueType: '',
    address: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${BACKEND}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const { user } = await res.json();
          if (user?._id) {
            setUserId(user._id);
            setUserRole(user.role);
          }
        }
      } catch (err) {
        console.error('User fetch error:', err);
        toast.error('Failed to load user information');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${BACKEND}/api/issues`, { headers });
        const data = await res.json();
        setReports(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Reports fetch error:', err);
        toast.error('Failed to load reports');
      }
    };
    loadReports();
  }, []);

  useEffect(() => {
    if (!selectedReport?._id) return;

    const loadComments = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${BACKEND}/api/issues/${selectedReport._id}`, { headers });
        const data = await res.json();
        setComments(data.data?.comments || []);
      } catch (err) {
        console.error('Comments fetch error:', err);
        toast.error('Failed to load comments');
      }
    };

    loadComments();
  }, [selectedReport?._id]);

  useEffect(() => {
    if (!isEditing || !selectedReport) return;

    setEditForm({
      title: selectedReport.title,
      description: selectedReport.description,
      priority: selectedReport.priority,
      issueType: selectedReport.issueType,
      address: selectedReport.address,
    });
  }, [isEditing, selectedReport]);

  const handleStatusUpdate = useCallback(
    async newStatus => {
      if (userRole !== 'Admin' && userRole !== 'Volunteer') {
        toast.error('You cannot edit the progress');
        return;
      }

      const toastId = toast.loading('Updating status...');

      try {
        const res = await fetch(`${BACKEND}/api/issues/${selectedReport._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
          const updated = await res.json();
          setSelectedReport(updated.data);
          setReports(prev => prev.map(r => (r._id === selectedReport._id ? updated.data : r)));
          toast.success('Status updated successfully', { id: toastId });
        } else {
          toast.error('Failed to update status', { id: toastId });
        }
      } catch (err) {
        console.error('Status update error:', err);
        toast.error('Failed to update status', { id: toastId });
      }
    },
    [selectedReport, userRole]
  );
  const handleEditSave = async () => {
    const res = await fetch(`${BACKEND}/api/issues/${selectedReport._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(editForm),
    });

    if (!res.ok) {
      toast.error('Failed to update complaint');
      return;
    }

    const updated = await res.json();

    setReports(prev => prev.map(r => (r._id === updated.data._id ? updated.data : r)));

    setSelectedReport(updated.data);
    setIsEditing(false);
    toast.success('Complaint updated');
  };

  const addComment = useCallback(async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const toastId = toast.loading('Posting comment...');

    try {
      const res = await fetch(`${BACKEND}/api/issues/${selectedReport._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setNewComment('');
        toast.success('Comment posted successfully', { id: toastId });
      } else {
        toast.error('Failed to post comment', { id: toastId });
      }
    } catch (err) {
      console.error('Comment error:', err);
      toast.error('Failed to post comment', { id: toastId });
    }
  }, [newComment, selectedReport]);

  const handleVote = useCallback(
    async (reportId, voteType) => {
      if (!userId) {
        toast.error('Please login to vote');
        return;
      }
      if (votingLoading[reportId]) return;

      setVotingLoading(prev => ({ ...prev, [reportId]: true }));

      try {
        const res = await fetch(`${BACKEND}/api/issues/${reportId}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ voteType }),
        });

        if (!res.ok) {
          toast.error('Failed to register vote');
          return;
        }

        const updated = await res.json();
        setReports(prev => prev.map(r => (r._id === reportId ? updated.data : r)));

        if (selectedReport?._id === reportId) {
          setSelectedReport(updated.data);
        }

        toast.success(voteType === 'upvote' ? 'Upvoted!' : 'Downvoted!');
      } catch (err) {
        console.error('Vote error:', err);
        toast.error('Failed to register vote');
      } finally {
        setVotingLoading(prev => ({ ...prev, [reportId]: false }));
      }
    },
    [userId, votingLoading, selectedReport]
  );

  const confirmDelete = useCallback(async () => {
    setShowDeleteModal(false);
    const toastId = toast.loading('Deleting complaint...');

    try {
      const res = await fetch(`${BACKEND}/api/issues/${selectedReport._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (res.ok) {
        setReports(prev => prev.filter(r => r._id !== selectedReport._id));
        setSelectedReport(null);
        toast.success('Complaint deleted successfully', { id: toastId });
      } else {
        toast.error('Failed to delete complaint', { id: toastId });
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete complaint', { id: toastId });
    }
  }, [selectedReport]);

  const canEdit = selectedReport && selectedReport.createdBy?._id === userId;

  const canDelete = selectedReport && selectedReport.createdBy?._id === userId;

  const isUpvoted = useMemo(
    () =>
      selectedReport &&
      Array.isArray(selectedReport.upvotes) &&
      selectedReport.upvotes.includes(userId),
    [selectedReport, userId]
  );

  const isDownvoted = useMemo(
    () =>
      selectedReport &&
      Array.isArray(selectedReport.downvotes) &&
      selectedReport.downvotes.includes(userId),
    [selectedReport, userId]
  );

    const filteredReports = useMemo(() => {
      if (viewMode === 'mine') {
        return reports.filter(r => r.createdBy?._id === userId);
      }
      return reports;
    }, [reports, viewMode, userId]);

  return (
      <div>
        <AuroraBackground />
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-10 relative">
          <div className="flex items-center justify-between mb-8 px-6">
            <h2 className="text-3xl font-bold">Community Reports</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold border
        ${
          viewMode === 'all'
            ? 'bg-blue-600 text-white border-blue-700'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
              >
                All Reports
              </button>

              <button
                onClick={() => setViewMode('mine')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold border
        ${
          viewMode === 'mine'
            ? 'bg-blue-600 text-white border-blue-700'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
              >
                My Reports
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-6">
            {filteredReports.map(report => (
              <ReportCard
                key={report._id}
                report={report}
                userId={userId}
                onViewDetails={setSelectedReport}
                onVote={handleVote}
                isLoading={votingLoading[report._id]}
              />
            ))}
          </div>
        </main>

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title={selectedReport?.title}
        />

        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4">
            <div className="bg-white w-full max-w-6xl rounded-lg md:rounded-xl overflow-hidden flex flex-col shadow-2xl max-h-[95vh] md:max-h-[90vh]">
              <div className="flex justify-between items-center p-3 md:p-4 border-b bg-white shrink-0">
                <div className="flex flex-col gap-2 mb-2">
                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <label>Edit Title</label>
                      <input
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="text-lg md:text-xl font-bold border-b-3 border-blue-400  focus:outline-none"
                      />
                    </div>
                  ) : (
                    <h2 className="text-lg md:text-xl font-bold truncate pr-4">
                      {selectedReport.title}
                    </h2>
                  )}

                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <label>Edit Priority</label>
                      <CustomSelect
                        options={PRIORITY_OPTIONS}
                        value={editForm.priority}
                        onChange={value => setEditForm(prev => ({ ...prev, priority: value }))}
                      />
                    </div>
                  ) : (
                    <span
                      className={`inline-block w-fit px-3 py-1 text-xs rounded-full font-semibold
        ${PRIORITY_STYLES[selectedReport.priority]?.bg}
        ${PRIORITY_STYLES[selectedReport.priority]?.text}
        ${PRIORITY_STYLES[selectedReport.priority]?.border}
      `}
                    >
                      {selectedReport.priority}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditSave}
                        className="px-3 py-1 md:px-4 md:py-1.5 rounded-md bg-green-600 text-white text-xs md:text-sm font-semibold hover:bg-green-700"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            title: selectedReport.title,
                            description: selectedReport.description,
                            priority: selectedReport.priority,
                            issueType: selectedReport.issueType,
                            address: selectedReport.address,
                          });
                        }}
                        className="px-3 py-1 md:px-4 md:py-1.5 rounded-md bg-gray-400 text-white text-xs md:text-sm font-semibold hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {canEdit && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1 md:px-4 md:py-1.5 rounded-md bg-blue-600 text-white text-xs md:text-sm font-semibold hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-3 py-1 md:px-4 md:py-1.5 rounded-md bg-red-600 text-white text-xs md:text-sm font-semibold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes className="text-gray-600 text-lg" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gray-50 border border-gray-400 rounded-xl p-3 md:p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm md:text-base">Progress Status</h3>
                        <StatusProgressBar
                          status={selectedReport.status}
                          isAdmin={userRole === 'Admin' || userRole == 'Volunteer'}
                          onStatusChange={handleStatusUpdate}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 md:gap-4">
                      <button
                        onClick={() => handleVote(selectedReport._id, 'upvote')}
                        disabled={votingLoading[selectedReport._id]}
                        className={`flex-1 flex justify-center gap-1 md:gap-2 items-center px-2 py-2 md:px-6 rounded-lg font-bold text-xs md:text-sm border border-gray-400
                        ${votingLoading[selectedReport._id] ? 'opacity-50 cursor-not-allowed' : ''}
                        ${
                          isUpvoted
                            ? 'bg-green-600 text-white border-green-700'
                            : 'bg-white text-gray-700 hover:border-green-400 hover:text-green-600'
                        }`}
                      >
                        <FaThumbsUp />
                        <span>Up ({selectedReport.upvotes?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => handleVote(selectedReport._id, 'downvote')}
                        disabled={votingLoading[selectedReport._id]}
                        className={`flex-1 flex justify-center gap-1 md:gap-2 items-center px-2 py-2 md:px-6 rounded-lg font-bold text-xs md:text-sm border border-gray-400
                        ${votingLoading[selectedReport._id] ? 'opacity-50 cursor-not-allowed' : ''}
                        ${
                          isDownvoted
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-white text-gray-700 hover:border-red-400 hover:text-red-600'
                        }`}
                      >
                        <FaThumbsDown />
                        <span>Down ({selectedReport.downvotes?.length || 0})</span>
                      </button>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-400">
                      {isEditing ? (
                        <div className="space-y-3">
                          <label className="mb-2">Edit Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={e =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            className="w-full border-3 border-blue-400 p-2 rounded-lg"
                            rows={4}
                          />
                        </div>
                      ) : (
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed break-words">
                          {selectedReport.description}
                        </p>
                      )}
                    </div>

                    {selectedReport.images?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        {selectedReport.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            className="h-32 md:h-48 w-full object-cover rounded-lg border border-gray-400"
                            alt="Evidence"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {selectedReport.location && (
                      <div className="rounded-xl overflow-hidden border border-gray-400 h-48 md:h-64 relative z-0">
                        <MapContainer
                          center={[
                            Number(selectedReport.location.lat),
                            Number(selectedReport.location.lng),
                          ]}
                          zoom={15}
                          className="h-full w-full"
                          scrollWheelZoom={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={[
                              Number(selectedReport.location.lat),
                              Number(selectedReport.location.lng),
                            ]}
                          />
                        </MapContainer>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-400 flex flex-col h-64 md:h-auto">
                      <h3 className="font-semibold mb-2 md:mb-4 border-b pb-2 text-sm md:text-base">
                        Discussion
                      </h3>

                      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar">
                        {comments.length > 0 ? (
                          comments.map(c => (
                            <div
                              key={c._id}
                              className="bg-white p-2 md:p-3 rounded-lg border border-gray-400 text-xs md:text-sm break-words"
                            >
                              <div className="font-bold text-xs mb-0.5 text-blue-600">
                                {c.user?.name || 'Anonymous'}
                              </div>
                              <p className="text-gray-700">{c.text}</p>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400 text-xs md:text-sm italic">
                              No comments yet
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 w-full items-center">
                        <input
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && addComment()}
                          className="flex-1 min-w-0 border border-gray-400 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type a comment..."
                        />
                        <button
                          onClick={addComment}
                          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
  );
}
