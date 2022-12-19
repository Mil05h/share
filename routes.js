const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, validPassword, genPassword, isAuth, validate_share, validate_comment, is_admin, userExists, have_cookie } = require('./middleware')
const mysql = require('mysql')
const passport = require('passport');
const catchAsyncErr = require('./utils/catchAsyncErr')

////////////////////////////// DEVELOPMENT LOCAL DB /////////////////////////////
const connection = mysql.createConnection({
    host: process.env.AWS_RDS_HOST,
    port: process.env.AWS_RDS_PORT,
    user: process.env.AWS_RDS_USER,
    password: process.env.AWS_RDS_PASSWORD,
    database: process.env.AWS_RDS_DATABASE,
    multipleStatements: true
});
////////////////////////////// DEVELOPMENT LOCAL DB /////////////////////////////


///////////////////////////////// PRODUCTION DB ///////////////////////////////////
// const connection = mysql.createConnection(process.env.JAWSDB_URL);
///////////////////////////////// PRODUCTION DB ///////////////////////////////////


router.route('/admin_777')
    .get((req, res) => {
        if (req.session.passport) {
            res.redirect('/admin_page_777')
        } else {
            res.render('login_admin')
        }
    })

router.route('/admin_page_777')
    .get(isLoggedIn, (req, res) => {
        const q = `SELECT 
            (
                SELECT COUNT(*) FROM posts WHERE is_admin_verified = 0
            ) AS new_posts,
            (
                SELECT COUNT(*) FROM posts  WHERE is_admin_verified = 1
            ) AS displayed_posts,
            (
                SELECT COUNT(*) FROM comments WHERE is_admin_verified = 0
            ) AS new_com,
            (
                SELECT COUNT(*) FROM comments WHERE is_admin_verified = 1
            ) AS displayed_com,
            (
                SELECT COUNT(*) FROM admins WHERE is_admin = 0
            ) AS created_adm,
            (
                SELECT is_admin FROM admins WHERE id = ${req.session.passport.user}
            ) AS is_admin;`;
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.render('admin_page', { results })
        });

    })

router.route('/admin_777/new')
    .get((req, res) => {
        const q = "SELECT username FROM admins WHERE id != 1;";
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.render('manage_admins', { results })
        });

    })

router.route('/admin_777/shares')
    .get(isLoggedIn, (req, res) => {
        const q = `SELECT 
                (
                    SELECT COUNT(*)  FROM posts WHERE is_admin_verified = 1
                ) AS count, 
                post_text, 
                id 
                FROM posts 
                WHERE is_admin_verified = 0 
                ORDER BY created_at
                ;`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.render('manage_posts', { results })
        });

    })

router.route('/admin_777/comments')
    .get(isLoggedIn, (req, res) => {
        const q = `SELECT 
                ( 
                    SELECT COUNT(*) FROM comments WHERE is_admin_verified = 1
                ) AS count,
                comment_text, 
                id, 
                post_id 
                FROM comments 
                WHERE is_admin_verified = 0 
                ORDER BY created_at
                ;`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.render('manage_comments', { results })
        });

    })

router.route('/')
    .get((req, res) => {
        const q1 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.id) AS comment_count 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id AND comments.is_admin_verified = 1
                    GROUP BY posts.id 
                    ORDER BY posts.id DESC
                    ;`

        const q2 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.post_id) AS comment_count 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id AND comments.is_admin_verified = 1
                    GROUP BY posts.id 
                    ORDER BY posts.approve DESC;`
        const q3 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.post_id) AS comment_count 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id AND comments.is_admin_verified = 1
                    GROUP BY posts.id 
                    ORDER BY posts.condemn DESC
                    ;`

        const q4 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.post_id) AS comment_count 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id AND comments.is_admin_verified = 1
                    GROUP BY posts.id 
                    ORDER BY comment_count DESC
                    ;`

        const q5 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.post_id) AS comment_count, 
                    posts.approve + posts.condemn + COUNT(comments.post_id) AS popular 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id AND comments.is_admin_verified = 1
                    GROUP BY posts.id 
                    ORDER BY popular DESC
                    ;`

        const q6 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.post_id) AS comment_count 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id AND comments.is_admin_verified = 1
                    GROUP BY posts.id 
                    ORDER BY RAND()
                    ;`
        if (req.query.sort === 'approve') {
            connection.query(q2, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results })
            });

        }
        else if (req.query.sort === 'condemn') {
            connection.query(q3, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results })
            });

        }
        else if (req.query.sort === 'comments') {
            connection.query(q4, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results })
            });

        }
        else if (req.query.sort === 'popular') {
            connection.query(q5, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results })
            });

        }
        else if (req.query.sort === 'random') {
            connection.query(q6, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results })
            });

        }
        else if (req.query.date) {
            const q_7 = `SELECT 
                    posts.id, posts.post_text, posts.is_admin_verified, posts.created_at,
                    posts.approve, posts.condemn, COUNT(comments.post_id) AS comment_count 
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id 
                    WHERE posts.created_at
                    BETWEEN '${req.query.date}'
                        AND '${req.query.date} 23:59:59'
                    GROUP BY posts.id 
                    ORDER BY posts.id DESC
                    ;`
            connection.query(q_7, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results })
            });

        }
        else {
            const pages = req.query.pages_num || 10;
            connection.query(q1, function (error, results, fields) {
                if (error) throw error;
                res.render('home', { results, pages })
            });

        }
    })

router.route('/:post_id/comment')
    .get((req, res) => {
        const q_1 = `SELECT 
                    post_text, posts.id AS post_id, posts.is_admin_verified AS post_is_admin_verified, 
                    posts.created_at AS post_created_at, posts.approve AS post_approve, posts.condemn AS post_condemn,
                    IFNULL(comments.id, 0) AS comment_id, IFNULL(comment_text, '/') AS 'comment_text', 
                    IFNULL(comments.is_admin_verified, 0) AS comment_is_admin_verified, IFNULL(comments.approve, 0) AS comment_approve, 
                    IFNULL(comments.condemn, 0) AS comment_condemn, IFNULL(comments.created_at, 0) AS comment_created_at
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id
                    WHERE posts.id = ${req.params.post_id} 
                    ORDER BY comments.created_at DESC;`

        const q_2 = `SELECT 
                    post_text, posts.id AS post_id, posts.is_admin_verified AS post_is_admin_verified, 
                    posts.created_at AS post_created_at, posts.approve AS post_approve, posts.condemn AS post_condemn,
                    IFNULL(comments.id, 0) AS comment_id, IFNULL(comment_text, '/') AS 'comment_text', 
                    IFNULL(comments.is_admin_verified, 0) AS comment_is_admin_verified, IFNULL(comments.approve, 0) AS comment_approve, 
                    IFNULL(comments.condemn, 0) AS comment_condemn, IFNULL(comments.created_at, 0) AS comment_created_at
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id
                    WHERE posts.id = ${req.params.post_id} 
                    ORDER BY comments.approve DESC;`

        const q_3 = `SELECT 
                    post_text, posts.id AS post_id, posts.is_admin_verified AS post_is_admin_verified, 
                    posts.created_at AS post_created_at, posts.approve AS post_approve, posts.condemn AS post_condemn,
                    IFNULL(comments.id, 0) AS comment_id, IFNULL(comment_text, '/') AS 'comment_text', 
                    IFNULL(comments.is_admin_verified, 0) AS comment_is_admin_verified, IFNULL(comments.approve, 0) AS comment_approve, 
                    IFNULL(comments.condemn, 0) AS comment_condemn, IFNULL(comments.created_at, 0) AS comment_created_at
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id
                    WHERE posts.id = ${req.params.post_id} 
                    ORDER BY comments.condemn DESC;`

        const q_4 = `SELECT 
                    post_text, posts.id AS post_id, posts.is_admin_verified AS post_is_admin_verified, 
                    posts.created_at AS post_created_at, posts.approve AS post_approve, posts.condemn AS post_condemn,
                    IFNULL(comments.id, 0) AS comment_id, IFNULL(comment_text, '/') AS 'comment_text', 
                    IFNULL(comments.is_admin_verified, 0) AS comment_is_admin_verified, IFNULL(comments.approve, 0) AS comment_approve, 
                    IFNULL(comments.condemn, 0) AS comment_condemn, IFNULL(comments.created_at, 0) AS comment_created_at
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id
                    WHERE posts.id = ${req.params.post_id} 
                    ORDER BY RAND();`

        const q_5 = `SELECT 
                    post_text, posts.id AS post_id, posts.is_admin_verified AS post_is_admin_verified, 
                    posts.created_at AS post_created_at, posts.approve AS post_approve, posts.condemn AS post_condemn,
                    IFNULL(comments.id, 0) AS comment_id, IFNULL(comment_text, '/') AS 'comment_text', 
                    IFNULL(comments.is_admin_verified, 0) AS comment_is_admin_verified, IFNULL(comments.approve, 0) AS comment_approve, 
                    IFNULL(comments.condemn, 0) AS comment_condemn, IFNULL(comments.created_at, 0) AS comment_created_at,
                    IFNULL(comments.approve + comments.condemn, 0) AS popular
                    FROM posts 
                    LEFT JOIN comments ON posts.id = comments.post_id
                    WHERE posts.id = ${req.params.post_id} 
                    ORDER BY popular DESC;`

        const q = req.query.sort;
        if (q === 'approve') {
            connection.query(q_2, function (error, results, fields) {
                if (error) throw error;
                res.render('comments', { results })
            });

        }
        else if (q === 'condemn') {
            connection.query(q_3, function (error, results, fields) {
                if (error) throw error;
                res.render('comments', { results })
            });

        }
        else if (q === 'random') {
            connection.query(q_4, function (error, results, fields) {
                if (error) throw error;
                res.render('comments', { results })
            });

        }
        else if (q === 'popular') {
            connection.query(q_5, function (error, results, fields) {
                if (error) throw error;
                res.render('comments', { results })
            });

        }
        else {
            connection.query(q_1, function (error, results, fields) {
                if (error) throw error;
                res.render('comments', { results })
            });

        }
    })

router.post('/logout/admin_777', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Admin Logouted')
        res.redirect('/');
    });
});

router.route('/login_admin_777')
    .post(passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/admin_777'
    }), (req, res) => {
        connection.query(`SELECT username FROM admins WHERE id = ${req.session.passport.user};`, function (error, results, fields) {
            if (error) throw error;
            req.flash('success', `Welcome ${results[0].username}`)
            res.redirect('/admin_page_777')
        });

    });

router.route('/register_admin_777')
    .post( userExists, (req, res, next) => {
        const saltHash = genPassword(req.body.password);
        const salt = saltHash.salt;
        const hash = saltHash.hash;
        connection.query(`INSERT INTO admins(username, hash, salt) VALUES("${req.body.username}", "${hash}", "${salt}")`, function (error, results, fields) {
            if (error) {
                console.log('error')
            } else {
                console.log('successfuly inserted')
            }
        })

        req.flash('success', 'New admin created')
        res.redirect('/admin_777/new')
    });

router.route('/2804_ml_new_share')
    .post(have_cookie, validate_share, (req, res) => {
        if (!req.body) {
            req.flash('error', 'Cannot share empty post')
            res.redirect('/')
        } else {

            const q = `INSERT INTO posts(post_text) VALUE("${req.body.post_text}");`
            connection.query(q, function (error, results, fields) {
                if (error) throw error;
                res.cookie('cookie', 'shared', {
                    httpOnly: true,
                    // secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                })
                req.flash('success', `Share #${results.insertId} will be posted after Administrators review it.`)
                res.redirect('/')
            });

        }
    })

router.route('/:post_id/comment/2804_ml')
    .post(validate_comment, (req, res) => {
        if (!req.body) {
            req.flash('error', 'Cannot share empty post')
            res.redirect('/')
        } else {

            const q = `INSERT INTO comments(comment_text, post_id) VALUE("${req.body.comment_text}", ${req.params.post_id});`
            connection.query(q, function (error, results, fields) {
                if (error) throw error;
                req.flash('success', 'Comment will be posted afrer Adminisitratos review it')
                res.redirect(`/${req.params.post_id}/comment`)
            });

        }
    })

router.route('/28approve04/:post_id/post')
    .post((req, res) => {
        const q = `UPDATE posts SET approve = approve + 1 WHERE id = ${req.params.post_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            if (req.cookies.cookie_1) {
                res.cookie('cookie_1', { items: [...req.cookies.cookie_1.items, req.params.post_id + 'a'] }, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24
                })
            } else {
                res.cookie('cookie_1', { items: [req.params.post_id + 'a'] }, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24
                })
            }
            res.send('all good')
        });

    })

router.route('/28condemn04/:post_id/post')
    .post((req, res) => {
        const q = `UPDATE posts SET condemn = condemn + 1 WHERE id = ${req.params.post_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            if (req.cookies.cookie_1) {
                res.cookie('cookie_1', { items: [...req.cookies.cookie_1.items, req.params.post_id] }, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24
                })
            } else {
                res.cookie('cookie_1', { items: [req.params.post_id] }, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24
                })
            }
            res.send('all good')
        });

    })

router.route('/28approve04/:comment_id/comment')
    .post((req, res) => {
        const q = `UPDATE comments SET approve = approve + 1 WHERE id = ${req.params.comment_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            if (req.cookies.cookie_2) {
                res.cookie('cookie_2', { items: [...req.cookies.cookie_2.items, req.params.comment_id + 'a'] }, {
                    httpOnly: true,
                    // secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                })
            } else {
                res.cookie('cookie_2', { items: [req.params.comment_id + 'a'] }, {
                    httpOnly: true,
                    // secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                })
            }
            res.send('all good')
        });

    })

router.route('/28condemn04/:comment_id/comment')
    .post((req, res) => {
        const q = `UPDATE comments SET condemn = condemn + 1 WHERE id = ${req.params.comment_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            if (req.cookies.cookie_2) {
                res.cookie('cookie_2', { items: [...req.cookies.cookie_2.items, req.params.comment_id] }, {
                    httpOnly: true,
                    // secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                })
            } else {
                res.cookie('cookie_2', { items: [req.params.comment_id] }, {
                    httpOnly: true,
                    // secure: true,
                    maxAge: 1000 * 60 * 60 * 24
                })
            }
            res.send('all good')
        });

    })


router.route('/admin_777/_share_/approve_/:post_id')
    .patch(isLoggedIn, (req, res) => {
        const q = `UPDATE posts SET is_admin_verified = 1 WHERE id = ${req.params.post_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/admin_777/shares')
        });

    })

router.route('/admin_777/delete_/:username')
    .delete(is_admin, (req, res) => {
        const q = `DELETE FROM admins WHERE username = "${req.params.username}";`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/admin_777/new')
        });

    })

router.route('/admin_777/_share_/delete_/:post_id')
    .delete(isLoggedIn, (req, res) => {
        const q = `DELETE FROM posts WHERE id = ${req.params.post_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/admin_777/shares')
        });

    })

router.route('/admin_777/_comment_/approve_/:comment_id')
    .patch(isLoggedIn, (req, res) => {
        const q = `UPDATE comments SET is_admin_verified = 1 WHERE id = ${req.params.comment_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/admin_777/comments')
        });

    })

router.route('/admin_777/_comment_/delete_/:comment_id')
    .delete(isLoggedIn, (req, res) => {
        const q = `DELETE FROM comments WHERE id = ${req.params.comment_id};`
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/admin_777/comments')
        });

    })


module.exports = router;

