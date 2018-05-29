import {datalinkc} from "./config";

export class DataLink extends RTCPeerConnection{
    protected datachannel : RTCDataChannel;
    readonly ready : Promise<this>;
    readonly closed : Promise<this>;

    constructor(onmessage : (msg : MessageEvent)=> void ){
        super(datalinkc);
        this.datachannel = (this as any)
            .createDataChannel("data", {negotiated: true, id: 0, ordered: false});

        this.ready = new Promise<this>( resolve => this.datachannel.onopen = ()=> resolve());
        this.closed = new Promise<this>( resolve => this.datachannel.onclose = ()=> resolve());

        this.datachannel.onmessage = onmessage;
    }

    send(msg : string | Blob | ArrayBuffer | ArrayBufferView) : void {
        this.datachannel.send(msg);
    }

    async offer() : Promise<Offer>{
        this.setLocalDescription(await this.createOffer());

        // promise to wait for the sdp
        return new Promise<Offer>((accept) => {
            this.onicecandidate = event => {
                if (event.candidate) return;
                accept(this.localDescription.sdp);
            }
        });
    }
    async answer(offer : Offer) : Promise<Answer>{
        this.setRemoteDescription(new RTCSessionDescription({
            type: "offer",
            sdp: offer as string
        }));
        this.setLocalDescription(await this.createAnswer());

        // promise to wait for the sdp
        return new Promise<Answer>((accept) => {
            this.onicecandidate = event => {
                if (event.candidate) return;
                accept(this.localDescription.sdp);
            }
        });
    }
    async complete(answer : Answer) {
        return this.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer as string
        }));
    }

    close(){
        super.close();
    }
}

export class Offer extends String{}
export class Answer extends String{}

interface RTCDataChannel extends EventTarget{
    onclose: Function;
    onerror: Function;
    onmessage: Function;
    onopen: Function;
    close();
    send(msg : string | Blob | ArrayBuffer | ArrayBufferView);
}