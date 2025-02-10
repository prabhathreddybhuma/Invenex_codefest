const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;
app.use(cors());

// MongoDB Connection URI
const MONGO_URI = "mongodb+srv://himavarshithreddy:invenx@invenx.kxiph.mongodb.net/?retryWrites=true&w=majority&appName=InvenX";

// Create a MongoClient instance with proper options
const client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Global variable to store the database connection
let db;

// Connect once on startup
client.connect()
  .then(() => {
    db = client.db("InvenX");
    console.log("Connected successfully to MongoDB");
    // Start the server only after DB connection is ready
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// API Endpoint: Total Inventory
app.get("/api/total-inventory", async (req, res) => {
  try {
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
  }
});

// API Endpoint: Warehouse Utilization per Warehouse
app.get("/api/warehouse-utilization", async (req, res) => {
  try {
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

    // Calculate utilization for each warehouse
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
  }
});

// API Endpoint: Overall Warehouse Utilization
app.get("/api/overall-utilization", async (req, res) => {
  try {
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

// API Endpoint: Warehouse Stock per Warehouse
app.get("/api/warehouse-stock", async (req, res) => {
  try {
    const inventoryCollection = db.collection("inventory");
    // Aggregate total stock per warehouse
    const warehouseStock = await inventoryCollection.aggregate([
      {
        $group: {
          _id: "$warehouse_id",
          total_stock: { $sum: "$current_stock" }
        }
      }
    ]).toArray();

    res.json({ warehouse_stock: warehouseStock });
  } catch (error) {
    console.error("Error fetching warehouse stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/warehouses", async (req, res) => {
    try {
      // Get the "warehouse" collection from the connected database.
      const warehousesCollection = db.collection("warehouse");
      
      // Fetch all warehouse documents.
      const warehouses = await warehousesCollection.find({}).toArray();
  
      // Return the array of warehouses in the JSON response.
      res.json({ warehouses });
    } catch (error) {
      console.error("Error fetching warehouse details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  app.get("/api/available-storage", async (req, res) => {
    try {
      // Get the collections
      const warehousesCollection = db.collection("warehouse");
      const inventoryCollection = db.collection("inventory");
  
      // Fetch all warehouse documents with their capacity
      const warehouses = await warehousesCollection.find(
        {},
        { projection: { _id: 1, capacity: 1 } }
      ).toArray();
  
      // Aggregate inventory by warehouse_id to sum current_stock
      const inventoryAggregation = await inventoryCollection.aggregate([
        {
          $group: {
            _id: "$warehouse_id",
            total_stock: { $sum: "$current_stock" }
          }
        }
      ]).toArray();
  
      // Create a lookup map for total stock per warehouse
      const stockMap = {};
      inventoryAggregation.forEach(doc => {
        stockMap[doc._id] = doc.total_stock;
      });
  
      // Calculate available storage per warehouse and overall available storage
      let overallCapacity = 0;
      let overallStock = 0;
      const availableStorageData = warehouses.map(warehouse => {
        const capacity = warehouse.capacity || 0;
        const current_stock = stockMap[warehouse._id] || 0;
        overallCapacity += capacity;
        overallStock += current_stock;
        return {
          warehouse_id: warehouse._id,
          capacity: capacity,
          current_stock: current_stock,
          available_storage: capacity - current_stock
        };
      });
  
      const overallAvailableStorage = overallCapacity - overallStock;
  
      res.json({
        overall_available_storage: overallAvailableStorage,
    
      });
    } catch (error) {
      console.error("Error computing available storage:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  