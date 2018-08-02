import { createElement, ISimplifiedNode } from "metaverse-api";
import { log } from "src/common/GameLogger";
import Gob from "src/common/Gob";
import Signal from "src/common/Signal";
import { SignalManager } from "src/common/SignalManager";
import { GameConfig } from "src/GameConfig";
import { signals } from "src/gobs/Drone";
import Resource from "src/gobs/Resource";

export default class ResourceSpawn extends Gob {
    private color: string = "#228B22";
    private canSpawn: boolean = true;

    constructor(name: string, color: string) {
        super(name, "ResourceSpawn");
        this.color = color;

        log("spawner", name + " created", this.getGobId(), this.getTemplate());

        GameConfig.theGame.eventSubscriber.on(this.getGobId() + "_click", () => {
            this.spawnResource();
        });
    }

    private spawnResource() {
        if (this.canSpawn) {
            console.log("spawning tree!!");

            const myTree: Resource = new Resource(this.getGobId() + "-tree");
            myTree.updateTranslation(this.getTranslation());
            GameConfig.theGame.addGobToScene(myTree);

            this.canSpawn = false;

            // i _hate_ this.  i want to put a simple state into the main scene
            // state.  i feel like it should be some part of the gob object.  like,
            // a `gobState` or something.  then, we can drop that into an array and
            // rebuild dynamic gobs from it client-side when another user logs in.
            GameConfig.theGame.setState({
                drawFrame: performance.now()
            });

            // tell everyone we spawned a thing.
            SignalManager.publish(performance.now(), new Signal("SPAWNER", signals.DISCOVERED_RESOURCE, myTree));
        }
    }

    public onGobUpdate(frameTime: number) {
        // just in case there's anything we need to handle
        // when/if we turn on the global update loop.
    }

    onRender(): ISimplifiedNode {
        return (
            <entity>
                <box
                    id={this.getGobId()}
                    position={this.getTranslation()}
                    scale={{ x: 1, y: 0.01, z: 1 }}
                    color={this.color}
                />
            </entity>
        );
    }
}
