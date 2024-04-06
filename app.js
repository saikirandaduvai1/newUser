const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app = express()
app.use(express.json)
const dbpath = path.join(__dirname, 'userData.db')

let database = null
const initializaDBAndServer = async (request, response) => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('coding running http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error ${e.massege}`)
    process.exit(1)
  }
}

initializaDBAndServer()
//api 1

app.post('/register/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(request.body.password, 10)
  const selectuserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await database.get(selectuserQuery)
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const createUserQuery = `
      INSERT INTO
      user (username, name, password, gender, location)
      VALUES
      ('${username}','${name}','${hashedPassword}','${gender}','${location}' );`
      await database.run(createUserQuery)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})
//api 2
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectuserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await database.get(selectuserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isposswordMached = await bcrypt.compare(password, dbUser.password)
    if (isposswordMached === true) {
      response.send('Login success!')
    } else {
      response.send('Invalid password')
    }
  }
})

//api 3

app.put('/change-password/', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const selectuserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await database.get(selectuserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('user not rigistered')
  } else {
    const ispossword = await bcrypt.compare(oldPassword, dbUser.password)
    if (ispossword === true) {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const encyptedpassword = await bcrypt.hash(newPassword, 10)
        const updatePasswordQuery = `
        UPDATE user
        SET password = '${encyptedpassword}'
        WHERE username = '${username}';
        `
        await database.run(updatePasswordQuery)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})
module.exports = app
