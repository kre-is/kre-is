/**
 * @property local {boolean} whether the error originated locally or remotely
 */
export class ConnectionError{
    type: number;
    data: string;
    reference: number;
    local: boolean;
    constructor(type : number, data ?: string, reference = 0, local = true){
        this.type = type;
        this.data = data;
        this.reference = reference;
        this.local = local;
    }
    static RETRANSMIT_LocalBufferExhausted(): ConnectionError{
        return new ConnectionError(1);
    }
    static FATAL_RemoteBufferExhausted(): ConnectionError{
        return new ConnectionError(2);
    }
    static ERROR_ParticipantUnreachable(): ConnectionError{
        return new ConnectionError(3);
    }
    static FATAL_ReceivedGarbage(data : string): ConnectionError{
        return new ConnectionError(4, data);
    }
    static FATAL_UnexpectedResponse(): ConnectionError{
        return new ConnectionError(5);
    }
    static RETRANSMIT_NetworkEmpty(): ConnectionError{
        return new ConnectionError(6);
    }

    transmit(): string{
        return String.fromCodePoint(0,this.reference, this.type) + this.data;
    }
    static parse(data: string): ConnectionError{
        try{
            //remote source
            return new ConnectionError(data.codePointAt(1), data.slice(3), data.codePointAt(2), false);
        } catch (e) {
            return ConnectionError.FATAL_ReceivedGarbage(data);
        }

    }
}


