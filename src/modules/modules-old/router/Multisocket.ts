// import {Cable} from "./Cable";
// import {Arctable} from "./arctable/Arctable";
// import {PrivateKey} from "../crypto/PrivateKey";
//
// /**
//  * you plug connections in here
//  */
// export class Multisocket {
//     protected key : PrivateKey;
//     protected table : Arctable<Cable>;
//
//
//     attach(cable : Cable){
//         let self = this;
//         cable.closed.then(c => self.detach(c));
//         let ejected = this.table.add(cable.address.hashed(), cable);
//         ejected && ejected.close();
//     }
//
//     detach(cable : Cable){
//         let ejected = this.table.remove(cable.address.hashed());
//         ejected && ejected.close();
//     }
//
//     suggest(){
//         return this.table.getSuggestions()[
//                 Math.floor(Math.random()**10 * this.table.maxSize)
//             ];
//     }
//
//     all() : Cable[]{
//         return this.table.getAll();
//     }
//
//     async closest(target : number, tolerance ?: number){
//         tolerance = tolerance || Arctable.distance(await this.key.getPublicHash(), tolerance);
//         let response = this.table.getWithin(target, tolerance);
//         if (!response) throw "no available participants";
//         return response;
//     }
// }