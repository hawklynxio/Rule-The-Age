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

  db.run(`
    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      wood REAL DEFAULT 500.0,
      stone REAL DEFAULT 500.0,
      food REAL DEFAULT 1000.0,
      last_update INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
});

module.exports = db;
