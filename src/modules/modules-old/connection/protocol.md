#[DEPRECATED] Connection
All or nothing: when one channel fails, the entire connection breaks down. 

Updated Note: see connection, connectionerror implementation.

#StringChannel
##characters
 * \[0\]: unicoded : reference id, reference ID is not \0 (codePoint)
 * \[1 to n\]: data
 
##except if \[0\] == 0
 then we have an error response
 * \[0\]: 0
 * \[1\]: error type
 * \[2\]: reference id
 * ?\[3..\]additional info, depending on error type.
 
 only a response can be an error. a request with reference ID 0 is not defined.
 
## Reference ID 
the first ~~byte~~ codepoint of the request is sent back as the first byte of the response, to which the actual data is appended.
this means that there can be a theoretical maximum of ~~255~~ ~2^100 concurrent unresolved requests at a time.

## Error Codes
 * 1: local max buffer exhausted. next byte defines the number of max connections.
 * 2: remote max buffer is exhausted. next byte defines the number of max connections.
 * 3: connection failure, the message is bounced and should probably retransmitted elsewhere. consider this connection dead.
 * 4: remote host sent a message you couldn't parse. next bytes include said message.
 * 5: the target could not be found. perhaps the network is still too small
 * 6: remote host sent a response we didn't expect