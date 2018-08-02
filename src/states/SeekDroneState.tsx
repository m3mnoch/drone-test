import { Vector3Component } from "metaverse-api";
import { log } from "src/common/GameLogger";
import { distance } from "src/common/HelperFunctions";
import IGameState from "src/common/IGameState";
import Signal from "src/common/Signal";
import { SignalManager } from "src/common/SignalManager";
import Drone, { signals, states } from "src/gobs/Drone";
import Resource from "src/gobs/Resource";

export default class SeekDroneState implements IGameState {
    private parentDrone: Drone;
    private lastResourceTranslation: Vector3Component = { x: 0, y: 0, z: 0 };
    private nextDecisionTime: number = 0;
    private decisionDelay: number = 1000;

    constructor(drone: Drone) {
        this.parentDrone = drone;
    }

    onUpdate(frameTime: number): void {
        if (frameTime > this.nextDecisionTime) {
            // basically, if the current master is further
            // than, say, 5 meters away, we go chase them.
            const dist: number = distance(this.parentDrone.getTranslation(), this.lastResourceTranslation);
            // log("dronestate", "distance: " + dist);
            // log("dronestate", "this position: ", this.parentDrone.getTranslation());
            // log("dronestate", "last resource position: ", this.lastResourceTranslation);

            if (dist > 3 && this.parentDrone.resourceAvailable()) {
                log("dronestate", "distance: " + dist);
                this.chaseResource();
            } else {
                // harvest it.
                // head back to master.
                if (this.parentDrone.resourceAvailable()) {
                    log("dronestate", "harvesting");
                    const targetResource: any = this.parentDrone.resourceAvailable();

                    // turning it into woodstuff.
                    this.parentDrone.inventory.push({ woodstuff: 5 });

                    // TODO: make this a signal so all drones remove it from their memory.
                    this.parentDrone.removeResource(targetResource);
                    targetResource.expire();

                    SignalManager.publish(frameTime, new Signal(states.SEEK, signals.TARGET_SUCCESS));
                } else {
                    log("dronestate", "resource missing");
                    SignalManager.publish(frameTime, new Signal(states.SEEK, signals.DISCOVERED_MASTER));
                }
            }

            // we don't want to constantly check on every frame.
            this.nextDecisionTime = frameTime + this.decisionDelay;
        }
    }

    onEnter(resource: Resource): void {
        log("dronestate", "drone is fetcthing.");
        this.chaseResource();
    }

    chaseResource(): void {
        if (this.parentDrone.resourceAvailable()) {
            const targetResource: any = this.parentDrone.resourceAvailable();

            this.lastResourceTranslation = targetResource.getTranslation();
            this.parentDrone.anim.transitionToClip("running", 300);
            this.parentDrone.anim.moveTo(this.lastResourceTranslation, this.parentDrone.droneSpeed);
        } else {
            // we should handle the case for if someone else grabbed it first.
            // that way, this poor bastard doesn't have to run all the way to the now-empty spot.
        }
    }
    onExit(): void {}
}
