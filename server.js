const express = require('express')
const game = require('./game')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))


var games = []

var id = 1


io.on('connection', socket => {

    let newGame = true
    let g = null


    for (let obj of games) {

        if (obj.waiting) {
            g = obj
            newGame = false
            break
        }
    }

    if (newGame) {

        games.push(new game.Game(id, socket.id, io))
        ++id

    } else {
        if (g != null) g.secondPlayer(socket.id)
    }

    socket.on("disconnect", (reason) => {

        for (var i = 0; i < games.length; i++) {

            if (games[i].p1 == socket.id || games[i].p2 == socket.id) {

                games[i].disconnect(socket.id)
                games.splice(i, 1)
                break
            }
        }


    })

    socket.on("turn", (id, playerId, column) => {


        for (let obj of games) {

            if (obj.id == id) {
                obj.turn(playerId, column)

                break
            }
        }


    })


})

app.get('/', (req, res) => {

    res.render('index')

})

app.get('/test', (req, res) => {


    res.render('test')

})

server.listen(3000)