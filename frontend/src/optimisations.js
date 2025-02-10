import React from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  FileText, 
  Truck, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', link: '/', active: true },
    { icon: Warehouse, text: 'Warehouse Management', link: '/warehouse' },
    { icon: Package, text: 'Inventory', link: '/inventory' },
    { icon: FileText, text: 'Demand Forecast', link: '/forecast' },
    { icon: Truck, text: 'Inventory Optimisation', link: '/optimise' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <h1 className="logo">INVENX</h1>
        <nav className="nav-menu">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.text}</span>
            </a>
          ))}
        </nav>
        <div className="bottom-menu">
          <a href="/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </a>
          <a href="/help" className="nav-item">
            <HelpCircle size={20} />
            <span>Info</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

const Optimisation = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        {/* Blank component: add your content here */}
      </div>
    </div>
  );
};

export default Optimisation;
