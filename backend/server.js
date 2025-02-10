const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

// MongoDB Connection
const MONGO_URI = "mongodb+srv://himavarshithreddy:invenx@invenx.kxiph.mongodb.net/?retryWrites=true&w=majority&appName=InvenX";
const client = new MongoClient(MONGO_URI);

app.get("/api/total-inventory", async (req, res) => {
    try {
        await client.connect();
        const db = client.db("InvenX");
        const inventoryCollection = db.collection("inventory");

        // Aggregate to sum all `current_stock`
        const totalInventory = await inventoryCollection.aggregate([
            { $group: { _id: null, total_stock: { $sum: "$current_stock" } } }
        ]).toArray();

        const totalStock = totalInventory.length > 0 ? totalInventory[0].total_stock : 0;

        res.json({ total_inventory: totalStock });
    } catch (error) {
        console.error("Error fetching total inventory:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});
app.get("/api/warehouse-utilization", async (req, res) => {
    try {
        await client.connect();
        const db = client.db("InvenX");

        const inventoryCollection = db.collection("inventory");
        const warehousesCollection = db.collection("warehouse");

        // Fetch total stock for each warehouse
        const inventoryData = await inventoryCollection.aggregate([
            { 
                $group: { 
                    _id: "$warehouse_id", 
                    total_stock: { $sum: "$current_stock" } 
                } 
            }
        ]).toArray();

        // Fetch warehouse capacities
        const warehouses = await warehousesCollection.find({}, { projection: { _id: 1, capacity: 1 } }).toArray();

        // Calculate utilization
        const utilizationData = warehouses.map(warehouse => {
            const warehouseStock = inventoryData.find(inv => inv._id === warehouse._id);
            const totalStock = warehouseStock ? warehouseStock.total_stock : 0;

            const utilization = ((totalStock / warehouse.capacity) * 100).toFixed(2);
            
            return {
                warehouse_id: warehouse._id,
                utilization_percentage: `${utilization}%`
            };
        });

        res.json({ warehouse_utilization: utilizationData });

    } catch (error) {
        console.error("Error fetching warehouse utilization:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});
app.get("/api/overall-utilization", async (req, res) => {
    try {
     
      const db = client.db("InvenX");
      const inventoryCollection = db.collection("inventory");
      const warehousesCollection = db.collection("warehouse");
  
      // Aggregate inventory: sum current_stock over all inventory documents
      const inventoryAggregation = await inventoryCollection.aggregate([
        {
          $group: {
            _id: null,
            total_stock: { $sum: "$current_stock" },
          },
        },
      ]).toArray();
      const overallStock = inventoryAggregation.length > 0 ? inventoryAggregation[0].total_stock : 0;
  
      // Fetch all warehouses and sum their capacity
      const warehouses = await warehousesCollection.find({}, { projection: { capacity: 1 } }).toArray();
      const overallCapacity = warehouses.reduce((acc, wh) => acc + (wh.capacity || 0), 0);
  
      // Compute overall utilization percentage
      const overallUtilization = overallCapacity > 0
        ? ((overallStock / overallCapacity) * 100).toFixed(2)
        : "N/A";
  
      res.json({
        overall_stock: overallStock,
        overall_capacity: overallCapacity,
        overall_utilization_percentage: overallUtilization + "%",
      });
    } catch (error) {
      console.error("Error computing overall utilization:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
