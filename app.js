if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express')
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/expressError');
const helmet = require('helmet')
const routes = require('./routes');
const cookieParser = require('cookie-parser')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql')
const { validPassword, genPassword, isAuth, isAdmin, userExists } = require('./middleware')




const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com"
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    // "https://www.sandbox.paypal.com"
];

const fontSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://fonts.gstatic.com",
];


app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/de0mchrco/",
                "https://images.unsplash.com",
                "https://upload.wikimedia.org/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const options = {
    host: process.env.AWS_RDS_HOST,
    port: process.env.AWS_RDS_PORT,
    user: process.env.AWS_RDS_USER,
    // password: process.env.AWS_RDS_PASSWORD,
    // database: process.env.AWS_RDS_DATABASE,
};

const sessionStore = new MySQLStore(options);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser())
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

////////////////////////////// DEVELOPMENT LOCAL DB /////////////////////////////
const connection = mysql.createConnection({
    host: process.env.AWS_RDS_HOST,
    port: process.env.AWS_RDS_PORT,
    user: process.env.AWS_RDS_USER,
    // password: process.env.AWS_RDS_PASSWORD,
    // database: process.env.AWS_RDS_DATABASE,
    multipleStatements: true
});
////////////////////////////// DEVELOPMENT LOCAL DB /////////////////////////////

///////////////////////////////// PRODUCTION DB ///////////////////////////////////
// const connection = mysql.createConnection(process.env.JAWSDB_URL);
///////////////////////////////// PRODUCTION DB ///////////////////////////////////


const customFields = {
    usernameField: 'username',
    passwordField: 'password'
}

// passport
const verifyCallback = (username, password, done) => {

    connection.query(`SELECT * FROM admins WHERE username = "${username}"`, function (error, results, fields) {
        if (error)
            return done(error);
        if (results.length == 0) {
            return done(null, false);
        }
        const isValid = validPassword(password, results[0].hash, results[0].salt);
        const user = { id: results[0].id, username: results[0].username, hash: results[0].hash, salt: results[0].salt };
        if (isValid) {
            return done(null, user)
        } else {
            return done(null, false);
        }
    })

}
const strategy = new LocalStrategy(customFields, verifyCallback)
passport.use(strategy)

passport.serializeUser((user, done) => {
    console.log("inside serialize")
    done(null, user.id)
});
passport.deserializeUser(function (userId, done) {
    console.log('deserializedUser_' + userId);
    connection.query(`SELECT * FROM admins WHERE id = "${userId}"`, function (error, results) {
        done(null, results[0])
    })
})



app.use((req, res, next) => {
    res.locals.path = req.originalUrl;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.cookie_1 = req.cookies.cookie_1 || 'none';
    res.locals.cookie_2 = req.cookies.cookie_2 || 'none';
    next();
})

app.use('/', routes)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    console.log(err)
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err, statusCode });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express app is runnign on port: ${port}`)
});