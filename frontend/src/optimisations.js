import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  FileText, 
  Truck, 
  Settings, 
  HelpCircle,
  ArrowRight,
  Loader,
  MoveRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', link: '/'},
    { icon: Warehouse, text: 'Warehouse Management', link: '/warehouse' },
    { icon: Package, text: 'Inventory', link: '/inventory' },
    { icon: FileText, text: 'Demand Forecast', link: '/forecast' },
    { icon: Truck, text: 'Inventory Optimisation', link: '/optimise', active: true }
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
            <span>Help</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

const ProductOptimizationCard = ({ product, transfers, externalOrders }) => (
  <div className="product-optimization-card">
    <div className="product-header">
      <div className="product-icon">
        <Package size={24} />
      </div>
      <div className="product-info">
        <h3>{product}</h3>
        <span className="optimization-status">
          <TrendingUp size={16} />
          Optimization Available
        </span>
      </div>
    </div>
    
    <div className="transfers-section">
      {transfers.length > 0 && (
        <div className="transfer-group">
          <h4>Internal Transfers</h4>
          {transfers.map((transfer, index) => (
            <div key={index} className="transfer-item">
              <div className="transfer-route">
                <span className="warehouse">{transfer.from}</span>
                <MoveRight size={16} />
                <span className="warehouse">{transfer.to}</span>
              </div>
              <div className="transfer-quantity">
                {transfer.quantity} units
              </div>
            </div>
          ))}
        </div>
      )}
      
      {externalOrders.length > 0 && (
        <div className="transfer-group">
          <h4>External Orders</h4>
          {externalOrders.map((order, index) => (
            <div key={index} className="transfer-item external">
              <div className="transfer-route">
                <span className="warehouse">External Supplier</span>
                <MoveRight size={16} />
                <span className="warehouse">{order.from}</span>
              </div>
              <div className="transfer-quantity">
                {order.quantity} units
              </div>
            </div>
          ))}
        </div>
      )}
      
      {transfers.length === 0 && externalOrders.length === 0 && (
        <div className="no-transfers">
          <AlertCircle size={20} />
          No optimization needed
        </div>
      )}
    </div>
    
    
  </div>
);

const Optimisation = () => {
  const [transferData, setTransferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransferData();
  }, []);

  const fetchTransferData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://inventory-optimisation-pulp-production.up.railway.app/inventory/optimization',
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setTransferData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load transfer recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const processProductTransfers = () => {
    if (!transferData) return [];

    const productMap = new Map();

    Object.entries(transferData.transfer_recommendations).forEach(([key, value]) => {
      const matches = key.match(/\('([^']+)', '([^']+)', '([^']+)'\)/);
      if (matches) {
        const [_, product, from, to] = matches;
        
        if (!productMap.has(product)) {
          productMap.set(product, { transfers: [], externalOrders: [] });
        }
        
        const productData = productMap.get(product);
        
        if (to === 'EXTERNAL') {
          const quantity = parseInt(value.match(/Order (\d+) units/)[1]);
          productData.externalOrders.push({ from, quantity });
        } else {
          productData.transfers.push({ from, to, quantity: value });
        }
      }
    });

    return Array.from(productMap.entries()).map(([product, data]) => ({
      product,
      ...data
    }));
  };

  const productData = processProductTransfers();

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <div className="loading-state">
            <Loader className="spinner" />
            <p>Loading optimization recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <div className="error-state">
            <AlertCircle size={24} />
            <p>{error}</p>
            <button onClick={fetchTransferData} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          <div className="header">
            <h1>Inventory Optimization</h1>
            <p>Smart transfer recommendations for optimal stock distribution</p>
          </div>

          <div className="products-grid">
            {productData.map((item, index) => (
              <ProductOptimizationCard
                key={index}
                product={item.product}
                transfers={item.transfers}
                externalOrders={item.externalOrders}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimisation;
