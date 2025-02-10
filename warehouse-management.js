const WAREHOUSE_API_ENDPOINTS = {
    WAREHOUSE_UTILIZATION_CHART: '/api/warehouse/utilization-chart',
    TOTAL_WAREHOUSES: '/api/warehouse/total-count',
    AVAILABLE_STORAGE_SLOTS: '/api/warehouse/available-slots',
    TOTAL_WAREHOUSES_UTILIZATION: '/api/warehouse/total-utilization',
    INDIVIDUAL_WAREHOUSE_DETAILS: '/api/warehouse/individual-details',
    UNDER_UTILIZED_WAREHOUSES: '/api/warehouse/under-utilized',
    STORAGE_OVERLOAD_WARNINGS: '/api/warehouse/storage-overload',
    AI_STOCK_OPTIMIZATION: '/api/warehouse/ai-optimization'
};

async function updateWarehouseManagementData() {
    try {
        // Fetch overview stats
        const [
            totalWarehouses, 
            availableSlots, 
            totalUtilization
        ] = await Promise.all([
            fetchData(WAREHOUSE_API_ENDPOINTS.TOTAL_WAREHOUSES),
            fetchData(WAREHOUSE_API_ENDPOINTS.AVAILABLE_STORAGE_SLOTS),
            fetchData(WAREHOUSE_API_ENDPOINTS.TOTAL_WAREHOUSES_UTILIZATION)
        ]);

        // Update overview stats
        document.getElementById('totalWarehousesCount').textContent = totalWarehouses?.value || 'N/A';
        document.getElementById('availableStorageSlots').textContent = availableSlots?.value || 'N/A';
        document.getElementById('totalWarehousesUtilization').textContent = 
            totalUtilization ? `${totalUtilization.value.toFixed(1)}%` : 'N/A';

        // Fetch and populate individual warehouse details
        const warehouseDetails = await fetchData(WAREHOUSE_API_ENDPOINTS.INDIVIDUAL_WAREHOUSE_DETAILS);
        populateWarehouseDetails(warehouseDetails);

        // Update AI optimization sections
        const [
            underUtilizedWarehouses,
            storageOverloadWarnings,
            aiOptimizationSuggestions
        ] = await Promise.all([
            fetchData(WAREHOUSE_API_ENDPOINTS.UNDER_UTILIZED_WAREHOUSES),
            fetchData(WAREHOUSE_API_ENDPOINTS.STORAGE_OVERLOAD_WARNINGS),
            fetchData(WAREHOUSE_API_ENDPOINTS.AI_STOCK_OPTIMIZATION)
        ]);

        updateAIOptimizationSections(
            underUtilizedWarehouses, 
            storageOverloadWarnings, 
            aiOptimizationSuggestions
        );

    } catch (error) {
        console.error('Error updating warehouse management data:', error);
    }
}

function populateWarehouseDetails(warehouseDetails) {
    const warehouseGrid = document.getElementById('warehouseDetailsGrid');
    warehouseGrid.innerHTML = '';

    if (warehouseDetails?.length) {
        warehouseDetails.forEach(warehouse => {
            const warehouseCard = document.createElement('div');
            warehouseCard.className = 'warehouse-detail-card';
            warehouseCard.innerHTML = `
                <h4>${warehouse.name}</h4>
                <p>Location: ${warehouse.location}</p>
                <div class="warehouse-stats">
                    <div>Total Stock: ${warehouse.totalStock.toLocaleString()} units</div>
                    <div>Space Utilization: ${warehouse.spaceUtilization.toFixed(1)}%</div>
                </div>
            `;
            warehouseGrid.appendChild(warehouseCard);
        });
    }
}

function updateAIOptimizationSections(
    underUtilizedWarehouses, 
    storageOverloadWarnings, 
    aiOptimizationSuggestions
) {
    const underUtilizedList = document.getElementById('underUtilizedWarehousesList');
    const overloadWarningsList = document.getElementById('storageOverloadWarningsList');
    const optimizationSuggestionsList = document.getElementById('aiStockOptimizationSuggestionsList');

    // Populate under-utilized warehouses
    underUtilizedList.innerHTML = underUtilizedWarehouses?.map(
        warehouse => `<div>${warehouse.name}: ${warehouse.utilizationPercentage}% utilized</div>`
    ).join('') || 'No under-utilized warehouses';

    // Populate storage overload warnings
    overloadWarningsList.innerHTML = storageOverloadWarnings?.map(
        warning => `<div>${warning.warehouseName}: ${warning.message}</div>`
    ).join('') || 'No storage overload warnings';

    // Populate AI optimization suggestions
    optimizationSuggestionsList.innerHTML = aiOptimizationSuggestions?.map(
        suggestion => `<div>${suggestion.description}</div>`
    ).join('') || 'No optimization suggestions available';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateWarehouseManagementData();
    
    // Set up periodic refresh
    setInterval(updateWarehouseManagementData, 30000); // Update every 30 seconds
});