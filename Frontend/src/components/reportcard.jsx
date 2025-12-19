import axios from "axios";

/**
 * Convert date to "time ago"
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ago`;
};

export default function ReportCard({ report, onRefresh }) {
  const handleUpvote = async () => {
    try {
      await axios.post(
        `/api/community-reports/${report._id}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onRefresh();
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{report.title}</h3>

        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
          {report.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {report.description}
      </p>

      {/* Location & Time */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>📍 {report.location}</span>
        <span>🕒 {timeAgo(report.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-2 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpvote}
            className="flex items-center gap-1 hover:text-blue-600"
          >
            👍 {report.upvotes || 0}
          </button>

          <span>💬 {report.comments?.length || 0}</span>
        </div>

        <button className="border px-3 py-1 rounded-md hover:bg-gray-100">
          Comments
        </button>
      </div>
    </div>
  );
}
