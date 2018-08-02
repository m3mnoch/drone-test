/*

    TODO:  make me WAAAAY cooler.
    https://developers.google.com/web/tools/chrome-devtools/console/console-reference

*/

// a list of channels to pay attention to.
// for example, "any" could log anything while "animation" would only do that channel.
const logChannels: string[] = ["dronestate"];
//const logChannels:string[] = ["debug"];

export const log = (channel: string, logline: string, ...args: any[]) => {
    if (logChannels.indexOf(channel) > -1 || channel == "any") {
        // to the console, to a file, whatever!  all the choices!
        if (args.length > 0) {
            console.log("|" + Date.now() + "|" + channel + "|" + logline, args);
        } else {
            console.log("|" + Date.now() + "|" + channel + "|" + logline);
        }
    }
};
