const email = "admin@veloroute.local";
const password = "adminadmin12";
const trackingId = "NEX-123456789";

async function simulate() {
  console.log("Logging in as admin...");
  const loginRes = await fetch("http://localhost:3001/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;

  console.log("Fetching shipment ID for tracking ID:", trackingId);
  const trackRes = await fetch(`http://localhost:3001/api/v1/track/${trackingId}`);
  const trackData = await trackRes.json();
  
  if (!trackData || trackData.error) {
    console.error("Failed to find tracking data", trackData);
    return;
  }

  // We need the internal shipment ID to update status, let's get it from the shipment list
  const listRes = await fetch("http://localhost:3001/api/v1/shipments?search=" + trackingId, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData = await listRes.json();
  const shipment = listData.items?.[0];
  
  if (!shipment) {
    console.error("Shipment not found in admin list.");
    return;
  }
  
  const shipmentId = shipment.id;
  
  const steps = [
    { status: "IN_TRANSIT", lat: 35.6762, lng: 139.6503, description: "Departed facility in Tokyo" },
    { status: "IN_TRANSIT", lat: 37.7749, lng: -140.4194, description: "In transit over Pacific Ocean" }, // roughly mid-way
    { status: "OUT_FOR_DELIVERY", lat: 37.7749, lng: -122.4194, description: "Arrived at local facility in SF, out for delivery" },
    { status: "DELIVERED", lat: 37.7749, lng: -122.4194, description: "Delivered to customer" },
  ];

  console.log("Starting simulation. Keep your browser open to http://localhost:3000/track/NEX-123456789");

  for (let i = 0; i < steps.length; i++) {
    console.log(`Waiting 5 seconds before next update...`);
    await new Promise(r => setTimeout(r, 5000));
    
    const step = steps[i];
    console.log(`Sending update: ${step.status} at [${step.lat}, ${step.lng}]`);
    
    await fetch(`http://localhost:3001/api/v1/shipments/${shipmentId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        status: step.status,
        lat: step.lat,
        lng: step.lng,
        description: step.description,
        city: step.status === "DELIVERED" ? "San Francisco" : undefined,
        country: step.status === "DELIVERED" ? "US" : undefined,
      })
    });
  }
  
  console.log("Simulation complete!");
}

simulate().catch(console.error);
