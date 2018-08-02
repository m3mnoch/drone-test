/*

how to use:

// instance the helper
this.anim = new AnimationHelper(this);

// let it know about the animation clips for the model
this.anim.setupClip("idle", true);
this.anim.setupClip("running", true);

// blending the animation
this.anim.transitionToClip("running");

// moving where at speed (in meters per second)
this.anim.moveTo({ x: 10, y: 0, z: 10 }, 5);

*/

import { SkeletalAnimationValue, Vector3Component } from "metaverse-api";
import { log } from "src/common/GameLogger";
import Gob from "src/common/Gob";
import { distance, getLookAtRotation } from "src/common/HelperFunctions";
import Signal from "src/common/Signal";
import { SignalManager } from "src/common/SignalManager";
import { GameConfig } from "src/GameConfig";

// duration is in milliseconds
const defaultDuration: number = 1000;

export default class AnimationHelper {
    private myGob: Gob;
    private animations: SkeletalAnimationValue[] = [];
    private currentClip: string = "";
    private nextClip: string = "";
    private transitionStartTime: number = 0;
    private transitionDuration: number = 0;

    private isMoving: boolean = false;
    private translationStartTime: number = 0;
    private translationDuration: number = 0;
    private translationStartLoc: Vector3Component = { x: 0, y: 0, z: 0 };
    private translationTargetLoc: Vector3Component = { x: 0, y: 0, z: 0 };
    private translationDoneSignal: any;

    constructor(gob: Gob) {
        this.myGob = gob;
    }

    public getAnimationClips(): SkeletalAnimationValue[] {
        return this.animations;
    }

    public setupClip(clipName: string, isLooping: boolean) {
        const newAnim: any = { clip: clipName, loop: isLooping, weight: 1.0, playing: false };
        this.animations.push(newAnim);
    }

    public playClip(clipName: string, weight?: number) {
        for (let i = 0; i < this.animations.length; ++i) {
            if (this.animations[i].clip == clipName) {
                this.animations[i].playing = true;

                if (weight) {
                    this.animations[i].weight = weight;
                }

                this.currentClip = clipName;
            } else {
                this.animations[i].playing = false;
            }
        }
    }

    public transitionToClip(clipName: string, durationMs?: number) {
        // we're just doing full, 1.0 weight transitions right now.  i'm lazy.
        this.nextClip = clipName;
        this.transitionStartTime = performance.now();

        log("anim", "transitionStartTime: " + this.transitionStartTime);

        if (durationMs) {
            this.transitionDuration = durationMs;
        } else {
            this.transitionDuration = defaultDuration;
        }

        this.updateClip();
    }

    private updateClip(): void {
        const currentFrameTime: number = performance.now();
        if (currentFrameTime > this.transitionStartTime + this.transitionDuration) {
            this.playClip(this.nextClip, 1.0);
            return;
        }

        const timeDiff: number = currentFrameTime - this.transitionStartTime;
        const currentClipWeight = this.linearAnim(0.0, 1.0, timeDiff, this.transitionDuration);
        const nextClipWeight = this.linearAnim(1.0, 0.0, timeDiff, this.transitionDuration);

        for (let i = 0; i < this.animations.length; ++i) {
            if (this.animations[i].clip == this.currentClip) {
                this.animations[i].weight = currentClipWeight;
                this.animations[i].playing = true;
            } else if (this.animations[i].clip == this.nextClip) {
                this.animations[i].weight = nextClipWeight;
                this.animations[i].playing = true;
            }
        }

        const self = this;
        setTimeout(function() {
            self.updateClip();
        }, GameConfig.drawFrameMs);
    }

    public moveTo(location: Vector3Component, metersPerSecond: number, signal?: Signal) {
        this.lookAtTarget();
        this.translationStartTime = performance.now();

        this.translationStartLoc = this.myGob.getTranslation();
        this.translationTargetLoc = location;

        const dist: number = distance(this.translationStartLoc, this.translationTargetLoc);
        log("anim", "distance: " + dist);
        this.translationDuration = (dist / metersPerSecond) * 1000;
        log("anim", "duration: " + this.translationDuration);

        this.translationDoneSignal = signal;
        this.isMoving = true;
    }

    public onAnimationUpdate(frameTime: number): void {
        if (!this.isMoving) return;

        const timeDiff: number = frameTime - this.translationStartTime;
        let translation: Vector3Component = { x: 0, y: 0, z: 0 };

        translation.x = this.linearAnim(
            this.translationTargetLoc.x,
            this.translationStartLoc.x,
            timeDiff,
            this.translationDuration
        );
        translation.y = this.linearAnim(
            this.translationTargetLoc.y,
            this.translationStartLoc.y,
            timeDiff,
            this.translationDuration
        );
        translation.z = this.linearAnim(
            this.translationTargetLoc.z,
            this.translationStartLoc.z,
            timeDiff,
            this.translationDuration
        );

        this.myGob.updateTranslation(translation);

        if (this.translationDuration <= timeDiff) {
            this.isMoving = false;

            // calling it quits.
            log("animation", "animation finished.");
            if (this.translationDoneSignal) SignalManager.publish(frameTime, this.translationDoneSignal);
        }
    }

    private lookAtTarget(): void {
        const myTranslation: Vector3Component = this.myGob.getTranslation();
        const mySpin: Vector3Component = getLookAtRotation(myTranslation, this.translationTargetLoc);
        this.myGob.updateRotation(mySpin);
    }

    private linearAnim(endValue: number, startValue: number, timeDiff: number, duration: number): number {
        if (duration == 0) return 0;
        return ((endValue - startValue) * timeDiff) / duration + startValue;
    }
}
