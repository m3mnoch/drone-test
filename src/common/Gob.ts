import { Vector3Component } from "metaverse-api";
import Player from "src/common/Player";
import Signal from "src/common/Signal";
import { GameConfig } from "src/GameConfig";

export interface GobPosition {
    translation: Vector3Component;
    rotation: Vector3Component;
}

export default abstract class Gob {
    private isChanged: boolean = true;
    private expireTime: number = -1;
    private lastFrameTime: number = 0;
    private gobId: string = "gob-instance";
    private templateName: string = "game-object";
    private position: GobPosition;

    constructor(n: string, t?: string, tX?: number, tY?: number, tZ?: number, rX?: number, rY?: number, rZ?: number) {
        this.gobId = n; //.toLowerCase();
        if (t) this.templateName = t.toLowerCase();

        if (!tX) tX = 0;
        if (!tY) tY = 0;
        if (!tZ) tZ = 0;
        if (!rX) rX = 0;
        if (!rY) rY = 0;
        if (!rZ) rZ = 0;

        this.position = { translation: { x: tX, y: tY, z: tZ }, rotation: { x: rX, y: rY, z: rZ } };
    }

    public getGobId() {
        return this.gobId;
    }

    public getTemplate() {
        return this.templateName;
    }

    // ------------------------------------------------------------------------------------------
    // translation and rotation
    public updatePosition(p: GobPosition) {
        this.position = p;
        this.isChanged = true;
    }

    public updateTranslation(t: Vector3Component) {
        if (!t.x) t.x = 0;
        if (!t.y) t.y = 0;
        if (!t.z) t.z = 0;
        this.position.translation = t;
        this.isChanged = true;
    }

    public updateRotation(r: Vector3Component) {
        if (!r.x) r.x = 0;
        if (!r.y) r.y = 0;
        if (!r.z) r.z = 0;
        this.position.rotation = r;
        this.isChanged = true;
    }

    public getTranslation(): Vector3Component {
        return this.position.translation;
    }

    public getRotation(): Vector3Component {
        return this.position.rotation;
    }

    // ------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------
    // overloadable, but not required to implement, interaction handlers
    public onClickedBy(player: Player) {}
    public onGotHitBy(gob: Gob) {}
    public onHitOtherGob(gob: Gob) {}
    public onSignal(signal: Signal) {}

    // ------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------
    // lifecycle
    public setExpiretime(t: number) {
        this.expireTime = t;
        this.isChanged = true;
    }

    public expire() {
        // NOTE:  wiring this into the scene for right now.
        // we need a better delete object mechanism.
        this.expireTime = 0;
        GameConfig.theGame.deleteGobFromScene(this);
    }

    public getIsChanged() {
        return this.isChanged;
    }

    public markChanged() {
        this.isChanged = true;
    }

    public clearChanges() {
        this.isChanged = false;
    }
    // ------------------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------------------
    // hooks
    abstract onGobUpdate(frameTime: number): void;
    public onFrameUpdate(frameTime: number) {
        if (this.expireTime >= 0 && this.expireTime <= frameTime) {
            this.expire();
        }

        // update the gob itself
        this.onGobUpdate(frameTime);
        this.lastFrameTime = frameTime;
    }
    public onRender() {}

    // ------------------------------------------------------------------------------------------
}
