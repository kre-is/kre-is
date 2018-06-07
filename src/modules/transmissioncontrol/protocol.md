#TransmissionControlProtocol
transmissions are strings. we investigate the first codepoint to determine message type

following that, a request contains a reference codepoint. the respondent is to respond with that same codepoint in the second place.

##Message types, beginning with codepoint

* 0: request
* 1: response
* 2: error response

### CPT 0 
a 0, followed by a reference number

followed by the data

### CPT 1
a 1, followed by the reference number sent with the request

followed by the data
### CPT 2
a 2, followed by the reference number sent with the request

followed by the data

## Example

* Request: \u0000ßHello, this is a request
* Response: \u0001ßThis is a response to "Hello, this is a request"
* Error: \u0002ßI cannot handle your request "Hello, this is a request"