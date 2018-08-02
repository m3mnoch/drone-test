import { log } from "src/common/GameLogger";
import IGameState from "src/common/IGameState";

export default class GameStateMachine {
    private sceneStates: { [id: string]: IGameState } = {};
    private myCurrentState: IGameState | null = null;

    public change(stateName: string, param?: any): void {
        if (stateName in this.sceneStates) {
            log("anim", "switching to state: " + stateName);
            if (this.myCurrentState) this.myCurrentState.onExit();
            this.myCurrentState = this.sceneStates[stateName];
            this.myCurrentState.onEnter(param);
        } else {
            console.log("state does not exist.  one of these days, handle it here.");
        }
    }

    public add(name: string, state: IGameState): void {
        log("anim", "added state: " + name);
        this.sceneStates[name] = state;
    }

    public update(frameTime: number): void {
        if (this.myCurrentState) this.myCurrentState.onUpdate(frameTime);
    }
}
