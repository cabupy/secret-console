const { program } = require('commander')
const { createDb } = require('./db')

async function main() {

  const db = await createDb().catch(err => {
    console.log(`Error al crear la base de datos. Mensaje: ${err.message}`)
    return
  })

  program
    .version('1.0.0', '-v, --vers', 'output the current version')

  program
    .command('createuser <user> <pass>')
    .description('Create a user')
    .action(async (user, pass) => {
      try {
        await db.createUser(user, pass)
        console.log(`User ${user} has been created`)
      } catch (err) {
        console.error(`Cannot create user: ${user}. Message: ${err.message}.`)
      }
    })

  program
    .command('listusers')
    .description('List all users')
    .action(async () => {
      try {
        const results = await db.listUsers()
        results.forEach(u => {
          console.log(` * ${u.name}`)
        })
        console.log(`Total: ${results.length}`)
      } catch (err) {
        console.error(`Cannot list users. Message: ${err.message}.`)
      }
    })  

  program
    .command('createsecret <user_name> <name_secret> <key_value>')
    .description('Create a secret for a user')
    .action(async (user_name, name_secret, key_value) => {
      try {
        await db.createSecret(user_name, name_secret, key_value)
        console.log(`Secret ${name_secret} has been created, for user ${user_name}`)
      } catch (err) {
        console.error(`Cannot create secret: ${name_secret}, for user ${user_name}. Message: ${err.message}.`)
      }
    })

  program
    .command('updatesecret <user_name> <name_secret> <key_value>')
    .description('Update a secret for a user')
    .action(async (user_name, name_secret, key_value) => {
      try {
        await db.updateSecret(user_name, name_secret, key_value)
        console.log(`Secret ${name_secret} has been updated, for user ${user_name}`)
      } catch (err) {
        console.error(`Cannot update secret: ${name_secret}, for user ${user_name}. Message: ${err.message}.`)
      }
    })

  program
    .command('deletesecret <user_name> <name_secret>')
    .description('Delete a secret for a user')
    .action(async (user_name, name_secret) => {
      try {
        await db.deleteSecret(user_name, name_secret)
        console.log(`Secret ${name_secret} has been deleted, for user ${user_name}`)
      } catch (err) {
        console.error(`Cannot delete secret: ${name_secret}, for user ${user_name}. Message: ${err.message}.`)
      }
    })

  program
    .command('getsecret <user_name> <secret_name>')
    .description('Show a key secret data for a <user_name> and <secret_name>')
    .action(async (user_name, secret_name) => {
      try {
        const s = await db.getSecret(user_name, secret_name)
        if (s) console.log(` * ${s.name} = ${s.key_value}`)
        else console.log(`Cannot found a key secret for user ${user_name} and secret ${secret_name}.`)
      } catch (err) {
        console.error(`Cannot get a key secret for user ${user_name} and secret ${secret_name}. Message: ${err.message}.`)
      }
    })
  
  program
    .command('listsecrets <user>')
    .description('List all secrets name for a <user>')
    .action(async (user) => {
      try {
        const results = await db.listSecrets(user)
        results.forEach(s => {
          console.log(` * ${s.name}`)
        })
        console.log(`Total: ${results.length}`)
      } catch (err) {
        console.error(`Cannot list users. Message: ${err.message}.`)
      }
    })

  program.parse(process.argv)

}

main()

