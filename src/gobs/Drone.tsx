import { createElement, ISimplifiedNode } from "metaverse-api";
import AnimationHelper from "src/common/AnimationHelper";
import { log } from "src/common/GameLogger";
import GameStateMachine from "src/common/GameStateMachine";
import Gob from "src/common/Gob";
import { randomInclusiveInteger } from "src/common/HelperFunctions";
import Player from "src/common/Player";
import Signal from "src/common/Signal";
import { SignalManager } from "src/common/SignalManager";
import { GameConfig } from "src/GameConfig";
import IdleDroneState from "src/states/IdleDroneState";
import ReturnDroneState from "src/states/ReturnDroneState";
import SeekDroneState from "src/states/SeekDroneState";

export enum states {
    IDLE = "drone-idle",
    SEEK = "drone-seek",
    RETURN = "drone-return"
}

export enum signals {
    DISCOVERED_RESOURCE = "discovered-resource",
    DISCOVERED_MASTER = "discovered-master",
    TARGET_SUCCESS = "found-target",
    MASTER_SUCCESS = "found-master"
}

export default class Drone extends Gob {
    public master: Player;
    private gsm: GameStateMachine;
    public anim: AnimationHelper;

    private isLoaded: boolean;

    public droneSpeed: number; // meters per second.

    public resourceList: Gob[];
    public inventory: { [id: string]: number }[];

    constructor(name: string, master: Player) {
        const tX = randomInclusiveInteger(20, 40);
        const tZ = randomInclusiveInteger(20, 40);
        super(name, "drone-one", tX, 0, tZ);

        // ------------------------------------
        // we don't really have a callback
        // so we're faking this.
        this.isLoaded = false;
        const self = this;
        setTimeout(function() {
            self.isLoaded = true;
        }, 5000);
        // ------------------------------------

        this.droneSpeed = 5;
        this.master = master;

        this.anim = new AnimationHelper(this);
        this.anim.setupClip("idle", true);
        this.anim.setupClip("running", true);
        this.anim.setupClip("threaten", true);
        this.anim.setupClip("back", true);

        // listening for my triggers
        SignalManager.subscribe(signals.DISCOVERED_RESOURCE, this);
        SignalManager.subscribe(signals.DISCOVERED_MASTER, this);
        SignalManager.subscribe(signals.MASTER_SUCCESS, this);
        SignalManager.subscribe(signals.TARGET_SUCCESS, this);

        log("anim", "setting up states");
        this.gsm = new GameStateMachine();

        this.gsm.add(states.IDLE, new IdleDroneState(this));
        this.gsm.add(states.SEEK, new SeekDroneState(this));
        this.gsm.add(states.RETURN, new ReturnDroneState(this));

        this.inventory = [];
        this.resourceList = [];

        this.gsm.change(states.IDLE);
    }

    public updateMaster(master: Player) {
        this.master = master;
    }

    public resourceAvailable(): Gob | null {
        // TODO:  real resource priority system
        if (this.resourceList.length == 0) {
            return null;
        } else {
            return this.resourceList[0];
        }
    }

    public removeResource(resource: Gob): any {
        const index = this.resourceList.indexOf(resource);
        if (index !== -1) {
            this.resourceList.splice(index, 1);
        }
    }

    public hasPayloadSpace(): boolean {
        // TODO:  real resource payload system
        if (this.inventory.length == 0) {
            return true;
        } else {
            return false;
        }
    }

    public onSignal(signal: Signal) {
        if (signal.channel == signals.DISCOVERED_RESOURCE) {
            this.resourceList.push(signal.payload);
            if (this.hasPayloadSpace()) {
                this.gsm.change(states.SEEK, signal.payload);
            }
        } else if (signal.channel == signals.DISCOVERED_MASTER) {
            this.gsm.change(states.RETURN);
        } else if (signal.channel == signals.MASTER_SUCCESS) {
            this.gsm.change(states.IDLE);
        } else if (signal.channel == signals.TARGET_SUCCESS) {
            this.gsm.change(states.RETURN);
        }
    }

    public onGobUpdate(frameTime: number) {
        if (!this.isLoaded) return;

        // code is abstracted to the gamestate level
        this.gsm.update(frameTime);

        this.anim.onAnimationUpdate(frameTime);
    }

    // TODO:  pull the animation blending piece out into a behavior thing.
    onRender(): ISimplifiedNode {
        return (
            <entity
                scale={{ x: 0.01, y: 0.01, z: 0.01 }}
                position={this.getTranslation()}
                rotation={this.getRotation()}
                transition={{
                    position: { duration: GameConfig.drawFrameMs },
                    rotation: { duration: GameConfig.drawFrameMs }
                }}
            >
                <gltf-model
                    id={this.getGobId()}
                    src="models/raptor/raptor.gltf"
                    skeletalAnimation={this.anim.getAnimationClips()}
                />
                <plane
                    position={{ x: 0, y: 1, z: 0 }}
                    rotation={{ x: 90, y: 0, z: 0 }}
                    scale={{ x: 100, y: 100, z: 100 }}
                    material="#shadow"
                    ignoreCollisions={true}
                />
            </entity>
        );
    }
}
