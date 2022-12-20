const ExpressError = require('./utils/expressError');
const mysql = require('mysql')
const crypto = require('crypto')
const { validate_share_schema, validate_comment_schema } = require('./schemas.js');

const connection = mysql.createConnection({
    host: process.env.AWS_RDS_HOST,
    port: process.env.AWS_RDS_PORT,
    user: process.env.AWS_RDS_USER,
    password: process.env.AWS_RDS_PASSWORD,
    database: process.env.AWS_RDS_DATABASE,
    multipleStatements: true
});

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Not authorized')
        return res.redirect('/');
    } else {
        next()
    }
}

module.exports.validPassword = (password, hash, salt) => {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex');
    return hash === hashVerify
}

module.exports.genPassword = (password) => {
    const salt = crypto.randomBytes(32).toString('hex')
    const genhash = crypto.pbkdf2Sync(password, salt, 10000, 60, 'sha512').toString('hex');
    return { salt: salt, hash: genhash }
}

module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        req.flash('error', 'not auth')
        res.redirect('/')
    }
}

module.exports.is_admin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.id === 3) {
        next()
    } else {
        req.flash('error', 'Access denied')
        res.redirect('/')
    }
}

module.exports.userExists = (req, res, next) => {
    connection.query(`SELECT * FROM admins WHERE username = "${req.body.uname}"`, function (error, results, fields) {
        if (error) {
            const msg = error.details.map(el => el.message).join(',');
            throw new ExpressError(msg, 500)
        } else if (results.length > 0) {
            req.flash('error', 'User already exist.')
            res.redirect('/')
        } else {
            next()
        }
    })

}

module.exports.have_cookie = (req, res, next) => {
    if (req.cookies.cookie) {
        req.flash('error', 'One share/day allowed.')
        res.redirect('/')
    } else {
        next()
    }
}

module.exports.validate_share = (req, res, next) => {
    const { error } = validate_share_schema.validate(req.body);
    if (error) {
        console.log(error)
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validate_comment = (req, res, next) => {
    const { error } = validate_comment_schema.validate(req.body);
    if (error) {
        console.log(error)
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

