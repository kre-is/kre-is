import {ConnectionError} from "../connection/ConnectionError";

/**
 * @see connection/Errors.md
 * @see ConnectionError
 * Network Codes range is 1000-1999
 */
export class NetworkError extends ConnectionError{
    static NetworkEmpty(): ConnectionError{
        return new ConnectionError(1000, null);
    }
    static NoCandidates(): ConnectionError{ // no candidate accepted the request.
        return new ConnectionError(1001, null);
    }
}