import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  FileText, 
  Truck, 
  Settings, 
  HelpCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Sidebar = ({ menuItems }) => (
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
          <span>Help</span>
        </a>
      </div>
    </div>
  </aside>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="data-item">
            <span className="dot" style={{ backgroundColor: entry.fill }}></span>
            <span className="label">{entry.name}:</span>
            <span className="value">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DarkDashboard = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', link: '/', active: false },
    { icon: Warehouse, text: 'Warehouse Management', link: '/warehouse', active: false },
    { icon: Package, text: 'Inventory', link: '/inventory', active: false },
    { icon: FileText, text: 'Demand Forecast', link: '/forecast', active: true },
    { icon: Truck, text: 'Inventory Optimisation', link: '/optimise', active: false }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://775d-34-106-55-165.ngrok-free.app/forecast-all');
        const data = await response.json();
        setForecastData(data.results);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch forecast data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = forecastData.map(item => ({
    name: `${item.warehouse_id}-${item.product_id}`,
    Current: item.current_value,
    Forecast: item.forecast_value,
    diff: ((item.forecast_value - item.current_value) / item.current_value * 100).toFixed(1)
  }));

  const uniqueWarehouses = ['all', ...new Set(forecastData.map(item => item.warehouse_id))];

  const filteredData = selectedWarehouse === 'all' 
    ? forecastData 
    : forecastData.filter(item => item.warehouse_id === selectedWarehouse);

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar menuItems={menuItems} />
        <main className="main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading forecast data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Sidebar menuItems={menuItems} />
        <main className="main-content">
          <div className="error-state">
            <AlertCircle size={24} />
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar menuItems={menuItems} />
      <main className="main-content">
        <div className="content-container">
          <div className="dashboard-header">
            <div className="title-section">
              <h1>Demand Forecast</h1>
              <p>Forecast analysis and predictions across warehouses</p>
            </div>
            <div className="actions-section">
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="warehouse-select"
                >
                  {uniqueWarehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>
                      {warehouse === 'all' ? 'All Warehouses' : warehouse}
                    </option>
                  ))}
                </select>
              </div>
              <button className="action-button">
                <Download size={16} />
                Export Data
              </button>
            </div>
          </div>

          <div className="forecast-grid">
            <div className="card chart-card">
              <div className="card-header">
                <h2>Forecast Comparison</h2>
                <div className="card-actions">
                  <span className="date-filter">
                    <Calendar size={16} />
                    Last 30 Days
                  </span>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Forecast" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card table-card">
              <div className="card-header">
                <h2>Detailed Forecast</h2>
                <div className="card-actions">
                  <span className="results-count">{filteredData.length} results</span>
                </div>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Warehouse</th>
                      <th>Product</th>
                      <th>Forecast</th>
                      <th>Change</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const change = ((item.forecast_value - item.current_value) / item.current_value * 100).toFixed(1);
                      return (
                        <tr key={index}>
                          <td>{item.warehouse_id}</td>
                          <td>{item.product_id}</td>
                        
                          <td className="numeric">{item.forecast_value}</td>
                          <td className={`change ${change > 0 ? 'positive' : 'negative'}`}>
                            <TrendingUp size={16} />
                            {change}%
                          </td>
                          <td>{item.forecast_date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DarkDashboard;