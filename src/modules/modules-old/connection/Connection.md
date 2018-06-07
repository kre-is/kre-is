# Connection Behavior

* If a connection is terminated while requests are still being handled, 
the handled request outputs are destroyed and no further actions are taken
* If an onmessage function throws an error, it will be relayed the following ways:
  * If it's a ConnectionError type, it will be relayed as such.
  * If it's not a known ConnectionError type, it will be relayed as UncaughtRemoteError (type 7)
  * If an error has reference 0, the connection will be terminated.