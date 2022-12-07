const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { query } = require('../src/mysql/query.js')
const flash = require('express-flash')
const passport = require("passport");
const initializePassport = require("../controllers/passportconfig.js");
initializePassport(passport)
const jwt = require('jsonwebtoken')



//Home route
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Start Page' })
})


//Register route
router.get('/register', (req, res, next) => {
    res.render('register')
})


router.post("/register", async (req, res) => {
    let { name, email, password } = req.body

    // console.log({
    //     name,
    //     email,
    //     password
    // })

    let errors = []
    var hashedpassword
    if (!name || !email || !password) {
        errors.push({ message: "Please enter all fields" });
    }
    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if (errors.length > 0) {
        res.render("register", { errors })
    } else {

        // Form validation has done


        query.checkemail(email, (err, result) => {
            if (err) {
                console.log(err)
            }

            //checking if user is in db or then add new one
            if (result[0]) {
                errors.push({ message: "Email already registered" })
                res.render("register", { errors })
            }
        })

        await bcrypt.hash(password, 10, function (err, hash) {
            query.InsertUser(name, email, hash, (err, user) => {
                if (err) {
                    console.log(err)
                } else {

                    req.flash("success_msg", "You are now registered.Please log in");
                    res.redirect("/login")
                }
            })
        });

    }
})


//Login route
router.get('/login', (req, res, next) => {
    res.render('login', { message: req.flash("success_msg") })
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
    successMessage: true
}))


router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
})

const JWT_SECRET = 'some super secret...'
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password')
})
router.post('/forgot-password', (req, res) => {
    const { email } = req.body
    query.checkemail(email, (err, user) => {
        if (err) {
            res.send(err)
        }
        if (!user[0]) {
            req.flash("error", "We Coudn't find the user, please enter a valid email");
            res.redirect("/forgot-password")
        } else {
            const secret = JWT_SECRET + user[0].password
            const payload = {
                email: user[0].email,
                id: user[0].id
            }
            const token = jwt.sign(payload, secret, { expiresIn: '15m' })
            const link = `http://localhost:5000/reset-password/${user[0].id}/${token}`
            console.log(link)
            res.send('Password reset link has been sent to your email')
        }
    })
})


router.get('/reset-password/:id/:token', (req, res) => {
    const { id, token } = req.params
    query.SelectUserID(id, (err, user) => {
        if (err) {
            return res.send(err)
        }
        if (user[0].id != id) {
            res.send('Invalid id...')
            return
        } else {
            const secret = JWT_SECRET + user[0].password
            try {
                const payload = jwt.verify(token, secret)
                res.render('reset-password', { email: user[0].email })
            } catch (error) {
                console.log(error.message)
                res.send(error.message)
            }
        }
    })
})

router.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params
    const { password } = req.body
    query.SelectUserID(id, (err, user) => {
        if (err) {
            return res.send(err)
        }
        if (user[0].id != id) {
            res.send('Invalid id...')
            return
        } else {
            const secret = JWT_SECRET + user[0].password
            try {
                const payload = jwt.verify(token, secret)
                bcrypt.hash(password, 10, function (err, hash) {
                    query.updateUserPassword(hash, id, (err, data) => {
                        if (err) {
                            return res.send(err)
                        } else {
                            console.log(data)
                            return res.send(data)
                        }
                    })
                })
            } catch (error) {
                console.log(error.message)
                res.send(error.message)
            }
        }
    })
})


router.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard')
})


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/login')
    }

}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next()
}




module.exports = router