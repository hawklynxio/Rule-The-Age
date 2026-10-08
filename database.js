const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'game.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      ancient_coins INTEGER DEFAULT 100,
      clan_id INTEGER,
      tech_level INTEGER DEFAULT 1,
      FOREIGN KEY (clan_id) REFERENCES clans (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      tag TEXT,
      leader_id INTEGER,
      FOREIGN KEY (leader_id) REFERENCES users (id)
    )
  `);

  
  // Migration: Add map_x and map_y if they don't exist
  db.run("ALTER TABLE villages ADD COLUMN map_x INTEGER DEFAULT 0", (err) => {
    if(!err) console.log("Added map_x to villages.");
  });
  db.run("ALTER TABLE villages ADD COLUMN map_y INTEGER DEFAULT 0", (err) => {
    if(!err) console.log("Added map_y to villages.");
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      wood REAL DEFAULT 500.0,
      stone REAL DEFAULT 500.0,
      food REAL DEFAULT 1000.0,
      lumber_level INTEGER DEFAULT 1,
      stone_level INTEGER DEFAULT 1,
      food_level INTEGER DEFAULT 1,
      map_x INTEGER DEFAULT 0,
      map_y INTEGER DEFAULT 0,
      last_update INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

    // Seed dummy villages for MVP testing
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (row && row.count === 0) {
          console.log("Seeding dummy villages...");
          const dummies = [
              { name: "Bandit Camp", wood: 5000, stone: 2000, food: 1000, x: 3, y: 4, lvl: 2 },
              { name: "Barbarian Outpost", wood: 10000, stone: 8000, food: 5000, x: 14, y: 16, lvl: 5 },
              { name: "Abandoned Fortress", wood: 45000, stone: 50000, food: 20000, x: 18, y: 2, lvl: 12 },
              { name: "Goblin Horde", wood: 2000, stone: 1000, food: 25000, x: 6, y: 17, lvl: 3 },
              { name: "Ruined Citadel", wood: 100000, stone: 100000, food: 50000, x: 9, y: 10, lvl: 20 }
          ];
          
          const now = Date.now();
          dummies.forEach(d => {
              db.run('INSERT INTO users (username, ancient_coins) VALUES (?, ?)', [d.name, 0], function(err) {
                  if (!err) {
                      const userId = this.lastID;
                      db.run('INSERT INTO villages (user_id, name, wood, stone, food, last_update, map_x, map_y, lumber_level, stone_level, food_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                      [userId, d.name, d.wood, d.stone, d.food, now, d.x, d.y, d.lvl, d.lvl, d.lvl]);
                  }
              });
          });
      }
    });
});

module.exports = db;
