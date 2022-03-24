
const res = require("express/lib/response")

//class handles game logic
class Game {



    constructor(id, socketID, io,name) {

        this.id = id
        this.p1 = socketID
        this.p2 = null
        this.p1Name = null
        this.p2Name = null
        this.waiting = true
        this.counter = [0, 0, 0, 0, 0, 0, 0]
        this.io = io

        this.state = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]

        this.currentPlayer = -1

    }

    //if second player joins
    secondPlayer(id) {

        this.p2 = id
        this.waiting = false


        this.io.to(this.p1).emit("gameStart", this.id, false)
        this.io.to(this.p2).emit("gameStart", this.id, true)

        this.io.to(this.p2).emit("gameStart", this.id, true)



    }

    setNames(id,name){

        if (id == this.p1) {
            this.p1Name = name
            this.io.to(this.p2).emit("oName", this.p1Name)


        } else {
            this.p2Name = name
            this.io.to(this.p1).emit("oName", this.p2Name)

        }

    }

    //handles player turn
    turn(playerID, column) {

        if (!((playerID == this.p1 && this.currentPlayer == 1) || (playerID == this.p2 && this.currentPlayer == -1))) {


        } else {

            if (this.counter[column] === 6) {

                return

            }
            this.counter[column] += 1
            this.state[6 - this.counter[column]][column] = this.currentPlayer
            this.currentPlayer = this.currentPlayer * (-1)
            this.io.to(this.p1).emit("turn", [6 - this.counter[column], column, this.currentPlayer])
            this.io.to(this.p2).emit("turn", [6 - this.counter[column], column, this.currentPlayer])


            this.checkgamestate([column, 6 - this.counter[column]])
        }

    }


    //handles player disconnecting
    disconnect(id) {

        if (id == this.p1) {
            this.io.to(this.p2).emit("close")
        } else {

            this.io.to(this.p1).emit("close")
        }


    }


    //check if game is over
    checkgamestate(move) {


        var x = move[0]
        var y = move[1]

        let count = 0
        this.counter.forEach(element => {

            count += element


        })

        //check if draw
        if (count === 42) {

            this.io.to(this.p1).emit("gameEnd", 3)
            this.io.to(this.p2).emit("gameEnd", 3)
        }

        //check player turn

        let currentPlayer = this.state[y][x]

        var result = this.checkWinOrLose(x, y)

        if (result == 1) {


            if (currentPlayer == -1) {
                this.io.to(this.p1).emit("gameEnd", 2)
                this.io.to(this.p2).emit("gameEnd", 1)
            } else {
                this.io.to(this.p1).emit("gameEnd", 1)
                this.io.to(this.p2).emit("gameEnd", 2)
            }
        }


    }

    checkWinOrLose(result, rowNum) {
        //  For checking whether any win or lose condition is reached. Returns 1 if win or lose is reached. else returns 0
        //  grid[][] is the 6X7 matrix
        //  result is the column number where the last coin was placed
        //  rowNum is the row number where the last coin was placed
        // inspired by: https://stackoverflow.com/questions/15457796/four-in-a-row-logic/15457826#15457826


        var grid = this.state

        var player = this.state[rowNum][result]
        if (rowNum <= 2 && grid[rowNum + 1][result] == player && grid[rowNum + 2][result] == player && grid[rowNum + 3][result] == player) { // 4 in a row vertically

            return 1;
        } else {
            var count = 1

            for (var i = result + 1; i < 7; i++) { // 4 in a row horizontally
                if (grid[rowNum][i] != player) break;

                count++;
            }
            for (var i = result - 1; i >= 0; i--) { // 4 in a row horizontally
                if (grid[rowNum][i] != player) break;
                count++;
            }
            if (count >= 4) {

                return 1;
            }
            count = 1;
            for (var i = result + 1, j = rowNum + 1; i < 7 && j < 6; i++, j++) { // 4 in a row diagonally
                if (grid[j][i] != player) break;
                count++;
            }
            for (var i = result - 1, j = rowNum - 1; i >= 0 && j >= 0; i--, j--) { // 4 in a row diagonally
                if (grid[j][i] != player) break;
                count++;
            }
            if (count >= 4) {

                return 1;
            }
            count = 1;
            for (var i = result + 1, j = rowNum - 1; i < 7 && j >= 0; i++, j--) { // 4 in a row diagonally
                if (grid[j][i] != player) break;
                count++;
            }
            for (var i = result - 1, j = rowNum + 1; i >= 0 && j < 6; i--, j++) { // 4 in a row diagonally
                if (grid[j][i] != player) break;
                count++;
            }
            if (count >= 4) {

                return 1;
            }
        }
        return 0;
    }


}


//export class
module.exports.Game = Game