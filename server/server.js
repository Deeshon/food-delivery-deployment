const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')

const apiRouter = require('./routes/api')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use("/api", apiRouter)

app.use(express.static(path.join(__dirname, '../client/build')))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"))
})


mongoose.connect("mongodb+srv://deeshonhunukumbura18:nyctophile101@cluster0.4xj5v0f.mongodb.net/delivery-app?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Conected to DB")).catch(console.error)


app.listen(3001, () => console.log("Server started on port 3001"))