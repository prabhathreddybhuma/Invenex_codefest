import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Truck,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_ENDPOINTS = {
  AVAILABLE_STORAGE: 'https://invenexcodefest-production.up.railway.app/api/available-storage',
  WAREHOUSES: 'https://invenexcodefest-production.up.railway.app/api/warehouses',
  WAREHOUSE_UTILIZATION: 'https://invenexcodefest-production.up.railway.app/api/warehouse-utilization',
  OVERALL_UTILISATION: 'https://invenexcodefest-production.up.railway.app/api/overall-utilization',
  WAREHOUSE_STOCK: 'https://invenexcodefest-production.up.railway.app/api/warehouse-stock',
  TRANSFER_RATES: 'https://invenexcodefest-production.up.railway.app/api/transfer-rates'
};

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

const Sidebar = () => {
    const menuItems = [
      { icon: LayoutDashboard, text: 'Dashboard', link: '/' },
      { icon: Warehouse, text: 'Warehouse Management', link: '/warehouse', active: true },
      { icon: Package, text: 'Inventory', link: '/inventory' },
      { icon: FileText, text: 'Demand Forecast', link: '/forecast' },
      { icon: Truck, text: 'Inventory Optimisation', link: '/optimisation' }
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
                <ChevronRight 
                  size={16} 
                  className={`arrow-icon ${item.active ? 'visible' : ''}`}
                />
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
              <span>Help Center</span>
            </a>
          </div>
        </div>
      </aside>
    );
  };
  
const WarehouseOverview = () => {
  const { data: statsData, loading: statsLoading } = useDataFetching(API_ENDPOINTS.AVAILABLE_STORAGE);
  const { data: utilizationData, loading: utilizationLoading } = useDataFetching(API_ENDPOINTS.OVERALL_UTILISATION);

  const utilizationHistory = [
    { month: 'Jan', utilization: 65 },
    { month: 'Feb', utilization: 70 },
    { month: 'Mar', utilization: 75 },
    { month: 'Apr', utilization: 68 },
    { month: 'May', utilization: 72 }
  ];

  return (
    <div className="overview-container">
      <div className="metrics-grid">
        <MetricCard
          title="Total Warehouses"
          value="7"
          icon={Warehouse}
          subtitle="Active Facilities"
        />
        <MetricCard
          title="Available Storage"
          value={statsLoading ? 'Loading...' : `${statsData?.overall_available_storage || 'N/A'} slots`}
          icon={Package}
          subtitle="Total Capacity"
        />
        <MetricCard
          title="Overall Utilization"
          value={utilizationLoading ? 'Loading...' : (utilizationData?.overall_utilization_percentage || 'N/A')}
          icon={TrendingUp}
          subtitle="Space Usage"
        />
      </div>

      <div className="utilization-chart-card">
        <h3>Warehouse Capacities</h3>
        <div className="chart-card">
       
        <iframe 
          style={{ 
            background: "#21313C", 
            border: "none", 
            borderRadius: "2px", 
            boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)" 
          }} 
          width="1000" 
          height="500" 
          src="https://charts.mongodb.com/charts-invenx-vtwdbcs/embed/charts?id=44707ead-8aa0-4eb7-b259-dcd6475d1832&maxDataAge=3600&theme=dark&autoRefresh=true"
        ></iframe>
      </div>
      </div>
    </div>
  );
};

const WarehouseDetails = () => {
    // Fetch warehouse details and total stock from separate APIs
    const { data: warehouseData, loading: warehouseLoading, error: warehouseError } = useDataFetching(API_ENDPOINTS.WAREHOUSES);
    const { data: stockData, loading: stockLoading, error: stockError } = useDataFetching(API_ENDPOINTS.WAREHOUSE_STOCK);
  
    if (warehouseLoading || stockLoading) return <p>Loading warehouses...</p>;
    if (warehouseError || stockError) return <p>Error: {warehouseError?.message || stockError?.message}</p>;
  
    // Extract arrays from API responses
    const warehouses = warehouseData.warehouses;
    const warehouseStocks = stockData.warehouse_stock;
  
    return (
      <div className="warehouse-details">
        <div className="warehouse-grid">
          {warehouses.map((warehouse) => {
            // Match the warehouse with its total stock by _id
            const stockEntry = warehouseStocks.find(stock => stock._id === warehouse._id);
            const totalStock = stockEntry ? stockEntry.total_stock : 0;
  
            return (
              <WarehouseCard
                key={warehouse._id}
                name={warehouse.name}
                location={warehouse.location}
                capacity={warehouse.capacity}
                totalStock={totalStock}
                ordering_cost={warehouse.ordering_cost}
              />
            );
          })}
        </div>
      </div>
    );
  };
  const TransferRates = () => {
    const { data: transferData, loading: transferLoading, error: transferError } = useDataFetching(API_ENDPOINTS.TRANSFER_RATES);
  
    if (transferLoading) return <p>Loading transfer rates...</p>;
    if (transferError) return <p>Error: {transferError.message}</p>;
  
    const rates = transferData.transfer_rates;
  
    return (
      <div className="transfer-rates">
        <h3>Warehouse Transfer Rates</h3>
        <table className="transfer-table">
          <thead>
            <tr>
           
              <th>Source Warehouse</th>
              <th>Destination Warehouse</th>
              <th>Transfer Cost</th>
           
            </tr>
          </thead>
          <tbody>
            {rates.map(rate => (
              <tr key={rate._id}>
                <td>{rate.source_warehouse_id}</td>
                <td>{rate.destination_warehouse_id}</td>
                <td>{rate.transfer_cost}</td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

const MetricCard = ({ title, value, subtitle, trend, icon: Icon }) => {
  return (
    <div className="metric-card">
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
    </div>
  );
};

const WarehouseCard = ({ name, location, capacity, totalStock, ordering_cost }) => {
    // If totalStock is not provided, default to 0
    totalStock = totalStock || 0;
    const availableStorage = capacity - totalStock;
  
    return (
      <div className="warehouse-card">
        <div className="warehouse-header">
          <h3 className="warehouse-title">{name}</h3>
          <p className="warehouse-location">{location}</p>
        </div>
        <div className="warehouse-stats">
          <div className="stat-item">
            <span className="stat-label">Total Stock</span>
            <div className="stat-value">{totalStock}</div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Capacity</span>
            <div className="stat-value">{capacity}</div>
          </div>
          <div className="stat-item">
            <span className="stat-label">Available Storage</span>
            <div className="stat-value">{availableStorage}</div>
          </div>
         
        </div>
      </div>
    );
  };
  
  

const WarehouseManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="warehouse-management">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Warehouse Details
          </button>
          <button 
            className={`tab-button ${activeTab === 'rates' ? 'active' : ''}`}
            onClick={() => setActiveTab('rates')}
          >
            Warehouse Transfer Rates
          </button>
        
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && <WarehouseOverview />}
          {activeTab === 'details' && <WarehouseDetails />}
          {activeTab === 'rates' && <TransferRates />}
         
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;
