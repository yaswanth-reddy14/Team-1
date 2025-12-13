import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa'; // Ensure you have react-icons installed

export default function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

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
      <label className="block mb-1 text-sm text-gray-700 font-medium">{label}</label>

      {/* The "Box" users click */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border-2 p-3 rounded-2xl bg-white backdrop-blur-sm transition-all duration-200
          ${
            isOpen
              ? 'border-cyan-400 ring-2 ring-cyan-100'
              : 'border-black hover:border-cyan-300'
          }
        `}
      >
        <span className="text-gray-800">{value}</span>
        <FaChevronDown
          className={`text-gray-400 text-sm transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* The Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer text-sm transition-colors
                  ${
                    value === option
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
