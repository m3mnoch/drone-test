import { Vector3Component } from "metaverse-api";
import { log } from "src/common/GameLogger";
import { distance, vectorSum } from "src/common/HelperFunctions";
import IGameState from "src/common/IGameState";
import Signal from "src/common/Signal";
import Drone, { signals, states } from "src/gobs/Drone";

const playerOffset: Vector3Component = { x: 2, y: 0, z: 1 };

export default class ReturnDroneState implements IGameState {
    private parentDrone: Drone;
    private lastMasterPosition: Vector3Component = { x: 0, y: 0, z: 0 };
    private nextDecisionTime: number = 0;
    private decisionDelay: number = 1000;

    constructor(drone: Drone) {
        this.parentDrone = drone;
    }

    onUpdate(frameTime: number): void {
        if (frameTime > this.nextDecisionTime) {
            // basically, if the current master is further
            // than, say, 5 meters away, we go chase them.
            const dist: number = distance(this.parentDrone.master.translation, this.lastMasterPosition);
            log("dronestate", "distance: " + dist);
            log("dronestate", "master position: ", this.parentDrone.master.translation);
            log("dronestate", "last master position: ", this.lastMasterPosition);

            if (dist > 3) {
                this.chaseMaster();
            }

            // we don't want to constantly check on every frame.
            this.nextDecisionTime = frameTime + this.decisionDelay;
        }
    }

    onEnter(): void {
        log("dronestate", "drone is heading to its master!");
        this.chaseMaster();
    }

    chaseMaster(): void {
        this.lastMasterPosition = vectorSum(this.parentDrone.master.translation, playerOffset);
        this.parentDrone.anim.transitionToClip("running", 300);
        this.parentDrone.anim.moveTo(
            this.lastMasterPosition,
            this.parentDrone.droneSpeed,
            new Signal(states.IDLE, signals.MASTER_SUCCESS)
        );
    }

    onExit(): void {}
}
