import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, LayoutDashboard, Warehouse, Package, FileText, 
  Truck, Settings, HelpCircle, TrendingUp, TrendingDown, AlertCircle 
} from 'lucide-react';
import './App.css'
// API Configuration
const API_ENDPOINTS = {
  INVENTORY_COUNT: '/api/inventory/count',
  WAREHOUSE_UTILIZATION: '/api/warehouse/utilization',
  WAREHOUSE_OVERVIEW: '/api/warehouse/overview',
  STOCK_ALERTS: '/api/stock/alerts'
};

// Base Card Components
const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

// Custom hook for data fetching
const useDataFetching = (endpoint, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [endpoint, interval]);

  return { data, loading, error };
};

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main-content">
        <div className="main-container">
          <Header />
          <div className="content-grid">
            <StockOverviewGrid />
            <MetricsGrid />
            <WarehouseOverview />
          </div>
        </div>
      </main>
    </div>
  );
};

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', active: true },
    { icon: Warehouse, text: 'Warehouse Management' },
    { icon: Package, text: 'Inventory' },
    { icon: FileText, text: 'Analytics & Reports' },
    { icon: Truck, text: 'Orders & Delivery' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <h1 className="logo">INVENX</h1>
        
        <nav className="nav-menu">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.text}</span>
            </a>
          ))}
        </nav>

        <div className="bottom-menu">
          <a href="#" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </a>
          <a href="#" className="nav-item">
            <HelpCircle size={20} />
            <span>Info</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

const Header = () => {
  return (
    <header className="header">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search anything..."
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="date-display">
          <span>February 10, 2025 at 11:54 PM</span>
        </div>
      </div>
    </header>
  );
};

const StockOverviewGrid = () => {
  const { data: alertsData, loading: alertsLoading } = useDataFetching(API_ENDPOINTS.STOCK_ALERTS);

  return (
    <div className="stock-overview-grid">
      <Card className="chart-card">
        <CardHeader>
          <h2 className="section-title">Warehouse Stock Levels by Product</h2>
        </CardHeader>
        <CardContent className="chart-container">
          <iframe 
            className="chart-frame"
            src="https://charts.mongodb.com/charts-invenx-vtwdbcs/embed/charts?id=50c65100-6dd5-4b9a-b21a-38a9e9f29dcf&maxDataAge=3600&theme=dark&autoRefresh=true"
          />
        </CardContent>
      </Card>
      
      <Card className="alerts-card">
        <CardHeader>
          <h2 className="section-title">Stock Alerts</h2>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="loading-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item" />
              ))}
            </div>
          ) : alertsData?.length ? (
            <div className="alerts-container">
              {alertsData.map((alert, index) => (
                <AlertCard key={index} {...alert} />
              ))}
            </div>
          ) : (
            <div className="no-alerts">No current stock alerts</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AlertCard = ({ severity, message, timestamp }) => {
  return (
    <div className={`alert-card ${severity}`}>
      <div className="alert-content">
        <AlertCircle size={20} />
        <div className="alert-message">
          <p>{message}</p>
          {timestamp && <p className="alert-timestamp">{timestamp}</p>}
        </div>
      </div>
    </div>
  );
};

const MetricsGrid = () => {
  const { data: inventoryData, loading: inventoryLoading } = useDataFetching(API_ENDPOINTS.INVENTORY_COUNT);
  const { data: utilizationData, loading: utilizationLoading } = useDataFetching(API_ENDPOINTS.WAREHOUSE_UTILIZATION);

  return (
    <div className="metrics-grid">
      <MetricCard
        title="Inventory Count"
        value={inventoryLoading ? 'Loading...' : (inventoryData?.count || 'N/A')}
        subtitle="Total Units"
        trend={inventoryData?.trend}
        icon={Package}
      />
      <MetricCard
        title="Warehouse Utilization"
        value={utilizationLoading ? 'Loading...' : (utilizationData?.percentage ? `${utilizationData.percentage}%` : 'N/A')}
        subtitle="Capacity Used"
        trend={utilizationData?.trend}
        icon={Warehouse}
      />
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, trend, icon: Icon }) => {
  return (
    <Card className="metric-card">
      <div className="metric-header">
        <div className="metric-info">
          <h3 className="metric-title">{title}</h3>
          <div className="metric-value">{value}</div>
          <p className="metric-subtitle">{subtitle}</p>
        </div>
        {Icon && (
          <div className="metric-icon">
            <Icon size={24} />
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className={`metric-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className="trend-value">
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </Card>
  );
};

const WarehouseOverview = () => {
  const { data: warehouseData, loading } = useDataFetching(API_ENDPOINTS.WAREHOUSE_OVERVIEW);
  const warehouses = loading ? Array(7).fill({}) : (warehouseData || Array(7).fill({}));

  return (
    <Card>
      <CardHeader>
        <h2 className="section-title">Warehouse Overview</h2>
      </CardHeader>
      <CardContent>
        <div className="warehouse-grid">
          {warehouses.map((warehouse, index) => (
            <WarehouseCard
              key={index}
              id={index + 1}
              totalStock={warehouse.totalStock}
              capacityUtilization={warehouse.capacityUtilization}
              loading={loading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const WarehouseCard = ({ id, totalStock, capacityUtilization, loading }) => {
  return (
    <div className="warehouse-card">
      <div className="warehouse-header">
        <h3 className="warehouse-title">Warehouse {id}</h3>
        <span className="warehouse-id">
          {loading ? 'N/A' : (totalStock ? `WH${id}` : 'N/A')}
        </span>
      </div>
      
      <div className="warehouse-stats">
        <div className="stat-item">
          <span className="stat-label">Total Stock</span>
          <div className="stat-value">
            {loading ? 'N/A' : (totalStock ? `${totalStock.toLocaleString()} units` : 'N/A units')}
          </div>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Capacity Utilization</span>
          <div className="stat-value">
            {loading ? 'N/A' : (capacityUtilization ? `${capacityUtilization}%` : 'N/A%')}
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${loading ? 0 : (capacityUtilization || 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};



export default Dashboard;