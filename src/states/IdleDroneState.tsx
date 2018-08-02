import { log } from "src/common/GameLogger";
import { distance } from "src/common/HelperFunctions";
import IGameState from "src/common/IGameState";
import Signal from "src/common/Signal";
import { SignalManager } from "src/common/SignalManager";
import Drone, { signals, states } from "src/gobs/Drone";

export default class IdleDroneState implements IGameState {
    private parentDrone: Drone;
    private nextDecisionTime: number = 0;
    private decisionDelay: number = 1000;

    constructor(drone: Drone) {
        this.parentDrone = drone;
    }

    onUpdate(frameTime: number): void {
        //log("dronestate", "drone is updating.");
        if (frameTime > this.nextDecisionTime) {
            if (this.parentDrone.hasPayloadSpace() && this.parentDrone.resourceAvailable()) {
                // first priority is to find a resource that may
                // have popped while we had a full inventory.
                SignalManager.publish(
                    frameTime,
                    new Signal(states.IDLE, signals.DISCOVERED_RESOURCE, this.parentDrone.resourceAvailable())
                );
            } else if (!this.masterIsNear()) {
                // basically, if the current master is further
                // than, say, 5 meters away, we go chase them.
                SignalManager.publish(frameTime, new Signal(states.IDLE, signals.DISCOVERED_MASTER));
            }

            // we don't want to constantly check on every frame.
            this.nextDecisionTime = frameTime + this.decisionDelay;
        }
    }

    masterIsNear(): boolean {
        const dist: number = distance(this.parentDrone.master.translation, this.parentDrone.getTranslation());
        // log("dronestate", "idle distance: " + dist);
        // log("dronestate", "idle master position: ", this.parentDrone.master.translation);
        // log("dronestate", "idle drone position: ", this.parentDrone.getTranslation());

        if (dist > 5) {
            return true;
        } else {
            return false;
        }
    }

    onEnter(): void {
        log("dronestate", "drone is idling.");
        this.parentDrone.anim.transitionToClip("idle", 300);

        if (this.masterIsNear()) {
            // unload the drone's data.
            this.parentDrone.inventory.length = 0;
        }
    }

    onExit(): void {}
}
