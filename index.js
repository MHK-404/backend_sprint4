const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for the frontend domain
app.use(cors({
  origin: 'https://icy-grass-028f08d00.6.azurestaticapps.net' // Replace with your frontend URL
}));

// Parse JSON request bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Risk Calculator Backend!');
});

// Calculate Risk Route
app.post('/calculate-risk', (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Request body:', req.body);

    // Destructure the request body
    const { age, height, weight, systolic, diastolic, familyHistory } = req.body;

    // Validate inputs
    if (!age || !height || !weight || !systolic || !diastolic || !familyHistory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

    // Calculate risk points
    const agePoints = calculateAgePoints(age);
    const bmiPoints = calculateBMIPoints(bmi);
    const bpPoints = calculateBloodPressurePoints(systolic, diastolic);
    const familyHistoryPoints = calculateFamilyHistoryPoints(familyHistory);

    // Total risk score
    const totalScore = agePoints + bmiPoints + bpPoints + familyHistoryPoints;
    const riskCategory = determineRiskCategory(totalScore);

    // Log the results for debugging
    console.log('Results:', { bmi, totalScore, riskCategory });

    // Send response
    res.json({ bmi, totalScore, riskCategory });
  } catch (error) {
    console.error('Error in /calculate-risk:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper functions
function calculateAgePoints(age) {
  if (age < 30) return 0;
  if (age < 45) return 10;
  if (age < 60) return 20;
  return 30;
}

function calculateBMIPoints(bmi) {
  if (bmi >= 18.5 && bmi <= 24.9) return 0; // Normal
  if (bmi >= 25 && bmi <= 29.9) return 30; // Overweight
  return 75; // Obese
}

function calculateBloodPressurePoints(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return 0; // Normal
  if (systolic < 130 && diastolic < 80) return 15; // Elevated
  if (systolic < 140 || diastolic < 90) return 30; // Stage 1
  if (systolic < 180 || diastolic < 120) return 75; // Stage 2
  return 100; // Crisis
}

function calculateFamilyHistoryPoints(familyHistory) {
  let points = 0;
  if (familyHistory.includes('diabetes')) points += 10;
  if (familyHistory.includes('cancer')) points += 10;
  if (familyHistory.includes('alzheimer')) points += 10;
  return points;
}

function determineRiskCategory(totalScore) {
  if (totalScore <= 20) return 'Low Risk';
  if (totalScore <= 50) return 'Moderate Risk';
  if (totalScore <= 75) return 'High Risk';
  return 'Uninsurable';
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});