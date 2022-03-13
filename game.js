const res = require("express/lib/response")

class Game {

    constructor(id, socketID, io) {

        this.id = id
        this.p1 = socketID
        this.p2 = null
        this.waiting = true
        this.counter = [0, 0, 0, 0, 0, 0, 0]
        this.io = io

        this.state = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]

        this.currentPlayer = -1

    }

    secondPlayer(id) {

        this.p2 = id
        this.waiting = false


        this.io.to(this.p1).emit("gameStart", this.id, false)
        this.io.to(this.p2).emit("gameStart", this.id, true)


    }

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

    disconnect(id) {

        if (id == this.p1) {
            this.io.to(this.p2).emit("close")
        } else {

            this.io.to(this.p1).emit("close")
        }


    }


    checkgamestate(move) {

        //check if draw
        var x = move[0]
        var y = move[1]

        let count = 0
        this.counter.forEach(element => {

            count += element


        })

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
        // quelle: https://stackoverflow.com/questions/15457796/four-in-a-row-logic/15457826#15457826

        // 1 horizontal
        // 2 vertical
        // 3 diagonal links oben
        // 4 diagonal links unten

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

module.exports.Game = Game