import React, { useState } from 'react';
import UserManagement from './UserManagement';
import AdminSessionPanel from './AdminSessionPanel';
import Reporting from './Reporting';
import MessagePackageManagement from './MessagePackageManagement';
import ApplicationManagement from './ApplicationManagement';
import CabinManagement from './CabinManagement';
import KChat from './KChat';
import WaitlistManagement from './WaitlistManagement';
import AllCampersList from './AllCampersList';

function AdminPortal() {
  const [activeCategory, setActiveCategory] = useState('Manage');
  const [activeItem, setActiveItem] = useState('Applications');

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Set a default active item when the category changes
    if (category === 'Manage') setActiveItem('Applications');
    if (category === 'Config') setActiveItem('Assign Roles');
    if (category === 'Reports') setActiveItem('Reporting');
  };

  const renderContent = () => {
    const mapping = {
      'Applications': <ApplicationManagement />,
      'Waitlist': <WaitlistManagement />,
      'Assign Cabins': <CabinManagement />,
      'Campers': <AllCampersList />,
      'Assign Roles': <UserManagement />,
      'Sessions': <AdminSessionPanel />,
      'Messaging': <MessagePackageManagement />,
      'KChat': <KChat />,
      'Reporting': <Reporting />,
    };
    return mapping[activeItem] || null; // Return null instead of a message
  };

  const getSubMenuItems = (category) => {
    switch (category) {
      case 'Manage':
        return ['Applications', 'Waitlist', 'Assign Cabins', 'Campers'];
      case 'Config':
        return ['Assign Roles', 'Sessions', 'Messaging', 'KChat'];
      case 'Reports':
        return ['Reporting'];
      default:
        return [];
    }
  };

  return (
    <div className="admin-portal-layout">
      {/* Column 1: Main Categories (Always Visible) */}
      <div className="admin-sidebar">
        <div className={`sidebar-category ${activeCategory === 'Manage' ? 'active' : ''}`} onClick={() => handleCategoryClick('Manage')}><h3>Manage</h3></div>
        <div className={`sidebar-category ${activeCategory === 'Config' ? 'active' : ''}`} onClick={() => handleCategoryClick('Config')}><h3>Config</h3></div>
        <div className={`sidebar-category ${activeCategory === 'Reports' ? 'active' : ''}`} onClick={() => handleCategoryClick('Reports')}><h3>Reports</h3></div>
      </div>
      
      {/* Column 2: Sub-Menu (Visible if a category is selected) */}
      {activeCategory && (
        <div className="admin-submenu">
          {getSubMenuItems(activeCategory).map((item) => (
            <div
              key={item}
              className={`submenu-item ${activeItem === item ? 'active' : ''}`}
              onClick={() => setActiveItem(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Column 3: Main Content */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminPortal;
