const express = require('express');
const knex = require('knex');
require('dotenv').config();

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
    },
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// GET: Fetch all entries from the database
app.get('/', (req, res) => {
    db.select('*')
        .from('entries')
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
        });
});

// GET: Fetch entry by entryId from the database
app.get('/entry/:entryId', (req, res) => {
    const entryId = req.params.entryId;
    db.select('*')
        .from('entries')
        .where('id', '=', entryId)
        .then((data) => {
            console.log(data);
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
        });
});

// POST: Create entries and add them to the database
app.post('/add-entry', (req, res) => {
    const { title, text, location } = req.body;
    db('entries')
        .insert({
            title: title,
            text: text,
            location: location
        })
        .then(() => {
            console.log('Note Added');
            return res.json({ msg: 'Note Added' });
        })
        .catch((err) => {
            console.log(err);
        });
});

// DELETE: Delete entry by entryId from the database
app.delete('/delete-entry/:entryId', (req, res) => {
    const entryId = req.params.body;
    const entryIdToDelete = Number(entryId.entryId);
    console.log(entryIdToDelete);
    db('entries')
        .where('id', '=', entryIdToDelete)
        .del()
        .then(() => {
            console.log('Entry Deleted');
            return res.json({ msg: 'Entry Deleted' });
        })
        .catch((err) => {
            console.log(err);
        });
});

// PUT: Update entry by entryId from the database
app.put('/update-entry/:entryId', (req, res) => {
    const entry = req.params.body;
    const entryIdToUpdate = Number(entry.entry);
    console.log(entryIdToUpdate);
    const title = entry.title
    const text = entry.text

    db('entries')
        .where('id', '=', entryIdToUpdate )
        .update({ title: title,
        text: text})
        .then(() => {
            console.log('Entry Updated');
            return res.json({ msg: 'Entry Updated' });
        })
        .catch((err) => {
            console.log(err);
        });
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}, http://localhost:${port}`));