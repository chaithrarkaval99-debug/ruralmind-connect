import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example route
app.get("/", (req, res) => {
  res.send("RuralMind Backend is running...");
});

// Example API: Get doctor list
app.get("/api/doctors", (req, res) => {
  const doctors = [
    { id: 1, name: "Dr. Anjali Rao", specialty: "General Physician" },
    { id: 2, name: "Dr. Manish Patel", specialty: "Pediatrician" },
    { id: 3, name: "Dr. Neha Sharma", specialty: "Gynecologist" },
  ];
  res.json(doctors);
});

// Example POST API (feedback)
app.post("/api/feedback", (req, res) => {
  const { name, message } = req.body;
  console.log(`Feedback from ${name}: ${message}`);
  res.status(201).json({ success: true, message: "Feedback received!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
