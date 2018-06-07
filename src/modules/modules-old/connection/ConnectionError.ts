/**
 * BEFORE EXTENDING: @see Errors.md
 * @property type {number} type of error. Name and annotate the factories, so they can be identified
 * @property local {boolean} whether the error originated locally or remotely
 */
export class ConnectionError{
    type: number;
    data: string;
    reference: number;
    local: boolean; // local or remote
    constructor(type : number, reference : number, local = true){
        this.type = type;
        this.reference = reference;
        this.local = local;
    }
    static InbufferExhausted(): ConnectionError{
        return new ConnectionError(1, null);
    }
    static OutbufferExhausted(): ConnectionError{
        return new ConnectionError(2, null);
    }
    static ParticipantUnreachable(): ConnectionError{
        return new ConnectionError(3, null);
    }
    static ReceivedGarbage(): ConnectionError{
        return new ConnectionError(4, null);
    }
    static UnexpectedResponse(): ConnectionError{
        return new ConnectionError(5, null);
    }
    static NetworkEmpty(): ConnectionError{
        return new ConnectionError(6, null);
    }
    static UncaughtRemoteError(): ConnectionError{
        return new ConnectionError(7, null);
    }
    static Bounced(): ConnectionError{ // the connection closed unexpectedly.
        return new ConnectionError(8, null);
    }


    transmit(reference : number): string{
        return String.fromCodePoint(0, this.type, reference);
    }
    static parse(data: string): ConnectionError{
        return new ConnectionError(data.codePointAt(1), data.codePointAt(2), false);
    }
}


