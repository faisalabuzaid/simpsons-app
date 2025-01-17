'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');
const path = require('path');
const { response, query } = require('express');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended:true}));

// Specify a directory for static resources
app.use(express.static(path.join(__dirname, 'public')));

// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Use app cors
app.use(cors());


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
app.get('/', renderHome);
app.post('/save', saveQuote);
app.get('/favorite-quote', renderFav);
app.get('/quote/:id', getOneQuote);
app.put('/quote/:id', updateOneQuote);
app.delete('/quote/:id', deleteOneQuote);


// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

function renderHome (req, res) {
    const url='https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', '1.0').then(data => {
    
        res.render('index', {'data': data.body});
    });
}

function saveQuote (req, res) {
    const {character, quote, image, characterDirection}=req.body;
    const values = [character, quote, image, characterDirection];
    const SQL ='INSERT INTO quotes (character, quote, image, direction) values ($1, $2, $3, $4)';
    console.log('values', values);

    client.query(SQL, values).then(() => {
       res.redirect('favorite-quote');
    })
    console.log('req.body', req.body.character);

}

function renderFav (req, res) {
    const SQL = 'SELECT * FROM quotes';
    client.query(SQL).then(dataTwo => {
        res.render('favorite-quote', {'data': dataTwo.rows});
    });
}

function getOneQuote(req, res) {
    const id = req.params.id;
    const SQL='select * from quotes where id=$1';
    client.query(SQL, [id]).then(data => {
        res.render('quote', {'element': data.rows[0]});
    })
}

function updateOneQuote(req, res) {
    const id = req.params.id;
    const SQL='UPDATE quotes SET quote=$1 where id=$2';
    client.query(SQL, [req.body.quote, id]).then(data => {
        res.redirect(`../quote/${id}`);
    })
}


function deleteOneQuote (req, res) {
    const id = req.params.id;
    const SQL='delete from quotes where id=$1';
    client.query(SQL, [id]).then(() => {
        res.redirect('../favorite-quote');

    });

}
// helper functions


// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
