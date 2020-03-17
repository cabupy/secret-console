const path = require('path')
const bcrypt = require('bcrypt')
const moment = require('moment')
const { Database } = require('sqlite3').verbose()

const client = new Database(path.join(__dirname, '..', 'data.db'))

const queries = {
  tableUsers: `
    CREATE TABLE IF NOT EXISTS users (
      name TEXT PRIMARY KEY,
      pass TEXT NOT NULL,
      create_at TEXT NOT NULL
    );
  `,

  tableSecrets: `
   CREATE TABLE IF NOT EXISTS secrets (
     user_name TEXT NOT NULL,
     name TEXT NOT NULL,
     key_value TEXT NOT NULL,
     create_at TEXT NOT NULL,
     PRIMARY KEY (user_name, name),
     FOREIGN KEY (user_name)
      REFERENCES users (name)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
   );
  `,
}

async function createDb() {
  return new Promise((resolve, reject) => {
    client.serialize(() => {
      client
        .run(queries.tableUsers, err => {
          if (err) return reject(err)
        })
        .run(queries.tableSecrets, err => {
          if (err) return reject(err)
        })
    })
    resolve({
      client,
      createUser,
      listUsers,
      createSecret,
      listSecrets,
      getSecret
    })
  })
}

async function createUser(user, pass) {
  const securePass = await bcrypt.hash(pass, 5)
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('INSERT INTO users VALUES ( ?, ?, ?)')
    stmt.run([user, securePass, moment().format('YYYY-MM-DD')], (err, row) => {
      if (err) reject(err)
      resolve()
    })
  })
}

async function listUsers() {
  return new Promise((resolve, reject) => {
    const users = []
    client.each(
      'SELECT name FROM users',
      (err, row) => {
        if (err) return reject(err)
        users.push(row)
      },
      (err, count) => {
        if (err) return reject(err)
        resolve({ count, users })
      }
    )
  })
}

async function createSecret(user_name, name, key_value) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('INSERT INTO secrets VALUES ( ?, ?, ?, ?)')
    stmt.run(
      [user_name, name, key_value, moment().format('YYYY-MM-DD')],
      (err, row) => {
        if (err) reject(err)
        resolve()
      }
    )
  })
}

async function listSecrets(user) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare('SELECT name from secrets WHERE user_name = ?')
    stmt.all(user, (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })
}

async function getSecret(user_name, secret_name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare(
      'SELECT name, key_value from secrets WHERE user_name = ? AND name = ?'
    )
    stmt.get([user_name, secret_name], (err, row) => {
      if (err) reject(err)
      resolve(row)
    })
  })
}

module.exports = {
  createDb,
}
