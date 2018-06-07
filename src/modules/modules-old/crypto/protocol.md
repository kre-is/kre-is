#(obsolete)Self-Signed Key Exchange Protocol
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
 
###Version 2: *CodePoints, not Bytes*
  * 0: version (backwards compatible with v1)
  
####Header cont: 2 more Pts
 * 1: length of data in Pts
 * 2: length of PuK in Pts
####Data:
 * public key. substr 3, H[1]
 * data. substr 3+H[1], H[2]
 * signature. substr 3+H[1]+H[2]

