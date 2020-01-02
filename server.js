const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require('knex');

const register = require("./controllers/register");

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
      /* host : '127.0.0.1', */
      /* user : 'postgres',
      password : 'fishes12',
      database : 'smartbrain' */
    }
  });

const app = express();
app.use(express.json());
app.use(cors());

db.select("*").from("users").then(data => {
    console.log(data);
});

const database = {
    users:[
        {
            id:"123",
            name: "John",
            email: "john@gmail.com",
            password: "cookies",
            entries: 0,
            joined: new Date()
        },
        {
            id:"124",
            name: "Sally",
            email: "sally@gmail.com",
            password: "bananas",
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: "987",
            hash: "",
            email: "john@gmail.com"
        }
    ]
}


app.get("/", (req,res)=>{
    res.send("It is working!!!");
})


app.post("/signin", (req, res) =>{
    const {email, password} = req.body;
    if (!email|| !password) {
        return res.status(400).json("incorrect submission");
    }
   db.select('email', 'hash').from('login')
   .where ('email',  req.body.email)
   .then (data => {
    
    const isValid =  bcrypt.compareSync(req.body.password, data[0].hash);
    
    if (isValid) {
       return db.select('*').from('users')
        .where ('email', '=', req.body.email)
        .then (user => {
            res.json(user[0])
        })
        .catch(err => res.status(400).json("unable to get user"));
    } else {
        res.status(400).json("wrong credentials");
    }

   })
   .catch(err => res.status(400).json("wrong credentials"));
})

app.post("/register", (req, res) => {register.handleRegister(req, res, db, bcrypt)});

app.get("/profile/:id", (req,res)=>{
    const {id} = req.params;
    db.select('*').from('users')
    .where ({
        id: id
    })
    .then(user => {
        if (user.length) {
        res.json(user[0]);
    } else {
        res.status(400).json("not found");
    }
    })
    .catch(err => res.status(400).json("error getting user"))
    
})

app.put("/image", (req,res) =>{
    const {id} = req.body;
    db('users').where('id', '=',id)
    .increment('entries',1)
    .returning('entries')
    .then (entries => {
        res.json(entries[0]);
    })
       .catch(err => res.status(400).json("unable to get entries"))  
    })
  /*   if (!found) {
        res.status(400).json("not found");
    }

}) */

app.listen (process.env.PORT || 3000, () =>{
    console.log(`app is running on port ${process.env.PORT}`);
})



/* / 
--> res = this is working
/signin --> POST =success/failure
/register --> POST = user
/profile/:userID --> GET = user
/image --> PUT --> user 
*/