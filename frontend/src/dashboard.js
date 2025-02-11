import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, LayoutDashboard, Warehouse, Package, FileText, 
  Truck, Settings, HelpCircle, TrendingUp, TrendingDown, AlertCircle 
} from 'lucide-react';
import './App.css'
// API Configuration
const API_ENDPOINTS = {
  TOTAL_INVENTORY: 'http://localhost:3000/api/total-inventory',
  OVERALL_UTILISATION: 'http://localhost:3000/api/overall-utilization',
   WAREHOUSE_UTILISATION: 'http://localhost:3000/api/warehouse-utilization',
   WAREHOUSE_STOCK: 'http://localhost:3000/api/warehouse-stock',
};
const SAMPLE_ALERTS = [
  {
    severity: 'critical',
    message: 'MacBook Pro stock below threshold in Warehouse WIND01',
    timestamp: '10 minutes ago',
    product_id: 'P10001'
  },
  {
    severity: 'warning',
    message: 'BassBlast Earbuds approaching low stock in Warehouse WIND03',
    timestamp: '25 minutes ago',
    product_id: 'P10002'
  }
];


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
    { 
      icon: LayoutDashboard, 
      text: 'Dashboard', 
      link: '/',
      active: true 
    },
    { 
      icon: Warehouse, 
      text: 'Warehouse Management', 
      link: '/warehouse'
    },
    { 
      icon: Package, 
      text: 'Inventory', 
      link: '/inventory'
    },
    { 
      icon: FileText, 
      text: 'Demand Forecast', 
      link: '/forecast'
    },
    { 
      icon: Truck, 
      text: 'Inventory Optimisation', 
      link: '/optimise'
    }
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
  // Simulate loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading time
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
          {loading ? (
            <div className="loading-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item" />
              ))}
            </div>
          ) : SAMPLE_ALERTS.length ? (
            <div className="alerts-container">
              {SAMPLE_ALERTS.map((alert, index) => (
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

// Modified AlertCard component with enhanced styling
const AlertCard = ({ severity, message, timestamp, product_id }) => {
  return (
    <div className={`alert-card ${severity}`}>
      <div className="alert-content">
        <AlertCircle size={20} />
        <div className="alert-message">
          <p>{message}</p>
          <div className="alert-details">
            {product_id && <span className="product-id">{product_id}</span>}
            {timestamp && <span className="alert-timestamp">{timestamp}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricsGrid = () => {
  const { data: inventoryData, loading: inventoryLoading } = useDataFetching(API_ENDPOINTS.TOTAL_INVENTORY);
  const { data: utilizationData, loading: utilizationLoading } = useDataFetching(API_ENDPOINTS.OVERALL_UTILISATION);

  return (
    <div className="metrics-grid">
      <MetricCard
        title="Inventory Count"
        value={inventoryLoading ? 'Loading...' : (inventoryData?.total_inventory || 'N/A')}
        subtitle="Total Units"
        trend={inventoryData?.trend}
        icon={Package}
      />
      <MetricCard
        title="Warehouse Utilization"
        value={utilizationLoading ? 'Loading...' : (utilizationData?.overall_utilization_percentage || 'N/A')}
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
  const { data: warehouseUtilData, loading } = useDataFetching(API_ENDPOINTS.WAREHOUSE_UTILISATION);
  const { data: warehouseStockData, loading: stockLoading } = useDataFetching(API_ENDPOINTS.WAREHOUSE_STOCK);
  
  // Correct extraction from warehouseStockData
  const warehouseStock = warehouseStockData?.warehouse_stock || [];
  const warehouseUtilization = warehouseUtilData?.warehouse_utilization || [];

  const warehouses = [
    { id: "WIND01" },
    { id: "WIND02" },
    { id: "WIND03" },
    { id: "WIND04" },
    { id: "WIND05" },
    { id: "WIND06" },
    { id: "WIND07" }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="section-title">Warehouse Overview</h2>
      </CardHeader>
      <CardContent>
        <div className="warehouse-grid">
          {warehouses.map((warehouse) => {
            // Find the utilization data for this warehouse.
            const utilization = warehouseUtilization.find(w => w.warehouse_id === warehouse.id);
            // Find the stock data for this warehouse.
            const stockEntry = warehouseStock.find(item => item._id === warehouse.id);
            return (
              <WarehouseCard
                key={warehouse.id}
                id={warehouse.id}
                totalStock={loading || stockLoading ? "Loading..." : stockEntry?.total_stock || "N/A"}
                capacityUtilization={loading ? "Loading..." : utilization?.utilization_percentage || "N/A"}
                loading={loading || stockLoading}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};



const WarehouseCard = ({ id, totalStock, capacityUtilization, loading }) => {
  return (
    <div className="warehouse-card">
      <div className="warehouse-header">
        <h3 className="warehouse-title">{id}</h3>
      
      </div>
      
      <div className="warehouse-stats">
        <div className="stat-item">
          <span className="stat-label">Total Stock</span>
          <div className="stat-value">{loading ? 'N/A' : totalStock}</div>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Capacity Utilization</span>
          <div className="stat-value">{loading ? 'N/A' : capacityUtilization}</div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${loading ? 0 : parseFloat(capacityUtilization) || 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};



export default Dashboard;