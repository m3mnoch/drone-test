import { WebWorkerTransport } from "metaverse-api";
import Game from "src/common/Game";
import { GameConfig } from "src/GameConfig";

GameConfig.theGame = new Game(WebWorkerTransport(self as any));
