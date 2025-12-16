import React, { useEffect, useRef } from 'react';
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaPlusCircle,
  FaListUl,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
/* ---------- Stats ---------- */
const stats = [
  {
    title: 'Total Reports',
    value: '24',
    icon: FaExclamationCircle,
    bgColor: 'bg-blue-200',
  },
  {
    title: 'Pending',
    value: '4',
    icon: FaClock,
    bgColor: 'bg-yellow-200',
  },
  {
    title: 'In Progress',
    value: '8',
    icon: FaClock,
    bgColor: 'bg-cyan-200',
  },
  {
    title: 'Resolved',
    value: '16',
    icon: FaCheckCircle,
    bgColor: 'bg-green-200',
  },
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
  const revealRefs = useRef([]);
  const scrollContainerRef = useRef(null);

  /* ---------- Scroll Animation ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ---------- iOS Card Stack Effect ---------- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cards = container.querySelectorAll('.activity-card');
      const scrollTop = container.scrollTop;
      const cardHeight = 100;

      cards.forEach((card, idx) => {
        const cardScrollPosition = idx * cardHeight;
        const diff = scrollTop - cardScrollPosition;

        // Calculate which position this card should be in the visible stack
        const visiblePosition = idx - Math.floor(scrollTop / cardHeight);

        if (diff > 0 && diff < cardHeight) {
          // Card is currently being scrolled away (top card sliding out)
          const progress = diff / cardHeight;
          card.style.transform = `translateY(-${progress * 120}px)`;
          card.style.opacity = `${1 - progress}`;
          card.style.zIndex = `${1000 - idx}`;
        } else if (visiblePosition >= 0 && visiblePosition < 3) {
          // Card is in one of the 3 visible stacked positions
          const yOffset = visiblePosition * 12;
          card.style.transform = `translateY(${yOffset}px)`;
          card.style.opacity = '1';
          card.style.zIndex = `${100 - visiblePosition}`;
        } else if (visiblePosition >= 3) {
          // Card is stacked below (hidden behind the 3rd card)
          card.style.transform = `translateY(${3 * 12}px)`;
          card.style.opacity = '0';
          card.style.zIndex = `${100 - visiblePosition}`;
        } else {
          // Card has scrolled past completely
          card.style.opacity = '0';
          card.style.transform = `translateY(-120px)`;
        }
      });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AuroraBackground />

      <div className="min-h-screen relative">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-10">
          {/* Header */}
          <div
            ref={el => (revealRefs.current[0] = el)}
            className="mb-10 opacity-0 translate-y-6 transition-all duration-700"
          >
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Track and manage civic issues in your community</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  ref={el => (revealRefs.current[i + 1] = el)}
                  className={`rounded-xl shadow-sm p-6 flex justify-between
                             opacity-0 translate-y-6 transition-all duration-700 delay-100 ${stat.bgColor}`}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Recent Activity - iOS Style */}
            <div
              ref={el => (revealRefs.current[10] = el)}
              className="lg:col-span-2 opacity-0 translate-y-6 transition-all duration-700 "
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>

              {/* iOS-style Stacked Cards */}
              <div
                ref={scrollContainerRef}
                className="relative h-[380px] overflow-y-auto custom-scrollbar outline-none"
              >
                <div
                  className='p-2'
                  style={{ height: `${recentActivity.length * 80 + 100}px`, position: 'relative' }}
                >
                  {recentActivity.map((text, idx) => (
                    <div
                      key={idx}
                      className="activity-card absolute left-0 right-0 bg-white/95 backdrop-blur-md
                                 rounded-2xl px-6 py-5 shadow-xl border border-gray-200
                                 transition-all duration-300 ease-out"
                      style={{
                        top: `${idx * 100}px`,
                        width: '100%',
                        transformOrigin: 'center top',
                      }}
                    >
                      <p className="font-medium text-gray-900">{text}</p>
                      <p className="text-sm text-gray-500 mt-1">{idx + 2} hours ago</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              ref={el => (revealRefs.current[11] = el)}
              className="opacity-0 translate-y-6 transition-all duration-700"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-4">
                <ActionButton
                  icon={<FaPlusCircle />}
                  text="Report New Issue"
                  color="bg-green-400"
                />
                <ActionButton icon={<FaListUl />} text="View All Complaints" color="bg-blue-400" />
                <ActionButton icon={<FaMapMarkedAlt />} text="Issue Map" color="bg-teal-400" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

    </>
  );
}

/* ---------- Action Button ---------- */
function ActionButton({ icon, text, color }) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl
                  font-semibold text-black transition transform
                  hover:-translate-y-0.5 hover:shadow-md ${color}`}
    >
      {icon}
      {text}
    </button>
  );
}
