// for simplicity's sake, we're only
// doing one signal type per channel.
export default class Signal {
    frameTime: number = 0;
    senderId: string;
    channel: string;
    payload: any;

    constructor(s: string, c: string, p?: any) {
        this.senderId = s;
        this.channel = c;

        if (!p) p = {};
        this.payload = p;
    }
}
