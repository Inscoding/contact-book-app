const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(cors());

// connect DB
const db = new sqlite3.Database("contacts.db");

db.run(
  `CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT
  )`
);

// validators
const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isPhone = (phone) => /^\d{10}$/.test(phone);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running! Use /contacts endpoint.");
});

// POST /contacts
app.post("/contacts", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !isEmail(email) || !isPhone(phone)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const stmt = db.prepare("INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)");
  stmt.run(name, email, phone, function (err) {
    if (err) return res.status(500).json({ error: "DB insert failed" });
    res.status(201).json({ id: this.lastID, name, email, phone });
  });
});

// GET /contacts?page=1&limit=5
app.get("/contacts", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM contacts LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB fetch failed" });

    db.get("SELECT COUNT(*) as total FROM contacts", (err2, count) => {
      if (err2) return res.status(500).json({ error: "DB count failed" });
      res.json({ contacts: rows, total: count.total });
    });
  });
});

// DELETE /contacts/:id
app.delete("/contacts/:id", (req, res) => {
  db.run("DELETE FROM contacts WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: "DB delete failed" });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.sendStatus(204);
  });
});

app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));
