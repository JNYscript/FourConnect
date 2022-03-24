//define variables
var gameId = -1
var socket = null
var canMove = false
var yourColor = "black"
var oponentColor = "red"
var yTurn = document.getElementById('y_turn')
var oTurn = document.getElementById('o_turn')


//handles game start
function start() {
    game = new Spiel(ctx)
    game.initDraw()

    document.getElementById('waiting').style.display = "block"
    document.getElementById('waiting_symbol').style.display = "block"

    document.getElementById('disconnected').style.display = "none"
    document.getElementById('win').style.display = "none"
    document.getElementById('defeat').style.display = "none"
    document.getElementById('draw').style.display = "none"

    var div = document.getElementById('b1')
    div.style.display = 'none'
    socket = io()


    //socket connection established
    socket.on("connect", () => {

    })



    //sends start request to server
    socket.on("gameStart", (id, move) => {


        document.getElementById('waiting').style.display = "none"
        document.getElementById('waiting_symbol').style.display = "none"


        canMove = move

        gameId = id

        if (!canMove) {
            yourColor = "#F29F05"
            oponentColor = "#37A647"
        } else {
            yourColor = "#37A647"
            oponentColor = "#F29F05"
        }

        yTurn.style.color = yourColor
        oTurn.style.color = oponentColor

        if (canMove) {
            yTurn.style.display = "block"
            oTurn.style.display = "none"
        } else {
            yTurn.style.display = "none"
            oTurn.style.display = "block"
        }


    })


    //sends turn to server
    socket.on("turn", state => {






        game.update(state)

        canMove = !canMove



        if (canMove) {
            yTurn.style.display = "block"
            oTurn.style.display = "none"
        } else {
            yTurn.style.display = "none"
            oTurn.style.display = "block"
        }
    })


    //handles game ending requests
    socket.on("gameEnd", result => {

        yTurn.style.display = "none"
        oTurn.style.display = "none"
        canMove = false
        div.style.display = "block"

        if (result == 1) {
            document.getElementById('win').style.display = "block"

            return
        }
        if (result == 2) {
            document.getElementById('defeat').style.display = "block"
            return
        }
        if (result == 3) {
            document.getElementById('draw').style.display = "block"
            return
        }


    })


    //handles close requests
    socket.on("close", () => {

        document.getElementById('disconnected').style.display = "block"
        yTurn.style.display = "none"
        oTurn.style.display = "none"
        canMove = false
        div.style.display = "block"

    })
}


//init canvas for board representation
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.shadowColor = 'rgba(204, 204, 204, 0.5)';


//class for single pieces
class Steine {

    constructor(x, y, canvas) {

        this.x = x
        this.y = y

        this.size = 100

        this.state = 0
        this.canvas = canvas

    }

    //draws rectangle around the circle
    drawRect(color) {
        this.canvas.fillStyle = color
        this.canvas.fillRect(this.x, this.y, this.size, this.size)
        this.canvas.fillStyle = 'black'
        this.canvas.strokeRect(this.x, this.y, this.size, this.size)

    }


    //draws the circle
    drawCircle() {

        this.canvas.beginPath()
        this.canvas.arc(this.x + this.size / 2, this.y + this.size / 2, 40, 0, 2 * Math.PI)
        if (this.state === 0) {

            this.canvas.fillStyle = "#EEF2F7"
        }
        if (this.state === 1) {

            this.canvas.fillStyle = "#37A647"
        }
        if (this.state === -1) {

            this.canvas.fillStyle = "#F29F05"
        }

        this.canvas.fill()


        ctx.stroke();
    }



}

//this class handles visual game representation
class Spiel {

    constructor(canvas) {

        this.canvas = canvas

        this.arr = Array.from(Array(7), () => new Array(7))





        for (let x = 0; x < this.arr.length; x++) {
            for (let y = 0; y < this.arr[0].length; y++) {

                this.arr[x][y] = new Steine(x * 100, y * 100, this.canvas)

            }
        }



    }


    //draws the board
    initDraw() {

        this.arr.forEach(row => {

            row.forEach(element => {

                element.drawRect('#1B62BF')
                element.drawCircle()

            })
        });


    }


    //for highlighting the hovered column
    hightlight(column) {


        this.initDraw()
        for (let i = 0; i < 6; i++) {

            this.arr[column][i].drawRect('#1755A6')
            this.arr[column][i].drawCircle()

        }


    }


    //updates the board visually to the current state
    update(move) {

        this.arr[move[1]][move[0]].state = move[2]
        this.arr[move[1]][move[0]].drawCircle()



    }

}




//init game object
var game = new Spiel(ctx)

game.initDraw()

//handles mouse movement over board
canvas.onmousemove = function(e) {

    // important: correct mouse position:

    var pos = (getMousePos(canvas, e).x / 100) | 0

    if (pos > 6) {
        return
    }
    if (game.h == pos) {
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.hightlight(pos)
}


canvas.onmouseout = function(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.initDraw()

}

//handles mouse click on board
canvas.onclick = function(e) {



    if (!canMove) {
        return
    }

    var pos = (getMousePos(canvas, e).x / 100) | 0


    if (pos > 6) {
        return
    }

    if (socket != null) {
        socket.emit("turn", gameId, socket.id, pos)


    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.initDraw()
}

//function to get correct mouse position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}