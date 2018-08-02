import Gob from "src/common/Gob";
import { log } from "./GameLogger";
import Signal from "./Signal";

export namespace SignalManager {
    const channels: { [id: string]: Gob[] } = {};
    const allChannels: Gob[] = [];

    export const publish = (frameTime: number, signal: Signal) => {
        // new channel if it didn't exist.
        prepareChannel(signal.channel);

        signal.frameTime = frameTime;

        // send the signal to all my subscribers, yo.
        log("GameKit", signal.senderId + " publish signal: " + signal.channel);
        channels[signal.channel].forEach(function(entity: Gob) {
            log("GameKit", signal.senderId + " publish signal, found subscriber: " + signal.channel);
            entity.onSignal(signal);
        });

        // send the signal to the "all" subscribers.
        for (let i = 0; i < allChannels.length; i++) {
            allChannels[i].onSignal(signal);
        }
    };

    export const subscribe = (channel: string, subscriber: Gob) => {
        if (channel != "*") {
            // TODO:  don't add them if they already subscribe to all.
            // new channel if it didn't exist.
            prepareChannel(channel);
            log("GameKit", subscriber.getGobId() + " sub signal: " + channel);
            channels[channel].push(subscriber);
        } else {
            allChannels.push(subscriber);
        }
    };

    export const unsubscribe = (channel: string, subscriber: Gob) => {
        if (channel != "*") {
            log("GameKit", subscriber.getGobId() + " unsub signal: " + channel);
            if (channels[channel]) removeSubscriber(channels[channel], subscriber);
        } else {
            removeSubscriber(allChannels, subscriber);
        }
    };

    const prepareChannel = (channel: string) => {
        if (!(channel in channels)) {
            const channelSubscribers: Gob[] = [];

            channels[channel] = channelSubscribers;
        }
    };

    const removeSubscriber = (subscribers: Gob[], subscriber: Gob) => {
        const index = subscribers.indexOf(subscriber);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    };
}
