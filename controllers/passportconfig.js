const LocalStrategy = require("passport-local").Strategy
const { query } = require('../src/mysql/query.js')
const bcrypt = require("bcrypt")

function initialize(passport) {
    const autheticateUser = (email, password, done) => {
        query.checkemail(email, (err, result) => {
            if (err) {
                throw err
            }
            // console.log(result)
            if (result.length > 0) {
                const user = result[0]
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if (err) {
                        throw err
                    }

                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: "Password is not correct" });
                    }
                });
            } else {
                return done(null, false, { message: "Email is not registered" });
            }
        })
    }

    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        autheticateUser)
    )

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        query.SelectUserID(id, (err, results) => {
            if (err) {
                throw err
            }
            return done(null, results[0])
        })
    })


}

module.exports = initialize