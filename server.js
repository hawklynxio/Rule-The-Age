const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const resourceEngine = require('./src/engine/resources');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Force no-cache for mobile rapid iteration
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 0 }));


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
        db.run(`INSERT INTO villages (user_id, name, wood, stone, food, last_update, map_x, map_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
          [userId, `${username}'s Encampment`, 1500, 1500, 3000, now, Math.floor(Math.random()*20), Math.floor(Math.random()*20)], function(err) {
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

// Upgrade building
app.post('/api/upgrade', (req, res) => {
    const { userId, building } = req.body;
    db.get(`SELECT * FROM villages WHERE user_id = ?`, [userId], (err, village) => {
        if (err || !village) return res.status(404).json({ error: 'Village not found' });
        
        // Sync resources first
        const v = resourceEngine.calculateResources(village);
        
        let costWood = 0, costStone = 0, costFood = 0;
        let nextLevel = 0;
        let levelColumn = '';

        if (building === 'lumber') {
            nextLevel = (v.lumber_level || 1) + 1;
            levelColumn = 'lumber_level';
            costWood = 500 * nextLevel; costStone = 200 * nextLevel;
        } else if (building === 'stone') {
            nextLevel = (v.stone_level || 1) + 1;
            levelColumn = 'stone_level';
            costWood = 200 * nextLevel; costStone = 500 * nextLevel;
        } else if (building === 'food') {
            nextLevel = (v.food_level || 1) + 1;
            levelColumn = 'food_level';
            costWood = 400 * nextLevel; costStone = 400 * nextLevel;
        } else {
            return res.status(400).json({ error: 'Invalid building' });
        }

        if (v.wood < costWood || v.stone < costStone || v.food < costFood) {
            return res.status(400).json({ error: 'Not enough resources' });
        }

        // Deduct and upgrade
        v.wood -= costWood;
        v.stone -= costStone;
        v.food -= costFood;

        db.run(`UPDATE villages SET wood = ?, stone = ?, food = ?, ${levelColumn} = ?, last_update = ? WHERE id = ?`,
            [v.wood, v.stone, v.food, nextLevel, v.last_update, v.id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Upgrade successful', level: nextLevel, wood: v.wood, stone: v.stone, food: v.food });
            }
        );
    });
});

// Map endpoint
app.get('/api/map', (req, res) => {
    db.all(`SELECT v.id, v.name, v.lumber_level, v.stone_level, v.food_level, v.map_x, v.map_y, u.username, u.clan_id FROM villages v JOIN users u ON v.user_id = u.id ORDER BY v.id DESC LIMIT 50`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// MVP: Clan Creation
app.post('/api/clan', (req, res) => {
    const { userId, clanName } = req.body;
    db.get('SELECT ancient_coins, clan_id FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(404).json({error: 'User not found'});
        if (user.clan_id) return res.status(400).json({error: 'Already in a clan'});
        if (user.ancient_coins < 50) return res.status(400).json({error: 'Not enough Ancient Coins (50 required)'});

        db.run('INSERT INTO clans (name, leader_id) VALUES (?, ?)', [clanName, userId], function(err) {
            if (err) return res.status(400).json({error: 'Clan name taken'});
            const clanId = this.lastID;
            db.run('UPDATE users SET clan_id = ?, ancient_coins = ancient_coins - 50 WHERE id = ?', [clanId, userId], () => {
                res.json({ success: true, clanId, clanName });
            });
        });
    });
});

// MVP: Store Purchase
app.post('/api/buy', (req, res) => {
    const { userId, item } = req.body;
    db.get('SELECT * FROM villages WHERE user_id = ?', [userId], (err, village) => {
        if (err || !village) return res.status(404).json({error: 'Village not found'});
        
        if (item === 'starter') {
            db.run('UPDATE villages SET wood = wood + 50000, stone = stone + 50000, food = food + 50000 WHERE id = ?', [village.id], () => {
                res.json({ success: true, message: "Starter Pack purchased! +50k Resources!" });
            });
        } else {
            res.status(400).json({error: 'Invalid item'});
        }
    });
});


// Daily Free Supplies Endpoint
app.post('/api/claim', (req, res) => {
    const { userId } = req.body;
    db.get('SELECT * FROM villages WHERE user_id = ?', [userId], (err, village) => {
        if (err || !village) return res.status(404).json({error: 'Village not found'});
        
        // Give 1000 of each resource and 10 coins
        db.run('UPDATE villages SET wood = wood + 1000, stone = stone + 1000, food = food + 1000 WHERE id = ?', [village.id], () => {
            db.run('UPDATE users SET ancient_coins = ancient_coins + 10 WHERE id = ?', [userId], () => {
                res.json({ success: true });
            });
        });
    });
});


// Scout Endpoint
app.post('/api/scout', (req, res) => {
    const { targetId } = req.body;
    db.get('SELECT * FROM villages WHERE id = ?', [targetId], (err, target) => {
        if (err || !target) return res.status(404).json({error: 'Target not found'});
        res.json({ message: `Scout Report for ${target.name}: ${Math.floor(target.wood)} 🪵, ${Math.floor(target.stone)} 🪨, ${Math.floor(target.food)} 🍖` });
    });
});

// Raid Endpoint
app.post('/api/raid', (req, res) => {
    const { userId, targetId } = req.body;
    db.get('SELECT * FROM villages WHERE user_id = ?', [userId], (err, attacker) => {
        if (err || !attacker) return res.status(404).json({error: 'Attacker not found'});
        db.get('SELECT * FROM villages WHERE id = ?', [targetId], (err, defender) => {
            if (err || !defender) return res.status(404).json({error: 'Target not found'});
            if (attacker.id === defender.id) return res.status(400).json({error: 'You cannot raid your own village!'});

            // Steal 20% of defender's resources
            const stolenWood = Math.floor(defender.wood * 0.2);
            const stolenStone = Math.floor(defender.stone * 0.2);
            const stolenFood = Math.floor(defender.food * 0.2);

            if (stolenWood <= 0 && stolenStone <= 0 && stolenFood <= 0) {
                return res.json({ message: `Raid failed! ${defender.name} has no resources left to steal!` });
            }

            db.run('UPDATE villages SET wood = wood - ?, stone = stone - ?, food = food - ? WHERE id = ?', [stolenWood, stolenStone, stolenFood, defender.id], () => {
                db.run('UPDATE villages SET wood = wood + ?, stone = stone + ?, food = food + ? WHERE id = ?', [stolenWood, stolenStone, stolenFood, attacker.id], () => {
                    res.json({ message: `Raid Victory! Looted ${stolenWood} 🪵, ${stolenStone} 🪨, ${stolenFood} 🍖!` });
                });
            });
        });
    });
});

app.listen(PORT, () => {

  console.log(`Rule The Age server running at http://localhost:${PORT}`);
});
