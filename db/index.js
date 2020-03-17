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
      updateSecret,
      deleteSecret,
      listSecrets,
      getSecret,
    })
  })
}

async function runSQL(sql, params) {
  return new Promise((resolve, reject) => {
    client
      .prepare(sql, err => {
        if (err) reject(err)
      })
      .run(params, (err, row) => {
        if (err) reject(err)
        resolve()
      })
  })
}

async function execSQL(sql, params, type = 'run') {
  switch (type) {
    case 'run':
      return runSQL(sql, params)
      break
    case 'get':
      return new Promise((resolve, reject) => {
        client
          .prepare(sql, err => {
            if (err) reject(err)
          })
          .get(params, (err, row) => {
            if (err) reject(err)
            resolve(row)
          })
      })
      break
    case 'all':
      return new Promise((resolve, reject) => {
        client
          .prepare(sql, err => {
            if (err) reject(err)
          })
          .all(params, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
          })
      })
      break
    default:
      return runSQL(sql, params)
      break
  }
}

async function createUser(user, pass) {
  const securePass = await bcrypt.hash(pass, 5)
  return execSQL(
    'INSERT INTO users VALUES ( ?, ?, ?)',
    [user, securePass, moment().format('YYYY-MM-DD')],
    'run'
  )
}

async function listUsers() {
  return execSQL('SELECT name from users ORDER BY name ASC', [], 'all')
}

async function createSecret(user_name, name, key_value) {
  return execSQL(
    'INSERT INTO secrets VALUES ( ?, ?, ?, ?)',
    [user_name, name, key_value, moment().format('YYYY-MM-DD')],
    'run'
  )
}

async function updateSecret(user_name, name, key_value) {
  return execSQL(
    'UPDATE secrets SET key_value = ? WHERE user_name = ? AND name = ?',
    [key_value, user_name, name],
    'run'
  )
}

async function deleteSecret(user_name, name) {
  return execSQL(
    'DELETE FROM secrets WHERE user_name = ? AND name = ?',
    [user_name, name],
    'run'
  )
}

async function listSecrets(user) {
  return execSQL('SELECT name from secrets WHERE user_name = ?', [user], 'all')
}

async function getSecret(user_name, secret_name) {
  return execSQL(
    'SELECT name, key_value from secrets WHERE user_name = ? AND name = ?',
    [user_name, secret_name],
    'get'
  )
}

module.exports = {
  createDb,
}
