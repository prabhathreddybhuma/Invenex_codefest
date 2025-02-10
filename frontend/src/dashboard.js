import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, LayoutDashboard, Warehouse, Package, FileText, 
  Truck, Settings, HelpCircle, TrendingUp, TrendingDown, AlertCircle 
} from 'lucide-react';

// API Configuration
const API_ENDPOINTS = {
  INVENTORY_COUNT: '/api/inventory/count',
  WAREHOUSE_UTILIZATION: '/api/warehouse/utilization',
  WAREHOUSE_OVERVIEW: '/api/warehouse/overview',
  STOCK_ALERTS: '/api/stock/alerts'
};

// Base Card Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-[#1E1E1E] rounded-xl border border-gray-800/50 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-800 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
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
    <div className="flex min-h-screen bg-[#121212]">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="p-6">
          <Header />
          <div className="space-y-6">
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
    <aside className="fixed w-64 h-full bg-[#1E1E1E] border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-8">INVENX</h1>
        
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${item.active 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <item.icon size={20} />
              <span>{item.text}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg">
            <Settings size={20} />
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 rounded-lg">
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
    <header className="flex justify-between items-center mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-96 pl-10 pr-4 py-2 bg-[#2A2A2A] rounded-lg border border-gray-700 text-gray-200 
            focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:bg-gray-800 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] rounded-lg text-gray-400">
          <span>February 10, 2025 at 11:54 PM</span>
        </div>
      </div>
    </header>
  );
};

const StockOverviewGrid = () => {
  const { data: alertsData, loading: alertsLoading } = useDataFetching(API_ENDPOINTS.STOCK_ALERTS);

  return (
    <div className="grid grid-cols-4 gap-6">
      <Card className="col-span-3">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">
            Warehouse Stock Levels by Product
          </h2>
        </CardHeader>
        <CardContent className="h-[480px]">
          <iframe 
            style={{
              background: '#21313C',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 10px 0 rgba(70, 76, 79, .2)',
              width: '100%',
              height: '100%'
            }}
            src="https://charts.mongodb.com/charts-invenx-vtwdbcs/embed/charts?id=50c65100-6dd5-4b9a-b21a-38a9e9f29dcf&maxDataAge=3600&theme=dark&autoRefresh=true"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Stock Alerts</h2>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-lg" />
              ))}
            </div>
          ) : alertsData?.length ? (
            <div className="space-y-4">
              {alertsData.map((alert, index) => (
                <AlertCard key={index} {...alert} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No current stock alerts</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AlertCard = ({ severity, message, timestamp }) => {
  const severityStyles = {
    critical: 'text-red-500 bg-red-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    info: 'text-blue-500 bg-blue-500/10'
  };

  return (
    <div className={`p-4 rounded-lg ${severityStyles[severity]}`}>
      <div className="flex items-start gap-3">
        <AlertCircle size={20} />
        <div>
          <p className="font-medium">{message}</p>
          {timestamp && <p className="text-sm opacity-75 mt-1">{timestamp}</p>}
        </div>
      </div>
    </div>
  );
};

const MetricsGrid = () => {
  const { data: inventoryData, loading: inventoryLoading } = useDataFetching(API_ENDPOINTS.INVENTORY_COUNT);
  const { data: utilizationData, loading: utilizationLoading } = useDataFetching(API_ENDPOINTS.WAREHOUSE_UTILIZATION);

  return (
    <div className="grid grid-cols-2 gap-6">
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
    <Card className="p-6 transition-all hover:border-gray-700/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 mb-1">{title}</h3>
          <div className="text-2xl font-semibold text-white">{value}</div>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Icon className="text-blue-500" size={24} />
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : (
            <TrendingDown size={16} className="text-red-500" />
          )}
          <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
        <h2 className="text-xl font-semibold text-white">Warehouse Overview</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-6">
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
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white">Warehouse {id}</h3>
        <span className="text-gray-400">
          {loading ? 'N/A' : (totalStock ? `WH${id}` : 'N/A')}
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-gray-400 text-sm">Total Stock</span>
          <div className="text-white font-semibold">
            {loading ? 'N/A' : (totalStock ? `${totalStock.toLocaleString()} units` : 'N/A units')}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400 text-sm">Capacity Utilization</span>
          <div className="text-white font-semibold mb-2">
            {loading ? 'N/A' : (capacityUtilization ? `${capacityUtilization}%` : 'N/A%')}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${loading ? 0 : (capacityUtilization || 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;