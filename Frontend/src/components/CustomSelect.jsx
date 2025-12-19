import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const priorityColors = {
  Low: 'text-green-700',
  Medium: 'text-yellow-700',
  High: ' text-red-700',
};

export default function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // detect if this select is Priority
  const isPrioritySelect =
    options.includes('Low') &&
    options.includes('Medium') &&
    options.includes('High');

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block mb-1 text-sm text-gray-700 font-medium">
          {label}
        </label>
      )}

      {/* Select box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border-2 p-3 rounded-2xl transition-all duration-200
          ${
            isOpen
              ? 'border-cyan-400 ring-2 ring-cyan-100'
              : 'border-black hover:border-cyan-300'
          }
          ${
            isPrioritySelect && priorityColors[value]
              ? priorityColors[value]
              : 'bg-white text-gray-800'
          }
        `}
      >
        <span>{value}</span>
        <FaChevronDown
          className={`text-sm transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl overflow-hidden">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer text-sm transition-colors
                  ${
                    isPrioritySelect && priorityColors[option]
                      ? `${priorityColors[option]} hover:opacity-90`
                      : value === option
                      ? 'bg-cyan-50 text-cyan-700 font-semibold'
                      : 'text-gray-600 hover:bg-cyan-50 hover:text-cyan-600'
                  }
                `}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
