const express = require('express')
const app = express();
const port = process.env.PORT || 9800;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongourl = "mongodb+srv://jatulapp:jatulapp@cluster0.wf5bt.mongodb.net/restaurent?retryWrites=true&w=majority";

let db;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true,}));
app.use(bodyParser.json())

//health check

app.get('/', (req, res) => {
    res.send('health ok');
});

//city route
app.get('/city', (req, res) => {
    let sortcondition = { city_name: 1 };
    let limit=100
    if (req.query.sort && req.query.limit) {
        sortcondition = { city_name: Number(req.query.sort) };
        limit = Number(req.query.limit)
    }
    else if (req. query.sort) {
        sortcondition = { city_name: Number(req.query.sort) }
    } else if (req.query.limit) {
        limit = Number(req.query.limit)
    }
    db.collection('city').find().sort(sortcondition).limit(limit).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
});
//Rest per city
app.get('/rest/:id', (req, res) => {
    var id = req.params.id
    db.collection('rest').find({ _id: id }).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

//Rest route
app.get('/rest', (req, res) => {
    var condition = {};
    if (req.query.mealtype && req.query.lcost && req.query.hcost) {
        condition = { $and: [{ "type.mealtype": req.query.mealtype }, { cost: { $lt: Number(req.query.hcost), $gt: Number(req.query.lcost) } }] }
    }


    else if (req.query.mealtype && req.query.city) {
        condition = { $and: [{ "type.mealtype": req.query.mealtype }, { city: req.query.city }] }
    }


    else if (req.query.mealtype && req.query.cuisine) {
        condition = { $and: [{ "type.mealtype": req.query.mealtype }, { "Cuisine.cuisine": req.query.cuisine }] }
    }
    else if (req.query.mealtype) {
        condition = { "type.mealtype": req.query.mealtype }
    }
    else if (req.query.city) {
        condition = { city: req.query.city }
    }
    db.collection('restaurent').find(condition).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
});
//mealtype
app.get('/meal', (req, res) => {
    db.collection('mealType').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})
//cuisine
app.get('/cuisine', (req, res) => {
    db.collection('cuisine').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})
//placeorder
app.post('/placeorder', (req, res) => {
    db.collection('orders').insert(req.body, (err, result) => {
        if (err) throw err;
        res.send('data added');
    })
})
//boookings get
app.get('/orders', (req, res) => {
    db.collection('orders').find({}).toArray((err, result) => {
        if (err) throw err;
        res.send(result)

    })
})

//mongodb server connections
MongoClient.connect(mongourl, (err, connection) => {
    if (err) console.log(err);
    db = connection.db('restaurent');
    app.listen(port, (err) => {
        if (err) throw err;
        console.log(`Server is running on port ${port}`)
    })
})
