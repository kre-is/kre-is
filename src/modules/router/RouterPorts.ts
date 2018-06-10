import {RouterInternal} from "./RouterInternal";
import {Cable} from "./Cable";

export abstract class RouterPorts extends RouterInternal{
    private channels : OnMessage[] = [];



    private async sorter(msg : string): Promise<string>{
         return this.channels[msg.codePointAt(0)](msg.slice(1));
    }

    attach(cable : Cable){
        let self = this;
        cable.onmessage = (msg)=>{return self.sorter(msg)};
        super.attach(cable);
    }

    createPort(onmessage : OnMessage) : (msg : string, target : number, tolerance : number) => Promise<String>{
        let portID = this.channels.length;
        this.channels.push(onmessage);

        let self = this;

        return (msg : string, target : number, tolerance : number) => {
            return self.dispatch(String.fromCodePoint(portID) + msg, target, tolerance);
        }
    }

    /**
     * communicates with all adjacent nodes.
     * @param {OnMessage} onmessage
     * @returns {OnMessage}
     */
    createFrequency(onmessage : OnMessage) : (msg : string) => Promise<String>[]{
        let portID = this.channels.length;
        this.channels.push(onmessage);

        let self = this;

        return (msg : string) => {
            return self.broadcast(String.fromCodePoint(portID) + msg);
        }
    }

}

interface OnMessage {
    (msg : string) : Promise<string>
}


