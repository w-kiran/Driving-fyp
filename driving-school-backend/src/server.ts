import app from "./app.js";

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the Driving School API" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));