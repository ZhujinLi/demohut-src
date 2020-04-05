import { ChessboardManager } from "./chessboard_manager";

export class AStarSolver {
    /**
     * 
     * @param {ChessboardManager} mgr 
     * @param {PIXI.Graphics} piece 
     * @param {*} updateCallback 
     */
    constructor(mgr, piece, dstChessPos, updateCallback, finishCallback) {
        this._mgr = mgr;
        this._updateCallback = updateCallback;
        this._finishCallback = finishCallback;
        this._piece = piece;
        this._dstChessPos = dstChessPos;

        this._init();

        document.getElementById('btn-next').disabled = false;
        document.getElementById('btn-next').onclick = this._nextStep.bind(this);
    }

    _init() {
        // Init infomation for all empty grids. Add the starting position
        // to the open list, then immediately add it to the close list.

        let chessboardArray = [];
        for (let i = 0; i < this._mgr.getChessboardSize(); i++) {
            let col = [];
            for (let j = 0; j < this._mgr.getChessboardSize(); j++) {
                let piece = this._mgr.testChessPos({ i: i, j: j });
                let calcF = function () { return this.g + this.h; }
                if (piece == null) {
                    col.push({ i: i, j: j, g: null, h: null, prev: null, state: "unknown", f: calcF });
                } else if (piece == this._piece) {
                    col.push({ i: i, j: j, g: 0, h: this._calcH(i, j), prev: null, state: "open", f: calcF });
                } else {
                    col.push(null);
                }
            }
            chessboardArray.push(col);
        }

        this._chessboardArray = chessboardArray;

        this._nextStep();
    }

    _calcH(i, j) {
        // Mix Euclidean distance with Manhattan distance for better performance
        let x = this._dstChessPos.i - i;
        let y = this._dstChessPos.j - j;
        let manhattan = Math.abs(x) + Math.abs(y);
        let euclidean = Math.sqrt(x * x + y * y);
        return manhattan - 0.001 * 1 / euclidean;
    }

    _nextStep() {
        // Search the open list for the smallest f
        let nextGrid = this._findNextGrid();

        if (nextGrid == null) {
            // All is closed, meaning the destinatnion is unreachable
            alert('Unreachable!');
            this._finishCallback();
        } else if (nextGrid.i == this._dstChessPos.i && nextGrid.j == this._dstChessPos.j) {
            // The shortest path is found
            this._piece.setChessPos(this._dstChessPos.i, this._dstChessPos.j);
            this._finishCallback();
        } else {
            // Move to it and mark it as closed
            this._piece.setChessPos(nextGrid.i, nextGrid.j);
            nextGrid.state = 'close';

            // Expand
            this._expandAtChessPos(nextGrid.i, nextGrid.j);

            let trace = this._rebuildTrace(nextGrid);
            let nextNextGrid = this._findNextGrid();
            this._updateCallback(this._chessboardArray, nextNextGrid, trace);
        }
    }

    _findNextGrid() {
        // The proper way is to use a priority queue
        let nextGrid = null;
        for (let i = 0; i < this._mgr.getChessboardSize(); i++) {
            for (let j = 0; j < this._mgr.getChessboardSize(); j++) {
                let grid = this._chessboardArray[i][j];
                if (grid != null && grid.state == 'open') {
                    if (nextGrid == null || grid.f() < nextGrid.f()) {
                        nextGrid = grid;
                    }
                }
            }
        }

        if (nextGrid == null) {
            return null;
        }

        return nextGrid;
    }

    _expandAtChessPos(i, j) {
        let neighbors = [];
        if (i > 0) neighbors.push(this._chessboardArray[i - 1][j]);
        if (j > 0) neighbors.push(this._chessboardArray[i][j - 1]);
        if (i < this._mgr.getChessboardSize() - 1) neighbors.push(this._chessboardArray[i + 1][j]);
        if (j < this._mgr.getChessboardSize() - 1) neighbors.push(this._chessboardArray[i][j + 1]);

        for (let grid of neighbors) {
            if (grid != null) {
                if (grid.state == 'unknown') {
                    grid.h = this._calcH(grid.i, grid.j);
                    grid.state = 'open';
                }

                if (grid.state == 'open') {
                    let newG = this._chessboardArray[i][j].g + 1;
                    if (grid.g == null || newG < grid.g) {
                        grid.g = newG;
                        grid.prev = this._chessboardArray[i][j];
                    }
                }
            }
        }
    }

    _rebuildTrace(grid) {
        let trace = [];
        while (grid) {
            trace.push(grid);
            grid = grid.prev;
        }
        trace.reverse();
        return trace;
    }
}