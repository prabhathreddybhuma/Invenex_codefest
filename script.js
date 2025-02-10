// Configuration for API endpoints
const API_ENDPOINTS = {
    INVENTORY_COUNT: '/api/total-inventory',
    INVENTORY_VALUE: '/api/inventory/value',
    TURNOVER_RATE: '/api/inventory/turnover',
    WAREHOUSE_UTILIZATION: '/api/warehouse/utilization',
    STOCK_ALERTS: '/api/inventory/alerts',
    WAREHOUSE_OVERVIEW: '/api/warehouse/overview'
};

// Utility function for fetching data with error handling
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
}

// Update real-time stock statistics
async function updateStockStatistics() {
    try {
        const [
            inventoryCount,
            inventoryValue,
            turnoverRate,
            warehouseUtilization
        ] = await Promise.all([
            fetchData(API_ENDPOINTS.INVENTORY_COUNT),
            fetchData(API_ENDPOINTS.INVENTORY_VALUE),
            fetchData(API_ENDPOINTS.TURNOVER_RATE),
            fetchData(API_ENDPOINTS.WAREHOUSE_UTILIZATION)
        ]);

        // Update Inventory Count
        updateStatisticElement(
            'inventoryCountValue', 
            'inventoryCountTrend', 
            inventoryCount, 
            value => value.toLocaleString(),
            'units'
        );

        // Update Inventory Value
        updateStatisticElement(
            'inventoryValueValue', 
            'inventoryValueTrend', 
            inventoryValue, 
            value => `$${value.toLocaleString()}`,
            'total value'
        );

        // Update Turnover Rate
        updateStatisticElement(
            'turnoverRateValue', 
            'turnoverRateTrend', 
            turnoverRate, 
            value => `${value.toFixed(2)}x`,
            'inventory turns'
        );

        // Update Warehouse Utilization
        updateStatisticElement(
            'warehouseUtilizationValue', 
            'warehouseUtilizationTrend', 
            warehouseUtilization, 
            value => `${value.toFixed(1)}%`,
            'capacity used'
        );

    } catch (error) {
        console.error('Error updating stock statistics:', error);
    }
}

// Helper function to update statistic elements
function updateStatisticElement(valueElementId, trendElementId, data, formatValue, unit) {
    const valueElement = document.getElementById(valueElementId);
    const trendElement = document.getElementById(trendElementId);

    if (data) {
        valueElement.textContent = formatValue(data.value);
        
        trendElement.textContent = `${data.trend > 0 ? '+' : ''}${data.trend.toFixed(1)}%`;
        trendElement.classList.remove('positive', 'negative');
        trendElement.classList.add(data.trend >= 0 ? 'positive' : 'negative');
    } else {
        valueElement.textContent = 'N/A';
        trendElement.textContent = 'N/A';
    }
}

// Update Stock Alerts
async function updateStockAlerts() {
    try {
        const alerts = await fetchData(API_ENDPOINTS.STOCK_ALERTS);
        const alertsList = document.getElementById('stockAlertsList');
        
        // Clear previous alerts
        alertsList.innerHTML = '';

        if (alerts && alerts.length) {
            alerts.forEach(alert => {
                const alertElement = document.createElement('div');
                alertElement.className = `alert ${alert.severity}`;
                alertElement.innerHTML = `
                    <div class="alert-icon">
                        <i class="fas ${getAlertIcon(alert.severity)}"></i>
                    </div>
                    <div class="alert-content">
                        <h4>${alert.product}</h4>
                        <p>${alert.message}</p>
                    </div>
                `;
                alertsList.appendChild(alertElement);
            });
        } else {
            alertsList.innerHTML = '<p>No current stock alerts</p>';
        }
    } catch (error) {
        console.error('Error updating stock alerts:', error);
    }
}

// Warehouse Overview
async function updateWarehouseOverview() {
    try {
        const warehouseData = await fetchData(API_ENDPOINTS.WAREHOUSE_OVERVIEW);
        const warehouseGrid = document.getElementById('warehouseOverviewGrid');
        
        warehouseGrid.innerHTML = '';

        // Ensure 7 warehouses are displayed
        const displayWarehouses = warehouseData && warehouseData.length 
            ? warehouseData 
            : Array(7).fill({ 
                code: 'N/A', 
                totalStock: 'N/A', 
                capacityUtilization: 0 
            });

        displayWarehouses.slice(0, 7).forEach((warehouse, index) => {
            const warehouseCard = document.createElement('div');
            warehouseCard.className = 'warehouse-card';
            warehouseCard.innerHTML = `
                <div class="warehouse-header">
                    <h3>Warehouse ${index + 1}</h3>
                    <span class="warehouse-id">${warehouse.code || 'N/A'}</span>
                </div>
                <div class="warehouse-stats">
                    <div class="stat">
                        <span>Total Stock</span>
                        <strong>${warehouse.totalStock ? warehouse.totalStock.toLocaleString() : 'N/A'} units</strong>
                    </div>
                    <div class="stat">
                        <span>Capacity Utilization</span>
                        <strong>${warehouse.capacityUtilization ? warehouse.capacityUtilization.toFixed(1) : 'N/A'}%</strong>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${warehouse.capacityUtilization || 0}%"></div>
                        </div>
                    </div>
                </div>
            `;
            warehouseGrid.appendChild(warehouseCard);
        });
    } catch (error) {
        console.error('Error updating warehouse overview:', error);
    }
}

// Utility function to get alert icons
function getAlertIcon(severity) {
    switch(severity) {
        case 'critical': return 'fa-exclamation-triangle text-danger';
        case 'warning': return 'fa-exclamation-circle text-warning';
        default: return 'fa-info-circle text-info';
    }
}

// Initialize MongoDB Chart
function initializeMongoChart() {
    const chartContainer = document.getElementById('salesChart');
    chartContainer.innerHTML = `
       <iframe style="background: #21313C;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="900" height="480" src="https://charts.mongodb.com/charts-invenx-vtwdbcs/embed/charts?id=50c65100-6dd5-4b9a-b21a-38a9e9f29dcf&maxDataAge=3600&theme=dark&autoRefresh=true"></iframe>  `;
}

// Update header date and time
function updateDateTime() {
    const dateDisplay = document.querySelector('.date-display span');
    const now = new Date();
    const options = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    dateDisplay.textContent = now.toLocaleString('en-US', options);
}

// Handle chart period controls
function initializeChartControls() {
    const buttons = document.querySelectorAll('.chart-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // TODO: Implement actual chart period change logic
            console.log(`Selected period: ${button.textContent}`);
        });
    });
}

// Handle notifications
function initializeNotifications() {
    const notificationBell = document.querySelector('.notifications');
    notificationBell.addEventListener('click', () => {
        // TODO: Implement notification dropdown or modal
        console.log('Notifications clicked');
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // TODO: Implement actual search functionality
        console.log('Searching for:', searchTerm);
    });
}

// Periodic data refresh
function startPeriodicRefresh() {
    // Immediate first update
    updateStockStatistics();
    updateStockAlerts();
    updateWarehouseOverview();
    updateDateTime();

    // Set up periodic updates
    setInterval(() => {
        updateStockStatistics();
        updateStockAlerts();
        updateWarehouseOverview();
        updateDateTime();
    }, 30000); // Update every 30 seconds
}
// Wait for the DOM to be fully loaded
// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Fetch overall total inventory from API endpoint
    fetch("http://localhost:3000/api/total-inventory")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok for total inventory");
        }
        return response.json();
      })
      .then((data) => {
        // Update the inventory count element with the total inventory
        const inventoryCountElem = document.getElementById("inventoryCountValue");
        if (inventoryCountElem) {
          inventoryCountElem.textContent = data.total_inventory;
        }
      })
      .catch((error) => {
        console.error("Error fetching total inventory:", error);
      });
  
    // Fetch overall warehouse utilization from API endpoint
    fetch("http://localhost:3000/api/overall-utilization")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok for overall utilization");
        }
        return response.json();
      })
      .then((data) => {
        // Update the warehouse utilization element with the overall utilization percentage
        const utilizationElem = document.getElementById("warehouseUtilizationValue");
        if (utilizationElem) {
          utilizationElem.textContent = data.overall_utilization_percentage;
        }
      })
      .catch((error) => {
        console.error("Error fetching overall utilization:", error);
      });
  
    // (Optional) You can add more fetch calls here for additional API endpoints,
    // such as fetching inventory alerts, sales charts data, etc.
  });
  
  

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMongoChart();
    initializeChartControls();
    initializeNotifications();
    initializeSearch();
    startPeriodicRefresh();
});