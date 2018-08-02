export default interface IGameState {
    onUpdate(frameTime: number): void;
    onEnter(param?: any): void;
    onExit(): void;
}
