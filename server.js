//package requirements
const express = require('express')
const game = require('./game')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

//setup express app
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))


//init game array
var games = []

var id = 1

//handles socket requests
io.on('connection', (socket, name) => {

    let newGame = true
    let g = null

    //check if an open game exists
    for (let obj of games) {

        if (obj.waiting) {
            g = obj
            newGame = false
            break
        }
    }

    //if no open game exists
    if (newGame) {

        games.push(new game.Game(id, socket.id, io))
        ++id

    } else {
        if (g != null) g.secondPlayer(socket.id)
    }

    socket.on("name", (gId, pId, name) => {
        for (let obj of games) {

            if (obj.id == gId) {
                obj.setNames(pId, name)

                break
            }
        }


    })

    //handles socket disconnects
    socket.on("disconnect", (reason) => {

        for (var i = 0; i < games.length; i++) {

            if (games[i].p1 == socket.id || games[i].p2 == socket.id) {

                games[i].disconnect(socket.id)
                games.splice(i, 1)
                break
            }
        }


    })

    //handles player turn
    socket.on("turn", (id, playerId, column) => {


        for (let obj of games) {

            if (obj.id == id) {
                obj.turn(playerId, column)

                break
            }
        }


    })


})


//renders the webpage
app.get('/', (req, res) => {

    res.render('index')

})


//listen on port 3000 or preferred port of the deployment
server.listen(process.env.PORT || 3000)