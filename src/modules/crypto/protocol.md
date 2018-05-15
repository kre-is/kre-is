#Self-Signed Key Exchange Protocol
##Bytes
 * 0: version, 8 bit uint

###Version 1: 
####Header: 4 bytes header in 16 bit uint chunks
 * 0: length of data in bytes
 * 1: length of public key bytes
####Data: chunks of header defined lengths
 * 0: data, utf-8 encoded JSON string as buffer
 * 1: public key in utf-8 encoded JWK as buffer
 * 2: signature: the remaining bytes in the buffer are expected to be the sig.
 
 

