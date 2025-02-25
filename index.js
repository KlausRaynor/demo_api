const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// connected websocket clients
const clients = new Set();
// Pre-defined sites array with demo geo and performance data
const sites = [
  {
    latitude: 40.7128,
    longitude: -74.006,
    name: "New York",
    value: 59,
    status: "Operational",
    status_value: 1,
    averageConnectivity: 55.54,
    averageTraffic: 293.11,
    averageDiskUsage: 81.75,
    averageMaintenanceTickets: 6
  },
  {
    latitude: 51.5074,
    longitude: -0.1278,
    name: "London",
    value: 161,
    status: "Offline",
    status_value: 4,
    averageConnectivity: 93.75,
    averageTraffic: 225.37,
    averageDiskUsage: 87.42,
    averageMaintenanceTickets: 16
  },
  {
    latitude: 35.6895,
    longitude: 139.6917,
    name: "Tokyo",
    value: 86,
    status: "Operational",
    status_value: 1,
    averageConnectivity: 88.45,
    averageTraffic: 393.24,
    averageDiskUsage: 24.54,
    averageMaintenanceTickets: 12
  },
  {
    latitude: 48.8566,
    longitude: 2.3522,
    name: "Paris",
    value: 105,
    status: "Offline",
    status_value: 4,
    averageConnectivity: 88.96,
    averageTraffic: 387.89,
    averageDiskUsage: 30.46,
    averageMaintenanceTickets: 11
  },
  {
    latitude: 52.52,
    longitude: 13.405,
    name: "Berlin",
    value: 175,
    status: "Maintenance",
    status_value: 3,
    averageConnectivity: 70.64,
    averageTraffic: 152.39,
    averageDiskUsage: 56.23,
    averageMaintenanceTickets: 9
  },
  {
    latitude: 43.7001,
    longitude: -79.4163,
    name: "Toronto",
    value: 77,
    status: "Offline",
    status_value: 4,
    averageConnectivity: 58.18,
    averageTraffic: 320.49,
    averageDiskUsage: 76.12,
    averageMaintenanceTickets: 11
  },
  {
    latitude: 39.9042,
    longitude: 116.4074,
    name: "Beijing",
    value: 126,
    status: "Maintenance",
    status_value: 3,
    averageConnectivity: 90.89,
    averageTraffic: 493.83,
    averageDiskUsage: 71.86,
    averageMaintenanceTickets: 6
  },
  {
    latitude: 19.4326,
    longitude: -99.1332,
    name: "Mexico City",
    value: 86,
    status: "Operational",
    status_value: 1,
    averageConnectivity: 96.7,
    averageTraffic: 479.73,
    averageDiskUsage: 20.12,
    averageMaintenanceTickets: 10
  },
  {
    latitude: 37.5665,
    longitude: 126.978,
    name: "Seoul",
    value: 138,
    status: "Degraded",
    status_value: 2,
    averageConnectivity: 72.44,
    averageTraffic: 117.7,
    averageDiskUsage: 49.23,
    averageMaintenanceTickets: 6
  },
  {
    latitude: 25.276987,
    longitude: 55.296249,
    name: "Dubai",
    value: 55,
    status: "Maintenance",
    status_value: 3,
    averageConnectivity: 57.53,
    averageTraffic: 138.61,
    averageDiskUsage: 50.3,
    averageMaintenanceTickets: 16
  },
  {
    latitude: 34.0522,
    longitude: -118.2437,
    name: "Los Angeles",
    value: 115,
    status: "Degraded",
    status_value: 2,
    averageConnectivity: 82.82,
    averageTraffic: 307.4,
    averageDiskUsage: 55.44,
    averageMaintenanceTickets: 6
  },
  {
    latitude: 41.8781,
    longitude: -87.6298,
    name: "Chicago",
    value: 115,
    status: "Offline",
    status_value: 4,
    averageConnectivity: 81.48,
    averageTraffic: 37.47,
    averageDiskUsage: 56.52,
    averageMaintenanceTickets: 20
  },
  {
    latitude: 40.4168,
    longitude: -3.7038,
    name: "Madrid",
    value: 50,
    status: "Degraded",
    status_value: 2,
    averageConnectivity: 98.87,
    averageTraffic: 200.12,
    averageDiskUsage: 60.69,
    averageMaintenanceTickets: 10
  }
];


// simulate site fetching site data
function updateSiteStatusData() {
  sites.forEach((site) => {
    let health = 0;
    if (site.averageConnectivity > 90) health++;
    if (site.averageTraffic < 600) health++;
    if (site.averageDiskUsage < 75) health++;
    if (site.averageMaintenanceTickets < 5) health++;
    if (site.averageConnectivity === 0) health = 0; // offline

    site.status_value = health;
    site.status = ["Operational", "Degraded", "Maintenance", "Offline"][Math.min(health, 3)];
  });

  scheduleNextUpdate(updateSiteStatusData);
}

function updateConnectivityData() {
  sites.forEach((site) => {
    const diff = getDiff(12);
     site.averageConnectivity = Math.max(0, Math.min(100, site.averageConnectivity + diff));
  });

  scheduleNextUpdate(updateConnectivityData);
}

// sumulate site fetching traffic data
function updateTrafficData() {
  sites.forEach((site) => {
    let baseChange = Math.floor(Math.random() * 50) + 10;
    let direction = Math.random() < getDirectionBias(site.averageTraffic) ? -1 : 1;

    site.averageTraffic = Math.max(0, site.averageTraffic + baseChange * direction);
  });

  scheduleNextUpdate(updateTrafficData);
}
// simulate site fetching disk usage data
function updateDiskUsageData() {
  sites.forEach((site) => {
    const diff = getDiff(10);
    site.averageDiskUsage = Math.max(0, Math.min(100, site.averageDiskUsage + diff));
  });

  scheduleNextUpdate(updateDiskUsageData);
}
// simulate site fetching ticket data
function updateTicketData() {
  sites.forEach((site) => {

    site.averageMaintenanceTickets > 10 ? site.averageMaintenanceTickets -= 3 : 
      site.averagerMaintenanceTickets;
    
    const diff = getDiff(2);
    site.averageMaintenanceTickets = Math.max(0, site.averageMaintenanceTickets + diff);
  });

  scheduleNextUpdate(updateTicketData);
}

function scheduleNextUpdate(updateFunction) { 
  const randomInterval = Math.floor(Math.random() * 10000) + 1000;
  setTimeout(updateFunction, randomInterval);
}

function getDiff(step) {
  let diff = Math.floor(Math.random() * step) * (Math.random() < 0.5 ? -1 : 1);
  return diff;
}

function getDirectionBias(currentTraffic) {
  let bias = 0.5;

  if (currentTraffic > 400 && currentTraffic < 500) {
    bias = 0.7;
  } else if (currentTraffic > 500) {
    bias = 0.9;
  } else if (currentTraffic > 200 && currentTraffic < 300) {
    bias = 0.7;
  } else if (currentTraffic < 200) {
    bias = 0.9;
  }

  return bias;
}

// First Update Cycle - kicks off recursive calls
updateSiteStatusData();
updateConnectivityData();
updateTrafficData();
updateDiskUsageData();
updateTicketData();



// Define an API endpoint that returns the sites data
app.get('/api/sites', (req, res) => {

  const siteName = req.query.name;
  if (siteName) {
    const filteredSite = sites.find((site) => site.name === siteName);
    if (filteredSite)
    {
      return res.json(filteredSite);
    } else {
      return res.status(404).json({ error: "Site not found" });
    }
  }
  return res.json(sites);
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});