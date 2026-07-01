import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"];
const missing: string[] = [];
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    missing.push(key);
  }
}
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

import app from "./app.js";

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the Driving School API" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));