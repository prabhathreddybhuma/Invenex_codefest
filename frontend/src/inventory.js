import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  FileText, 
  Truck, 
  Settings, 
  HelpCircle,
  Search,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Boxes
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', link: '/' },
    { icon: Warehouse, text: 'Warehouse Management', link: '/warehouse' },
    { icon: Package, text: 'Inventory', link: '/inventory', active: true },
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

const Header = ({ searchTerm, onSearchChange, selectedCategory, onCategoryChange, categories }) => (
  <div className="header">
    <div className="header-left">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search products, warehouses..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filter-container">
        <Filter size={16} />
        <select 
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div className="date-display">
      <Clock size={20} />
      <span>{new Date().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}</span>
    </div>
  </div>
);

const WarehouseSlot = ({ name, data }) => (
  <div className="warehouse-slot">
    <div className="warehouse-header">
      <span className="warehouse-name">{name}</span>
      {data?.alert && <AlertCircle size={16} className="alert-icon" />}
    </div>
    <div className="slot-metrics">
      <div className="metric">
        <span className="label">Quantity</span>
        <span className="value">{data?.quantity || 'N/A'}</span>
      </div>
    </div>
    
  </div>
);

const ProductStats = ({ icon: Icon, label, value, trend, trendLabel }) => (
  <div className="product-stat">
    <div className="stat-icon">
      <Icon size={20} />
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
    {trend && (
      <div className={`stat-trend ${trend.startsWith('+') ? 'positive' : 'negative'}`}>
        {trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trendLabel}
      </div>
    )}
  </div>
);

const ProductCard = ({ product, stockData }) => {
  const productStock = stockData.find(stock => stock._id === product._id);
  const totalStock = productStock?.total_stock || 0;
  
  // Calculate warehouse distribution
  const warehouseCount = 7;
  const baseQuantity = Math.floor(totalStock / warehouseCount);
  const remainder = totalStock % warehouseCount;
  
  const warehouseQuantities = Array.from({ length: warehouseCount }, (_, index) => ({
    quantity: baseQuantity + (index < remainder ? 1 : 0),
    alert: baseQuantity < 50 // Alert if quantity is low
  }));

  return (
    <div className="product-card">
      <div className="product-header">
        <div className="product-info">
          <div className="product-title">
            <h3>{product.name}</h3>
          </div>
          <span className="product-id">{product._id}</span>
          <span className="product-category">{product.category}</span>
        </div>
        <div className="product-stats">
          <ProductStats 
            icon={Boxes}
            label="Total Stock"
            value={totalStock}
          />
          {product.lead_time && (
            <ProductStats 
              icon={Clock}
              label="Lead Time"
              value={`${product.lead_time} days`}
            />
          )}
        </div>
      </div>
      <div className="warehouse-grid">
        {warehouseQuantities.map((data, index) => (
          <WarehouseSlot 
            key={index} 
            name={`Warehouse ${index + 1}`}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};

const ProductGrid = ({ products, stocks }) => (
  <div className="product-grid">
    {products.map((product) => (
      <ProductCard 
        key={product._id} 
        product={product} 
        stockData={stocks}
      />
    ))}
  </div>
);

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [productStocks, setProductStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, stocksResponse] = await Promise.all([
          fetch('http://localhost:3000/api/products'),
          fetch('http://localhost:3000/api/product-stocks')
        ]);

        if (!productsResponse.ok || !stocksResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const productsData = await productsResponse.json();
        const stocksData = await stocksResponse.json();

        setProducts(productsData.products);
        setProductStocks(stocksData.product_stocks);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = ['All Categories', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product._id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <main className="main-content">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Sidebar />
        <main className="main-content">
          <div className="error">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main-content">
        <Header 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
        <div className="content-wrapper">
          <div className="content-header">
            <div className="title-section">
              <h2>Inventory Overview</h2>
              <p>Real-time stock levels across all warehouses</p>
            </div>
            <div className="action-buttons">
              <button className="secondary-button">
                <Filter size={16} />
                Filter View
              </button>
              <button className="primary-button">
                <Package size={16} />
                Add Product
              </button>
            </div>
          </div>
          <ProductGrid products={filteredProducts} stocks={productStocks} />
        </div>
      </main>
    </div>
  );
};

export default Inventory;