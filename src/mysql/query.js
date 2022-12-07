const { connection } = require('./connection')

const query = {
    checkemail: function (email, cb) {
        connection.query(`select * from users where email=?`, [email], (err, data) => {
            if (err) {
                return cb(err, null)
            } else {
                return cb(null, data)
            }
        })
    },
    InsertUser: function (name, email, password, cb) {
        connection.query(`insert into users values ('',?,?,?)`, [name, email, password], (err, data) => {
            if (err) {
                return cb(err, null)
            } else {
                return cb(null, data)
            }
        })
    },
    SelectUserID: function (id, cb) {
        connection.query(`select * from users WHERE id=?`, [id], (err, data) => {
            if (err) {
                return cb(err, null)
            } else {
                return cb(null, data)
            }
        })
    },
    updateUserPassword: function (password, id, cb) {
        connection.query(`update users set password = ? where id=?`, [password, id], (err, data) => {
            if (err) {
                return cb(err, null)
            } else {
                return cb(null, data)
            }
        })
    },

}


module.exports = { query }