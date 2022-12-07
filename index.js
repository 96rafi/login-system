const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config({ path: './config/config.env' })
const PORT = process.env.PORT || 4000
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const router = require('./routes/routes')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')


app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))


app.use(passport.initialize());
app.use(passport.session());
require('./controllers/passportconfig')(passport);
// app.use(flash)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride("_method"))

const hbs = exphbs.create({
    defaultLayout: "admin",
    //create custom helpers
    helpers: {}
})

app.use(flash())
//configure Express Handlebars
app.engine("handlebars", hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.json())
app.use("/", router)


app.listen(PORT, () => {
    console.log(`The server is up on ${PORT}`)
})