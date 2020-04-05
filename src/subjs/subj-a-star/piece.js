import { ChessboardManager, CHESSBOARD_STATE_WAITING } from "./chessboard_manager";

/**
 * 
 * @param {PIXI.Graphics} piece 
 * @param {number} i 
 * @param {number} j 
 * @param {ChessboardManager} mgr 
 */
export function enhancePiece(piece, i, j, mgr) {
    piece.i = i;
    piece.j = j;
    piece.mgr = mgr;

    piece.interactive = true;
    piece.buttonMode = true;

    piece
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragCancel)
        .on('pointermove', onDragMove);

    piece.resetGeoPos = function () {
        let pos = this.mgr.getGridCenter(this.i, this.j);
        this.position.set(pos.x, pos.y);
    }

    piece.setChessPos = function (i, j) {
        this.i = i;
        this.j = j;
        this.resetGeoPos();
    }
}

function onDragStart(event) {
    if (this.mgr.getState() != CHESSBOARD_STATE_WAITING) {
        return;
    }

    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd() {
    if (this.dragging) {
        this.mgr.dropPiece(this);
        this.resetGeoPos();
        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
    }
}

function onDragMove() {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}

function onDragCancel() {
    this.resetGeoPos();
    this.dragging = false;
    this.alpha = 1;
}