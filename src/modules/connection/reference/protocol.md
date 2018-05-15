note: deprecated, references createRawDatachannel
#Connection
All or nothing: when one channel fails, the entire connection breaks down. 

#RawConnection
##bytes
 * \[0\]: reference id
 * \[1 to n\]: data
 
###unless \[0\] == 0
 then 
 * \[0\]: error
 * \[1\]: reference id
 * \[2\]: error type
 
 only a response can be an error. a request with reference ID 0 is not defined.
 
## Reference ID 
the first byte of the request is sent back as the first byte of the response, to which the actual data is appended.
this means that there can be a theoretical maximum of 255 concurrent unresolved requests at a time.

## Error Codes
* 1: local max buffer exhausted. next byte defines the number of max connections.
* 2: remote max buffer is exhausted. next byte defines the number of max connections.
* 3: connection failure, the message is bounced and needs to be retransmitted elsewhere.