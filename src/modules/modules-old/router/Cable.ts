// import {TransmissionControl} from "../transmissioncontrol/TransmissionControl";
// import {PrivateKey, PublicKey, RawDoc, VerDoc} from "../crypto/PrivateKey";
// import {Answer, Offer} from "../datalink/DataLink"
//
// export class Cable extends TransmissionControl{
//     address: PublicKey = null;
//     dateOfCreation: number;
//
//     /**
//      *
//      * @param {PrivateKey} signatory
//      * @param {[number]} ttr target, tolerance, exponent
//      * @returns {Promise<CableOffer>}
//      */
//     async signedOffer(signatory : PrivateKey, ttr : [number, number, number]) : Promise<CableOffer>{
//         this.dateOfCreation = new Date().getTime();
//         return signatory.sign(
//             String.fromCodePoint(...ttr) + await super.offer()
//         );
//     }
//
//     async signedAnswer(rawOffer : RawDoc<CableOffer>, signatory : PrivateKey, desirable : (target : number)=>boolean) : Promise<CableAnswer>{
//         let verDoc = await VerDoc.reconstruct<CableOffer>(rawOffer);
//         let target =
//
//         this.address = verDoc.key;
//         this.dateOfCreation = new Date().getTime();
//         return signatory.sign(
//             verDoc.data.charAt(2) + await super.answer(
//                 verDoc.data.slice(3)
//             )
//         )
//     }
//
//     async signedComplete(rawAnswer : RawDoc<CableAnswer>){
//         let verDoc = await VerDoc.reconstruct<CableAnswer>(rawAnswer);
//         this.address = verDoc.key;
//         return super.complete(verDoc.data.slice(1));
//     }
// }
//
// export class CableOffer extends RawDoc<{
//     r : number,
//     e : number,
//     t : number,
//     s : Offer
// }>{}
// export class CableAnswer extends RawDoc<{}>{}
