import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (in production, use a database)
let users = {};
let feedbacks = [];
let appointments = [];
let invoices = [];
let communityEvents = [];

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "RuralMind Connect Backend Server", 
    version: "1.0",
    status: "running"
  });
});

// Authentication APIs
app.post("/api/auth/signup", (req, res) => {
  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  
  if (users[email]) {
    return res.status(409).json({ error: "User already exists" });
  }
  
  // In a real app, you would hash the password
  users[email] = {
    id: Object.keys(users).length + 1,
    name,
    email,
    phone,
    password, // In production, hash this!
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({ 
    success: true, 
    message: "User registered successfully",
    user: { name, email, phone }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  const user = users[email];
  if (!user || user.password !== password) { // In production, use proper password hashing
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  res.json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// Doctors/Specialists APIs
app.get("/api/doctors", (req, res) => {
  const { city, specialty, lat, lng, radius = 50 } = req.query;
  
  let doctors = [
    { 
      id: 1, 
      name: "Dr. Aren Sharma", 
      contact: "www.frankhospital.com", 
      specialty: "General Physician", 
      city: "Delhi", 
      lat: 28.64, 
      lng: 77.22,
      experience: "15 years",
      rating: 4.8,
      availability: "Mon-Fri, 9AM-6PM"
    },
    { 
      id: 2, 
      name: "Dr. Shalip Gupta", 
      contact: "Dr.Shalip@yahoo.com", 
      specialty: "Pediatrics", 
      city: "Delhi", 
      lat: 28.58, 
      lng: 77.18,
      experience: "12 years",
      rating: 4.6,
      availability: "Mon-Sat, 10AM-4PM"
    },
    { 
      id: 3, 
      name: "Dr. Hildi Kao", 
      contact: "Kongshu@yahoo.com", 
      specialty: "Dermatology", 
      city: "Mumbai", 
      lat: 19.09, 
      lng: 72.88,
      experience: "8 years",
      rating: 4.9,
      availability: "Tue-Sun, 11AM-7PM"
    },
    { 
      id: 4, 
      name: "Dr. R. Singh", 
      contact: "rsingh@health.org", 
      specialty: "Cardiology", 
      city: "Jaipur", 
      lat: 26.90, 
      lng: 75.80,
      experience: "20 years",
      rating: 4.7,
      availability: "Mon-Fri, 8AM-5PM"
    },
    { 
      id: 5, 
      name: "Dr. P. Verma", 
      contact: "verma.clinic.in", 
      specialty: "ENT", 
      city: "Lucknow", 
      lat: 26.85, 
      lng: 80.95,
      experience: "10 years",
      rating: 4.5,
      availability: "Mon-Sat, 9AM-6PM"
    },
    { 
      id: 6, 
      name: "Dr. N. Kumar", 
      contact: "clinic.kumar@example.com", 
      specialty: "Orthopedics", 
      city: "Patna", 
      lat: 25.60, 
      lng: 85.14,
      experience: "18 years",
      rating: 4.8,
      availability: "Mon-Fri, 10AM-5PM"
    },
    { 
      id: 7, 
      name: "Dr. Meera Das", 
      contact: "meeradas@example.com", 
      specialty: "Gynecology", 
      city: "Mumbai", 
      lat: 19.07, 
      lng: 72.84,
      experience: "14 years",
      rating: 4.9,
      availability: "Mon-Sat, 9AM-5PM"
    }
  ];

  // Filter by city
  if (city) {
    doctors = doctors.filter(doctor => 
      doctor.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Filter by specialty
  if (specialty) {
    doctors = doctors.filter(doctor => 
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  // Calculate distance if coordinates provided
  if (lat && lng) {
    doctors = doctors.map(doctor => {
      const distance = calculateDistance(
        parseFloat(lat), 
        parseFloat(lng), 
        doctor.lat, 
        doctor.lng
      );
      return { ...doctor, distance };
    }).filter(doctor => doctor.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  res.json({
    success: true,
    count: doctors.length,
    doctors
  });
});

// Billing APIs
app.get("/api/billing/invoices", (req, res) => {
  const invoices = [
    {
      id: "INV-001",
      date: "2024-01-15",
      service: "Consultation with Dr. Sharma",
      amount: 500,
      status: "paid",
      description: "General health consultation"
    },
    {
      id: "INV-002", 
      date: "2024-01-20",
      service: "Lab Tests Package",
      amount: 1200,
      status: "pending",
      description: "Complete blood work and tests"
    },
    {
      id: "INV-003",
      date: "2024-02-01", 
      service: "Follow-up Consultation",
      amount: 300,
      status: "overdue",
      description: "Follow-up appointment"
    }
  ];
  
  res.json({ success: true, invoices });
});

app.post("/api/billing/pay", (req, res) => {
  const { invoiceId, paymentMethod, amount } = req.body;
  
  // In a real app, integrate with payment gateway
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  
  // Simulate payment processing
  setTimeout(() => {
    invoice.status = "paid";
    res.json({ 
      success: true, 
      message: "Payment processed successfully",
      transactionId: `TXN-${Date.now()}`,
      invoice
    });
  }, 1000);
});

// Feedback APIs
app.get("/api/feedback", (req, res) => {
  res.json({
    success: true,
    count: feedbacks.length,
    feedbacks: feedbacks.length > 0 ? feedbacks : getSampleFeedbacks()
  });
});

app.post("/api/feedback", (req, res) => {
  const { rating, serviceType, feedback, userName = "Anonymous" } = req.body;
  
  if (!rating || !serviceType || !feedback) {
    return res.status(400).json({ error: "Rating, service type and feedback are required" });
  }
  
  const newFeedback = {
    id: feedbacks.length + 1,
    userName,
    rating: parseInt(rating),
    serviceType,
    feedback,
    date: new Date().toISOString()
  };
  
  feedbacks.push(newFeedback);
  
  res.status(201).json({
    success: true,
    message: "Feedback submitted successfully",
    feedback: newFeedback
  });
});

// Community APIs
app.get("/api/community/resources", (req, res) => {
  const resources = [
    {
      id: 1,
      name: "Primary Health Center",
      type: "clinic",
      distance: 2.3,
      phone: "+91-9876543210",
      address: "Main Road, Village Center",
      services: ["General Consultation", "Basic Tests", "Vaccinations"]
    },
    {
      id: 2,
      name: "Mental Health Support Group", 
      type: "support",
      distance: 5.1,
      phone: "+91-9876543211",
      address: "Community Hall, Sector 5",
      services: ["Counseling", "Group Therapy", "Crisis Support"]
    },
    {
      id: 3,
      name: "Community Wellness Center",
      type: "wellness", 
      distance: 3.7,
      phone: "+91-9876543212",
      address: "Near Public Park",
      services: ["Yoga Classes", "Health Workshops", "Nutrition Guidance"]
    },
    {
      id: 4,
      name: "Emergency Care Unit",
      type: "emergency",
      distance: 4.2,
      phone: "+91-9876543213", 
      address: "Highway Road",
      services: ["24/7 Emergency", "Ambulance", "Critical Care"]
    }
  ];
  
  res.json({ success: true, resources });
});

app.get("/api/community/events", (req, res) => {
  const events = [
    {
      id: 1,
      name: "Free Health Checkup Camp",
      date: "2024-02-15",
      location: "Village Community Hall",
      description: "Free health screenings and consultations for the community",
      registered: 45
    },
    {
      id: 2,
      name: "Mental Health Awareness Workshop", 
      date: "2024-02-20",
      location: "Community Center",
      description: "Learn about mental wellness and coping strategies",
      registered: 28
    },
    {
      id: 3,
      name: "Yoga for Wellness Session",
      date: "2024-02-25", 
      location: "Public Park",
      description: "Guided yoga session for all age groups",
      registered: 62
    }
  ];
  
  res.json({ success: true, events });
});

app.post("/api/community/events/register", (req, res) => {
  const { eventId, userName, email } = req.body;
  
  const event = communityEvents.find(e => e.id === parseInt(eventId)) || 
                getSampleEvents().find(e => e.id === parseInt(eventId));
  
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }
  
  // In a real app, save registration to database
  const registration = {
    id: Date.now(),
    eventId: parseInt(eventId),
    userName,
    email,
    registeredAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: `Successfully registered for ${event.name}`,
    registration,
    event
  });
});

// Appointment APIs
app.post("/api/appointments", (req, res) => {
  const { doctorId, date, time, patientName, reason } = req.body;
  
  if (!doctorId || !date || !time || !patientName) {
    return res.status(400).json({ error: "Doctor, date, time and patient name are required" });
  }
  
  const newAppointment = {
    id: appointments.length + 1,
    doctorId: parseInt(doctorId),
    date,
    time,
    patientName,
    reason,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  
  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment: newAppointment
  });
});

// Emergency Services API
app.post("/api/emergency/alert", (req, res) => {
  const { location, emergencyType, contactNumber, description } = req.body;
  
  // In a real app, this would trigger actual emergency protocols
  console.log(`EMERGENCY ALERT: ${emergencyType} at ${location}. Contact: ${contactNumber}. Details: ${description}`);
  
  res.json({
    success: true,
    message: "Emergency alert sent successfully. Help is on the way.",
    alertId: `EMG-${Date.now()}`,
    estimatedResponseTime: "15-20 minutes"
  });
});

// Utility function to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Sample data functions
function getSampleFeedbacks() {
  return [
    {
      id: 1,
      userName: "Rahul Kumar",
      rating: 5,
      serviceType: "consultation",
      feedback: "Excellent service! The doctors were very professional and caring. The online consultation was smooth.",
      date: "2024-01-10"
    },
    {
      id: 2,
      userName: "Priya Singh", 
      rating: 4,
      serviceType: "lab",
      feedback: "Good experience overall. The doctor was knowledgeable, but waiting time was a bit long.",
      date: "2024-01-08"
    }
  ];
}

function getSampleEvents() {
  return [
    {
      id: 1,
      name: "Free Health Checkup Camp",
      date: "2024-02-15",
      location: "Village Community Hall",
      description: "Free health screenings and consultations for the community"
    },
    {
      id: 2,
      name: "Mental Health Awareness Workshop",
      date: "2024-02-20", 
      location: "Community Center",
      description: "Learn about mental wellness and coping strategies"
    },
    {
      id: 3,
      name: "Yoga for Wellness Session",
      date: "2024-02-25",
      location: "Public Park",
      description: "Guided yoga session for all age groups"
    }
  ];
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    users: Object.keys(users).length,
    feedbacks: feedbacks.length,
    appointments: appointments.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RuralMind Connect Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   GET  /api/doctors - Find specialists`);
  console.log(`   POST /api/auth/signup - User registration`);
  console.log(`   POST /api/auth/login - User login`);
  console.log(`   GET  /api/billing/invoices - Get invoices`);
  console.log(`   POST /api/feedback - Submit feedback`);
  console.log(`   GET  /api/community/resources - Community resources`);
  console.log(`   GET  /api/community/events - Community events`);
  console.log(`   POST /api/emergency/alert - Emergency services`);
  console.log(`   GET  /api/health - Server health check`);
});
