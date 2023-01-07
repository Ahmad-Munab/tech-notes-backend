// Importinng required files
require('events').EventEmitter.defaultMaxListeners = Infinity;
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path")

const PORT = process.env.PORT || 3500
const DATABASE_URI = process.env.DATABASE_URI
const CORS_ACCESS_URLS = process.env.CORS_ACCESS_URLS || null
const app = express()

// Connecting to MongoDB
mongoose.set('strictQuery', true)
const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URI)
    } catch (err) {
        console.log(err)
    }
}
connectDB()

// Midlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: '*',
    methods: ["GET","POST","PUT","PATCH","DELETE"]
}))

// Defining the routs and static files
app.use('/', express.static(path.join(__dirname, './public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/usersRoutes'))
app.use('/notes', require('./routes/notesRoutes'))

app.all("*", (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, './views/404.html'))
    } else if (req.accepts("json")) {
        res.json({ message: "404 Not found" })
    } else {
        res.type("txt").send("404 Not found")
    }
})

// Starting server and MongoDB
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

//Checking for err in MongoDB
mongoose.connection.on("error", err => {
    console.log(err)
})