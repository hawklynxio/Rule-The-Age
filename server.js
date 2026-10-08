const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const resourceEngine = require('./src/engine/resources');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth / User retrieval
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  
  if (!username) return res.status(400).json({ error: 'Username required' });

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!user) {
      // Create new user and village (generous starting supplies based on prompt)
      db.run(`INSERT INTO users (username) VALUES (?)`, [username], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const userId = this.lastID;
        
        const now = Date.now();
        db.run(`INSERT INTO villages (user_id, name, wood, stone, food, last_update) VALUES (?, ?, ?, ?, ?, ?)`, 
          [userId, `${username}'s Encampment`, 1500, 1500, 3000, now], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: userId, username, ancient_coins: 100, message: 'New settlement founded' });
        });
      });
    } else {
      res.json(user);
    }
  });
});

// Get user state (village + resources)
app.get('/api/state/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });

      db.get(`SELECT * FROM villages WHERE user_id = ?`, [userId], (err, village) => {
        if (err || !village) return res.status(404).json({ error: 'Village not found' });
        
        // Calculate new resources (idle generation)
        const updatedVillage = resourceEngine.calculateResources(village);
        
        // Save updated to DB
        db.run(`UPDATE villages SET wood = ?, stone = ?, food = ?, last_update = ? WHERE id = ?`,
          [updatedVillage.wood, updatedVillage.stone, updatedVillage.food, updatedVillage.last_update, village.id],
          (updateErr) => {
            if (updateErr) console.error("Failed to update resources:", updateErr);
          }
        );

        res.json({
            user: { username: user.username, ancient_coins: user.ancient_coins, tech_level: user.tech_level },
            village: updatedVillage
        });
      });
  });
});

app.listen(PORT, () => {
  console.log(`Rule The Age server running at http://localhost:${PORT}`);
});
