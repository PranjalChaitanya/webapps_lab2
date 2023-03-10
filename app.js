const express = require('express')
const app = express()
const logger = require("morgan");

const db = require('./db/db_connection');

const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

const port = 8080

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.use(auth(config));
app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));
app.use( express.urlencoded({ extended: false }) );
app.use(requiresAuth());

app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})

app.get( "/", ( req, res ) => {
    res.render('index');
} );


const read_stuff_all_sql = `
    SELECT 
        id, item, quantity
    FROM
        stuff

    WHERE
        userid = ?
`
app.get( "/stuff", requiresAuth(), ( req, res ) => {
    db.execute(read_stuff_all_sql, [req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.render('stuff', { inventory : results });
        }
    });
} );

app.get( "/", ( req, res ) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
} );

const update_item_sql = `
    UPDATE
        stuff
    SET
        item = ?,
        quantity = ?,
        description = ?
    WHERE
        id = ?
    AND
        userid = ?
`
app.post("/stuff/item/:id",requiresAuth(), ( req, res ) => {
    console.log(req.body.quantity)
    console.log(req.body.name)
    console.log(req.body.description)
    db.execute(update_item_sql, [req.body.name, req.body.quantity, req.body.description, req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect(`/stuff/item/${req.params.id}`);
        }
    });
})

const read_item_sql = `
    SELECT 
        id, item, quantity, description 
    FROM
        stuff
    WHERE
        id = ?
    AND
        userid = ?
`
app.get( "/stuff/item/:id", requiresAuth(), ( req, res ) => {
    db.execute(read_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No item found with id = "${req.params.id}"` ); // NOT FOUND
        else
            data = results[0]; // results is still an array
            res.render('item', data);
    });
});

const delete_item_sql = `
    DELETE 
    FROM
        stuff
    WHERE
        id = ?
    AND
        userid = ?
`
app.get("/stuff/item/:id/delete", requiresAuth(), ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/stuff");
        }
    });
})

const create_item_sql = `
    INSERT INTO stuff
        (item, quantity, userid)
    VALUES
        (?, ?, ?)
`
app.post("/stuff", requiresAuth(), ( req, res ) => {
    db.execute(create_item_sql, [req.body.name, req.body.quantity, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/stuff/item/${results.insertId}`);
        }
    });
})

// req.isAuthenticated is provided from the auth router
app.get('/authtest', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

app.listen(port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
});