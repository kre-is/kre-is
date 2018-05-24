import {rtcconfig} from "./rtcconfig";
import {Future} from "../tools/Future";
import {ConnectionError} from "./ConnectionError";
import {Synchronicity} from "../tools/Synchronicity";

export interface RTCDataChannel extends EventTarget{
    onclose: Function;
    onerror: Function;
    onmessage: Function;
    onopen: Function;
    close();
    send(msg : string | Blob | ArrayBuffer | ArrayBufferView);
}


/**
 * Represents a connection to one peer. can contain multiple channels.
 * @property open {Promise<this>} resolves when the channels are ready
 * @property closed [Promise<this>} resolves when the connection terminates normally. Rejects on mangled messages or overflown buffers. consider banning.
 */
export class Connection{
    private rtcPeerConnection : RTCPeerConnection;
    readonly open : Promise<this>; // export as promise, but Synchronicity internally
    private readonly allChannelsOpen : Synchronicity; // necessary because RTC is non deterministic
    readonly closed : Promise<this>; //accept on close, reject on misbehavior

    private connectionIterator = 0; //give a unique name to the channels.

    constructor(){
        this.rtcPeerConnection = new RTCPeerConnection(rtcconfig);
        this.allChannelsOpen = new Synchronicity();
        this.open = this.allChannelsOpen.then(()=>this);
        this.closed = new Future<this>();
    }

    /**
     * All data in string.
     * gives you a function you can send buffer messages into, promises a response.
     * uses strings, because firefox has problems with generic byte arrays. although.. who cares about firefox?
     * @param {(request: string) => Promise<string>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: string) => Promise<string>}
     */
    createChannel(
        onmessage : RequestFunction<string, string>,
        maxOpenMessages=100
    )
        : RequestFunction<string, string>
    {
        if(this.allChannelsOpen.getState() != "pending"){
            throw "channels can only be created before starting the connection!"
        }

        let requestChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectionIterator, {negotiated: true, id: this.connectionIterator++});
        let responseChannel = (this.rtcPeerConnection as any).createDataChannel(this.connectionIterator, {negotiated: true, id: this.connectionIterator++});

        let responseChannelOpen = new Future<RTCDataChannel>();
        let requestChannelOpen = new Future<RTCDataChannel>();

        this.allChannelsOpen.add(responseChannelOpen);
        this.allChannelsOpen.add(requestChannelOpen);

        let openRequests = 0;


        // Ensure all channels are open
        let self = this;
        requestChannel.onopen = ()=>{
            requestChannelOpen.resolve(requestChannel);
        };
        responseChannel.onopen = () => {
            responseChannelOpen.resolve(responseChannel);
        };

        //handle the sending of a responseMessage. is altered by bounce.
        let responseDispatch = (message : string) => {
            responseChannel.send(message);
            openRequests--;
        };

        // handle FOREIGN REQUESTS
        // a request is coming in.
        requestChannel.onmessage = (message : MessageEvent) => {
            openRequests++;

            let data : string = message.data;
            let reference = data.codePointAt(0);

            //anti DOS
            //partner tries to flood us
            if(openRequests > maxOpenMessages){
                try{
                    responseChannel.send(ConnectionError.InbufferExhausted().transmit(0));
                } catch (e){
                    //don't care if they don't receive it, they're criminal
                }
                //todo: implement IP ban
                console.log("dropped spamming peer");
                (self.closed as Future<this>).reject(self);
                self.close();
                return;
            }

            //perform onmessage
            onmessage(data.slice(1)) // first symbol is reference
                .then(response => {
                    if((self.closed as Future<this>).getState() != "pending")
                        return; // do not transmit.

                    responseChannelOpen.then(()=> {
                        responseDispatch(String.fromCodePoint(reference) + response);
                    })
                })
                .catch( error => {
                    if((self.closed as Future<this>).getState() != "pending")
                        return; // do not transmit.

                    let transmissible;
                    try {
                        transmissible = error.transmit(reference);
                    }catch(e){
                        transmissible = ConnectionError.UncaughtRemoteError().transmit(reference);
                    }
                    responseChannelOpen.then(()=> {
                        responseDispatch(transmissible);
                    });
            });
        };

        // handle REQUEST DISPATCHING
        //store outgoing message futures here
        let callbackBuffer : Future<string>[] = new Array(maxOpenMessages).fill(null);

        let sentRequests = 0;

        /**
         * bounce all messages in the buffer
         * effectively just returns an error everywhere.
         * another layer should determine what to do with that.
         */
        let bounce = () =>{
            self.rtcPeerConnection.close();
            responseDispatch = ()=>{}; // any responses get simply dropped.
            (self.closed as Future<this>).resolve(self);
            callbackBuffer.filter(e => e).forEach(e => e.reject(ConnectionError.Bounced()));
            self.close();
        };

        requestChannel.onclose = bounce;
        responseChannel.onclose = bounce;

        //resolve and clear the parked futures on response
        responseChannel.onmessage = (message : MessageEvent) => {
            let data : string = message.data;
            let reference = data.codePointAt(0);

            if(reference == 0){ // an error occurred remotely!
                let err = ConnectionError.parse(data);
                reference = err.reference;
                try{
                    callbackBuffer[reference].reject(err);
                    callbackBuffer[reference] = null;
                    sentRequests--;
                } catch (e) {
                    //@todo: implement ip banning
                    (self.closed as Future<this>).reject(self);
                    bounce();
                }
                return;
            }

            callbackBuffer[reference].resolve(data.slice(1));
            callbackBuffer[reference] = null;
            sentRequests--;
            return;
        };

        // actually DISPATCH REQUESTS
        return (request : string)=> {
            sentRequests++;

            //we don't want to spam our partner, otherwise they drop us.
            if(sentRequests >= maxOpenMessages){
                sentRequests--;
                return Promise.reject(ConnectionError.OutbufferExhausted());
            }

            // find a space in the callbackBuffer
            let idx = callbackBuffer.indexOf(null, 1); // exclude spot 0, for errors n stuff

            let future = new Future<string>();

            callbackBuffer[idx] = future;

            requestChannel.send(String.fromCodePoint(idx) + request);
            return future;
        };

    }

     offer() : Promise<Offer>{
        if(this.allChannelsOpen.getState() != "pending"){
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.createOffer().then(description => {
            this.rtcPeerConnection.setLocalDescription(description);
        });
        // promise to wait for the sdp
        return new Promise<Offer>((accept) => {
            this.rtcPeerConnection.onicecandidate = event => {
                if (event.candidate) return;
                accept({sdp: this.rtcPeerConnection.localDescription.sdp});
            }
        });
    }
    answer(offer : Offer) : Promise<Answer>{
        if(this.allChannelsOpen.getState() != "pending"){
            throw "this connection is already active!";
        }
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "offer",
            sdp: offer.sdp
        }));
        this.rtcPeerConnection.createAnswer().then(description => {
            this.rtcPeerConnection.setLocalDescription(description);
        });
        return new Promise<Answer>((accept) => {
            this.rtcPeerConnection.onicecandidate = event => {
                if (event.candidate) return;
                accept({sdp: this.rtcPeerConnection.localDescription.sdp});
            }
        });
    }
    complete(answer : Answer) : Promise<void>{
        if(this.allChannelsOpen.getState() != "pending"){
            throw "this connection is already active!";
        }
        return this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: answer.sdp
        }));
    }

    close(){
        // should propagate into bounce, etc.
        this.rtcPeerConnection.close();
        (this.closed as Future<this>).resolve(this);
    }
}




interface SDP{sdp: string;}
export interface Offer extends SDP{

}
export interface Answer extends SDP{

}
export interface RequestFunction<RequestT, ResponseT>{
    (request :RequestT) : Promise<ResponseT>
}