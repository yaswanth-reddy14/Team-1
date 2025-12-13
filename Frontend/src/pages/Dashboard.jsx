import React from 'react';
import Navbar from '../components/Navbar';
export default function Dashboard(){
    const complaints = [
      {
        title: 'Total',
        count: 0,
        bgClass: 'bg-blue-100',
      },
      {
        title: 'In Progess',
        count: 0,
        bgClass: 'bg-cyan-100',
      },
      {
        title: 'Pending',
        count: 0,
        bgClass: 'bg-amber-100',
      },
      {
        title: 'Resolved',
        count: 0,
        bgClass: 'bg-green-100',
      },
    ];
    return (
      <div className="min-h-screen">
        <Navbar />
        <div>
          <div className="m-6 p-6 flex justify-around gap-4 ">
            {complaints.map((card, index) => (
              <div className={`p-5 ${card.bgClass} rounded rounded-2xl`}>
                <p className='mt-3 text-xl '>{card.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}