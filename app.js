const express = require('express')
const app = express()
const logger = require("morgan");

const port = 8080

app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));

app.get( "/", ( req, res ) => {
    res.sendFile( __dirname + "/views/index.html" );
} );

// define a route for the stuff inventory page
app.get( "/stuff", ( req, res ) => {
    res.sendFile( __dirname + "/views/stuff.html" );
} );

// define a route for the item detail page
app.get( "/stuff/item", ( req, res ) => {
    res.sendFile( __dirname + "/views/item.html" );
} );

app.listen(port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
});