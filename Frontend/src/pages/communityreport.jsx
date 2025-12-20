import React, { useState, useEffect, useRef } from 'react';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../index.css';

const communityreport = () => {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const revealRefs = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: 1,
      icon: '🚗',
      iconBg: 'bg-gray-100',
      title: 'Large pothole on Main Street causing traffic delays',
      description: "There's a massive pothole on Main Street near the intersection with Oak Avenue. It's been there for weeks and is causing serious damage to vehicles. Multiple cars have gotten flat tires.",
      location: 'Main Street & Oak Avenue',
      time: 'in 1 day',
      upvotes: 1,
      comments: 0,
      status: 'Received',
      priority: 'High',
      issueType: 'Infrastructure',
      image: '/pothole.jpg'
    },
    {
      id: 2,
      icon: '💡',
      iconBg: 'bg-yellow-50',
      title: 'Broken streetlight in residential area',
      description: "The streetlight at the corner of Pine Street and 2nd Avenue has been out for over a month. This creates a safety hazard for pedestrians at night.",
      location: 'Pine Street & 2nd Avenue',
      time: 'in 1 day',
      upvotes: 1,
      comments: 0,
      status: 'Received', 
      priority: 'Medium',
      issueType: 'Infrastructure'
    },
    {
      id: 3,
      icon: '🗑️',
      iconBg: 'bg-gray-100',
      title: 'Illegal garbage dump behind shopping center',
      description: "Someone has been dumping large amounts of trash behind the Westfield Shopping Center. It's attracting rats and creating an unsanitary environment.",
      location: 'Westfield Shopping Center, Back Parking Lot',
      time: 'in 1 day',
      upvotes: 1,
      comments: 0,
      status: 'In Progress',
      priority: 'High',
      issueType: 'sanitation'
    },
    {
      id: 4,
      icon: '💧',
      iconBg: 'bg-blue-50',
      title: 'Water leak flooding sidewalk on Elm Street',
      description: "There's a water main leak that's been flooding the sidewalk on Elm Street for the past 3 days. The water is starting to undermine the pavement.",
      location: 'Elm Street between 5th and 6th Ave',
      time: 'in 1 day',
      upvotes: 0,
      comments: 0,
      status: 'Received',
      priority: 'Medium',
      issueType: 'Sanitation'
    }
  ];

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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Community Reports</h2>
                <p className="text-gray-600">View and track community issues</p>
              </div>
              
              <div className="flex gap-4">
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Received</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
                
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>Infrastructure</option>
                  <option>Safety</option>
                  <option>Sanitation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <div 
                key={report.id}
                ref={el => (revealRefs.current[index + 1] = el)}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-0 translate-y-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`${report.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                      {report.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 flex-1 leading-tight text-lg">{report.title}</h3>
                  </div>
                  <span className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full whitespace-nowrap ml-3 flex-shrink-0 shadow-sm">
                    {report.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  {report.description}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-5 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{report.time}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="text-sm font-semibold">{report.upvotes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="text-sm font-semibold">{report.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-700 rounded-lg transition-all font-semibold text-sm hover:shadow-md active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>Comments ({report.comments})</span>
                  </button>
                </div>
                  <button onClick={() =>{
                    setSelectedReport(report);
                    setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md">
                    View Details
                  </button>
              </div>
            ))}
          </div>

  {/* Detailed Report Popup modal */}

     {selectedReport && (
     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

       {/* Popup Card */}
      <div className="bg-gradient-to-br from-sky-100 to-blue-100 w-[85%] max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl shadow-xl relative flex flex-col">

      {/* Close Button */}
      <button aria-label="Close"
        onClick={() => setSelectedReport(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
      >
        ✕
      </button>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <h2 className="text-2xl font-bold">{selectedReport.title}</h2>

        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>⏱ Reported {selectedReport.time}</span>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            {selectedReport.status}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="w-full md:w-[60%] flex flex-col gap-4 overflow-y-auto pr-2">

            {/* Image */}
            <img
              src={selectedReport.image}
              alt="complaint"
              className="w-full h-48 md:h-40 object-cover rounded-xl"
            />

            {/* Details */}
            <div className="bg-white p-4 rounded-lg text-sm space-y-1">
              <h3 className="font-semibold mb-1">Details</h3>
              <p><b>📍 Location:</b> {selectedReport.location}</p>
              <p><b>⏱ Reported:</b> {selectedReport.time}</p>
              <p><b>📌 Priority:</b> {selectedReport.priority}</p>
              <p><b>⚠️ Issue Type:</b> {selectedReport.issueType}</p>
            </div>

            {/* Description */}
            <div className="bg-white p-4 rounded-lg text-sm flex flex-col flex-1">
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-gray-700 leading-relaxed flex-1">
                {selectedReport.description}
              </p>
            </div>
          </div>

          {/* RIGHT – 40%  */}
      <div className="w-full md:w-[40%] flex flex-col gap-4">

            {/* PROGRESS */}
        <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold mb-4 text-center">Progress</h3>
          <div className="relative flex items-center justify-between px-6">
                {[
                  { label: "Received", color: "bg-blue-500" },
                  { label: "In Progress", color: "bg-yellow-500" },
                  { label: "Resolved", color: "bg-green-500" }
                ].map((step, index, arr) => {
                  const activeIndex = ["Received", "In Progress", "Resolved"].indexOf(
                    selectedReport.status
                  );    
                  return (
            <div key={step.label} className="relative flex-1 flex flex-col items-center">
        
                {/* Connecting line (except last) */}
                  {index < arr.length - 1 && (
              <div
                    className={`absolute top-4 left-1/2 h-1 w-full ${
                    index < activeIndex ? arr[index + 1].color : "bg-sky-200"
                    }`}
                  />
                )}

                      {/* Circle */}
                        <div  
                            className={`z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                            index <= activeIndex ? step.color : "bg-sky-200 text-gray-500"
                         }`}
                        >
                          {index + 1}
                        </div>

                      {/* Label */}
                         <div className="mt-2 text-xs text-center whitespace-nowrap">
                            {step.label}
                         </div>
                  </div>
                  );
              })}
            </div>
         </div>

        {/* DISCUSSION */}
        <div className="bg-white p-4 rounded-lg flex flex-col flex-1">
          <h3 className="font-semibold mb-3">
            Discussion ({selectedReport.comments})
          </h3>

          <div className="flex-1 text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </div>

          <textarea
            placeholder="Add your comment..."
            className="text-sm mt-3 resize-none focus:outline-none 
                       w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 
                       focus:border-cyan-400 
                      focus: ring-cyan-100 outline-none transition"
            rows={3}
          />

            <button className="mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Post
            </button>
          </div>

          </div>
        </div>
      </div>
    </div>
  </div>
)}

 </main>

       <Footer />
      </div>
    </>
  );
};

export default communityreport