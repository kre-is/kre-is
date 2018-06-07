// import {Cable, CableAnswer, CableOffer} from "../Cable";
// import {routerc} from "../config";
// import {PrivateKey} from "../../crypto/PrivateKey";
// import {Multisocket} from "../Multisocket";
//
// export class CableFactory {
//     pendingOutgoingCables : Cable[] =
//         new Array(routerc.maxPendingOutgoingConnections).fill(null);
//     pendingIncomingCables : Cable[] =
//         new Array(routerc.maxPendingIncomingConnections).fill(null);
//     protected key : PrivateKey;
//
//     onmessage : (req : string) => Promise<string>;
//
//
//     constructor(onmessage : (req : string) => Promise<string>, key : PrivateKey){
//         this.onmessage = onmessage;
//         this.key = key;
//     }
//
//     /**
//      * generates a cableoffer, which will be plugged into the network as soon as it resolves.
//      * when an unresolved offer becomes too old and the pending buffer too large, the oldest element gets dropped.
//      * @returns {Promise<CableOffer>}
//      */
//     async offer() : Promise<CableOffer>{
//         let self = this;
//         let idx = this.pendingOutgoingCables.indexOf(null);
//         if(idx == -1){
//             let oldest = new Date().getTime();
//             idx = this.pendingOutgoingCables.reduce((a,e,i)=>{
//                 if(e.dateOfCreation < oldest){
//                     oldest = e.dateOfCreation;
//                     return i;
//                 }
//                 return a;
//             },0);
//             this.pendingOutgoingCables[idx].close();
//             this.pendingOutgoingCables[idx] = null;
//         }
//
//         this.pendingOutgoingCables[idx] = new Cable(this.onmessage);
//
//         this.pendingOutgoingCables[idx].ready.then(cable => {
//             if(self.pendingOutgoingCables[idx] === cable)
//                 self.pendingOutgoingCables[idx] = null;
//         });
//
//         return await this.pendingOutgoingCables[idx].signedOffer(this.key, idx);
//     }
//
//     async answer(CableOffer) : Promise<CableAnswer>{
//         let self = this;
//
//         let foreignkey = //setforeignkey
//
//
//         if(idx == -1){
//             let oldest = new Date().getTime();
//             idx = this.pendingIncomingCables.reduce((a,e,i)=>{
//                 if(e.dateOfCreation < oldest){
//                     oldest = e.dateOfCreation;
//                     return i;
//                 }
//                 return a;
//             },0);
//             this.pendingIncomingCables[idx].close();
//             this.pendingIncomingCables[idx] = null;
//         }
//
//         this.pendingIncomingCables[idx] = new Cable(this.onmessage);
//
//         this.pendingIncomingCables[idx].ready.then(cable => {
//             if(self.pendingIncomingCables[idx] === cable)
//                 self.pendingIncomingCables[idx] = null;
//         });
//
//         return String.fromCodePoint(idx) + await this.pendingIncomingCables[idx].signedOffer(this.key, idx);
//     }
//     complete() : Promise<this>{
//
//     }
// }
//
// export class IncomingMessage{
//     data : string;
//     origin : Cable;
// }
//
