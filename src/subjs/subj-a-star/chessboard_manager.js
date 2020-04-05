import * as PIXI from 'pixi.js';
import { createLine, createPiece, createSrcCircle, createDstCircle, createNextCircle, createOpenMark, createCloseMark, createGridInfo, createArrow, createTrace } from './sprite_factory';
import { enhancePiece } from './piece.js';
import { AStarSolver } from './a_star_solver';

export const CHESSBOARD_STATE_WAITING = 0;
export const CHESSBOARD_STATE_MOVING = 1;

export class ChessboardManager {
    /**
     * 
     * @param {number} dim 
     * @param {PIXI.Container} stage 
     */
    constructor(dim, stage) {
        this._dim = dim;
        this._stage = stage;

        this._state = CHESSBOARD_STATE_WAITING;

        this._pieces = [];

        // Mesh
        for (let i = 0; i <= this.getChessboardSize(); i++) {
            let v = i * this.getGridDim();
            let vline = createLine(v, 0, v, dim);
            let hline = createLine(0, v, dim, v);
            stage.addChild(vline);
            stage.addChild(hline);
        }

        // Left pieces
        for (let i = 0; i <= this.getChessboardSize(); i++) {
            let center = this.getGridCenter(0, i);
            let piece = createPiece(center.x, center.y, this.getGridDim() / 2.5, true);
            enhancePiece(piece, 0, i, this);
            this._pieces.push(piece);
            stage.addChild(piece);
        }

        // Right pieces
        for (let i = 0; i < this.getChessboardSize(); i++) {
            let center = this.getGridCenter(this.getChessboardSize() - 1, i);
            let piece = createPiece(center.x, center.y, this._getPieceRadius(), false);
            enhancePiece(piece, this.getChessboardSize() - 1, i, this);
            this._pieces.push(piece);
            stage.addChild(piece);
        }
    }

    getState() { return this._state; }

    getGridDim() { return this._dim / this.getChessboardSize(); }

    getChessboardSize() { return 10; }

    getGridCenter(i, j) {
        return {
            x: this.getGridDim() / 2 + i * this.getGridDim(),
            y: this.getGridDim() / 2 + j * this.getGridDim(),
        };
    }

    getAllPieces() {
        return this._pieces;
    }

    /**
     * 
     * @param {PIXI.Graphics} piece 
     */
    dropPiece(piece) {
        if (this._state != CHESSBOARD_STATE_WAITING) {
            console.error('This should not happen!');
            return;
        }

        let chessPos = this._getChessPosOfPiece(piece);
        if (chessPos == null) {
            // Outside
            return;
        }

        if (this.testChessPos(chessPos)) {
            // There's already a piece (including itself)
            return;
        }

        this._gotoMoving(piece, chessPos.i, chessPos.j);
    }

    testChessPos(chessPos) {
        for (let piece of this._pieces) {
            if (piece.i == chessPos.i && piece.j == chessPos.j) {
                return piece;
            }
        }
        return null;
    }

    _getPieceRadius() {
        return this.getGridDim() / 2.5;
    }

    _getChessPosOfPiece(piece) {
        let x = piece.position.x;
        let y = piece.position.y;
        let i = Math.floor(x / this.getGridDim());
        let j = Math.floor(y / this.getGridDim());
        if (i < 0 || i >= this.getChessboardSize()) {
            return null;
        }
        if (j < 0 || j >= this.getChessboardSize()) {
            return null;
        }
        return { i: i, j: j };
    }

    _gotoMoving(piece, iDst, jDst) {
        this._state = CHESSBOARD_STATE_MOVING;

        let movingScene = new PIXI.Container();
        this._stage.addChild(movingScene);
        this._movingScene = movingScene;

        let srcPos = this.getGridCenter(piece.i, piece.j);
        let srcCircle = createSrcCircle(srcPos.x, srcPos.y, this._getPieceRadius());
        movingScene.addChild(srcCircle);

        let dstPos = this.getGridCenter(iDst, jDst);
        let dstCircle = createDstCircle(dstPos.x, dstPos.y, this._getPieceRadius());
        movingScene.addChild(dstCircle);

        let statusScene = new PIXI.Container();
        movingScene.addChild(statusScene);
        this._statusScene = statusScene;

        this._solver = new AStarSolver(this, piece, { i: iDst, j: jDst }, this._onUpdate.bind(this), this._onFinished.bind(this));
    }

    _onUpdate(chessboardArray, nextGrid, trace) {
        this._statusScene.removeChildren();

        // Draw f, g, h, dir...
        for (let col of chessboardArray) {
            for (let grid of col) {
                if (grid) {
                    if (grid.state == 'open' || grid.state == 'close') {
                        console.log(grid.state);
                        let { x, y } = this.getGridCenter(grid.i, grid.j);
                        if (grid.state == 'open') {
                            this._statusScene.addChild(createOpenMark(x, y, this.getGridDim() / 2));
                        } else {
                            this._statusScene.addChild(createCloseMark(x, y, this.getGridDim() / 2));
                        }
                        this._statusScene.addChild(createGridInfo(x, y, this.getGridDim() / 2.3, Math.ceil(grid.f()), grid.g, Math.ceil(grid.h)));
                        if (grid.prev) {
                            this._statusScene.addChild(createArrow(grid, x, y, this.getGridDim() / 5));
                        }
                    }
                }
            }
        }

        // Draw next position
        if (nextGrid) {
            let screenPos = this.getGridCenter(nextGrid.i, nextGrid.j);
            let nextCircle = createNextCircle(screenPos.x, screenPos.y, this._getPieceRadius());
            this._statusScene.addChild(nextCircle)
        }

        // Draw trace
        let tracePos = [];
        for (let grid of trace) {
            tracePos.push(this.getGridCenter(grid.i, grid.j));
        }
        this._statusScene.addChild(createTrace(tracePos));
    }

    _onFinished() {
        this._stage.removeChild(this._movingScene);
        document.getElementById("btn-next").disabled = true;
        this._state = CHESSBOARD_STATE_WAITING;
    }

}