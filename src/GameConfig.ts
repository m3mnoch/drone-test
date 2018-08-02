import Game from "src/common/Game";

export namespace GameConfig {
    // where we're holding the main game instance.
    export let theGame: Game;

    // loop timers.
    // either the brains or the draw loop fps.

    const aiHz = 2;
    const drawHz = 30;

    export const aiFrameMs: number = 1000 / aiHz;
    export const drawFrameMs: number = 1000 / drawHz;

    // environment config values can go here.
    // or other deployment-specific values.
}
