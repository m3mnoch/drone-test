import { createElement, ISimplifiedNode } from "metaverse-api";
import { log } from "src/common/GameLogger";
import Gob from "src/common/Gob";

export default class Resource extends Gob {
    private heightScale: number = 1;

    constructor(name: string) {
        super(name, "Resource");

        log("spawner", name + " created", this.getGobId(), this.getTemplate());

        // random height scale.
        this.heightScale = Math.random() * 0.8 + 0.2;
    }

    public onGobUpdate(frameTime: number) {
        // just in case there's anything we need to
        // handle if we turn on the global update loop.
    }

    onRender(): ISimplifiedNode {
        return (
            <entity>
                <gltf-model
                    id={this.getGobId()}
                    position={this.getTranslation()}
                    scale={{ x: 1, y: this.heightScale, z: 1 }}
                    src="models/medieval_asset_03tree/scene.gltf"
                />
            </entity>
        );
    }
}
