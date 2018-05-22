import {Connection, RequestFunction} from "./Connection";
import {ConnectionError} from "./ConnectionError";

export class TypedConnection extends Connection{
    /**
     * Typed version of createRawChannel
     * Request type RequestT expects response type ResponseT. RequestT and ResponseT should be data transfer structures. All fields must support JSON stringify.
     * @param {(request: RequestT) => Promise<ResponseT>} onmessage
     * @param {number} maxOpenMessages
     * @returns {(request: RequestT) => Promise<ResponseT>} pipe your messages into this. catch for errors, hinting you may want to retransmit your packages through other routes.
     */
    createChannel<RequestT,ResponseT>(onmessage : RequestFunction<RequestT, ResponseT>,maxOpenMessages=100) : RequestFunction<RequestT, ResponseT>{

        let channel = super.createChannel(request =>{
            try{
                return onmessage(JSON.parse(request)).
                then(response => JSON.stringify(response));
            }catch(e){
                return Promise.reject(ConnectionError.FATAL_ReceivedGarbage(request));
            }
        }, maxOpenMessages);

        return (request)=>{
            return channel(JSON.stringify(request)).
            then(response => JSON.parse(response));
        };
    }
}