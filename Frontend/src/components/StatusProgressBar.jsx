import React from 'react';
import { FaCheck } from 'react-icons/fa';

export default function StatusProgressBar({ status, isAdmin, onStatusChange }) {
  const statuses = [
    { key: 'received', label: 'Received' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  const getStatusIndex = currentStatus => {
    return statuses.findIndex(s => s.key === currentStatus);
  };

  const currentIndex = getStatusIndex(status);

  const handleStatusClick = statusKey => {
    if (isAdmin && onStatusChange) {
      onStatusChange(statusKey);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-start">
          {statuses.map((s, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isClickable = isAdmin;

            return (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => handleStatusClick(s.key)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-300 text-gray-500'}
                    ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  `}
                >
                  {isActive && <FaCheck className="text-sm" />}
                </button>

                <div className="text-center">
                  <p
                    className={`
                    text-xs font-semibold transition-colors
                    ${isActive ? 'text-gray-900' : 'text-gray-500'}
                  `}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
