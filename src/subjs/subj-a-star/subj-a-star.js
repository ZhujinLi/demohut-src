import * as PIXI from 'pixi.js';
import { ChessboardManager } from './chessboard_manager';
import { createLegend } from "./sprite_factory";

const CHESSBOARD_DIM = 550;
const LEGEND_WIDTH = 200;
const app = new PIXI.Application({ backgroundColor: 0xdae0e0, antialias: true, width: CHESSBOARD_DIM + LEGEND_WIDTH, height: CHESSBOARD_DIM });
document.getElementById('view-chessboard').appendChild(app.view);

let mgr = new ChessboardManager(CHESSBOARD_DIM, app.stage);

app.stage.addChild(createLegend(CHESSBOARD_DIM, mgr.getGridDim()));

