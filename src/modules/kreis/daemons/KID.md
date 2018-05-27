#[SPEC] KID - KreisInternal Daemon 
* ensures the network remains healthy
* greedy
* unobtrusive (resource sparing)

## S States
* `q0`: idle/inactive
* `q1`: seeking : sent offer into network
* `q2`: timeout : calls `run()` after n millis;
* `q3`: stopped

## Σ Inputs
* `run()` : external interface
* `stop()` : external interface
* `KreisAnswer` : interface provided by `q1`
* `Error<any>` : interface provided by `q1`

## δ Transitions
* `(Ɐ, stop(), q3)`
* `(q0, run(), q1)`
* `(q1, KreisAnswer, q1)`
* `(q1, Error<any>, q2)`
* `(q2, run(), q1)`
* `(q3, run(forced), q1)`

