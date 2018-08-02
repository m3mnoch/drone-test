import { randomInclusiveInteger } from "src/common/HelperFunctions";
import Player from "src/common/Player";
import { GameConfig } from "src/GameConfig";
import Drone from "src/gobs/Drone";
import ResourceSpawn from "src/gobs/ResourceSpawn";

export const gameMount = () => {
    // start up the player tracking so we can synchronously get the player position.
    // i really, really dislike this.  multiplayer, man.  multiplayer.
    const player: Player = new Player("m3mnoch");
    GameConfig.theGame.addPlayerToScene(player);

    // adding our drone to the scene.
    const drone = new Drone("foundry-001", player);
    GameConfig.theGame.addGobToScene(drone);

    // example spawner pattern
    let spawnpoint: ResourceSpawn;
    for (let i = 0; i < 10; i++) {
        spawnpoint = new ResourceSpawn("resource-spawner-" + i, "#A0522D");

        const tX: number = randomInclusiveInteger(1, 49);
        const tZ: number = randomInclusiveInteger(1, 49);
        spawnpoint.updateTranslation({ x: tX, y: 0, z: tZ });

        GameConfig.theGame.addGobToScene(spawnpoint);
    }

    // NOTE:  if lots of the objects we've got in the scene are
    // dynamic npc/ai/gob things rather than just scenery and a
    // dynamic thing or two, it'll be more beneficial to drop in
    // a main loop than have a bajillion little loop callbacks.
    //
    const aiLoop = setInterval(() => {
        // ideally, we'd do this according to the
        // game state in the state machine.
        GameConfig.theGame.updateGobs();

        // we can update all the players too.
        // if we need it, that is.

        // push the state changes
        GameConfig.theGame.setState({
            drawFrame: performance.now()
        });
    }, GameConfig.drawFrameMs);
};
