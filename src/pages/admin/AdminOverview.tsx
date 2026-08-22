import React from 'react';

const AdminOverview: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">Welcome to the Admin Dashboard. Select an option from the sidebar to manage the platform.</p>
      </div>
    </div>
  );
};

export default AdminOverview;
