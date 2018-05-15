import {utf8Decoder, utf8Encoder} from "../tools/utf8buffer";


export class PrivateKey {
    private readonly ready : PromiseLike<any>;
    private privateKey : CryptoKey;
    private publicKey : PublicKey;
    constructor(){
        this.publicKey = null;

        this.ready = window.crypto.subtle.generateKey(
                {
                    name: "ECDSA",
                    namedCurve: "P-384",
                },
                false,
                ["sign", "verify"]
            ).then(keys => { //keys: {privateKey: CryptoKey, publicKey: CryptoKey}
                this.privateKey = keys.privateKey;

                return window.crypto.subtle.exportKey(
                    "jwk",
                    keys.publicKey
                );
            }).then(jwk => {
                this.publicKey = new PublicKey(jwk);
                return this.publicKey.ready;
            });

    }
    async sign<T>(obj : T) : Promise<VerDoc<T>> {
        await this.ready;
        let databuffer = utf8Encoder.encode(JSON.stringify(obj));
        let pukbuffer = utf8Encoder.encode(this.publicKey.toJSON());
        let header = new Uint8Array(new Uint16Array([databuffer.length, pukbuffer.length]).buffer);

        let signable = new Uint8Array(1 + header.length + databuffer.length + pukbuffer.length);

        signable[0] = 1; //version 1
        signable.set(header, 1);
        signable.set(databuffer, 1 + header.length);
        signable.set(pukbuffer, 1 + header.length + databuffer.length);

        let sigbuffer = new Uint8Array(await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: {name: "SHA-384"},
            },
            this.privateKey,
            signable
        ));

        let product = new Uint8Array(signable.length + sigbuffer.byteLength);
        product.set(signable, 0);
        product.set(sigbuffer, signable.length);

        let vd = new VerDoc<T>();
        vd.original = product.buffer;
        vd.key = this.publicKey;
        vd.data = obj;
        vd.signature = sigbuffer.buffer;

        return vd;
    }
}

export class VerDoc<T>{
    data: T;
    key: PublicKey;
    signature: ArrayBuffer;
    original: ArrayBuffer;
    static async reconstruct<T>(buffer : ArrayBuffer) : Promise<VerDoc<T>>{
        let inbuffer = new Uint8Array(buffer);

        switch (inbuffer[0]){
            case 1: {
                let lengths = new Uint16Array(inbuffer.slice(1, 5).buffer);
                let datalength = lengths[0];
                let puklength = lengths[1];

                let predata = utf8Decoder.decode(inbuffer);

                let doc = inbuffer.slice(0, 1 + 4 + datalength + puklength);
                let sig = inbuffer.slice(1 + 4 + datalength + puklength);
                let key = await new PublicKey(
                    JSON.parse(
                        utf8Decoder.decode(
                            doc.slice(1 + 4 + datalength)
                        )
                    )
                ).ready;

                if(
                    await key.verify(doc, sig)
                ){
                    let vd = new VerDoc<T>();
                    vd.signature = sig.buffer;
                    vd.key = key;
                    vd.data = JSON.parse(utf8Decoder.decode(doc.slice(1 + 4, 1 + 4 + datalength)));
                    vd.original = buffer;
                    return vd;
                }

                return Promise.reject("bad document");
            }
            default: return Promise.reject("version unsupported: "+inbuffer[0]);
        }
    }
}

// hash P-384 SPKI into (0,1) float
function SPKItoNumeric(spki: ArrayBuffer) : number {
    return new Uint8Array(spki).
        slice(-96).
        reverse().
        reduce((a,e,i)=>a+e*Math.pow(256,i), 0) /
        Math.pow(256, 96);
}

export class PublicKey {
    private publicCryptoKey: CryptoKey;
    private floating: number;
    private readonly jwk: JsonWebKey;
    ready;
    constructor(jwk: JsonWebKey){
        let protoJWK = {"crv":"P-384", "ext":true, "key_ops":["verify"], "kty":"EC", "x":jwk["x"], "y":jwk["y"]};
        this.floating = NaN;
        this.jwk = protoJWK;
        this.ready = window.crypto.subtle.importKey(
            "jwk",
            this.jwk,
            {
                name: "ECDSA",
                namedCurve: "P-384",
            },
            true,
            ["verify"]
        ).then(publicCryptoKey => {
            this.publicCryptoKey = publicCryptoKey;

            return window.crypto.subtle.exportKey(
                "spki",
                this.publicCryptoKey
            ).then(spki => {
                this.floating = SPKItoNumeric(spki);
            })
        }).then(()=>this);
    }
    hashed(){
        if(isNaN(this.floating)) throw Error("Not Ready.");
        return this.floating;
    }
    toJSON(){
        return JSON.stringify({"x": this.jwk["x"], "y": this.jwk["y"]});
    }
    verify(data: Uint8Array, signature: ArrayBuffer): PromiseLike<boolean>{
        return window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: {name: "SHA-384"},
            },
            this.publicCryptoKey,
            signature,
            data
        );
    }
    static fromString(jwkstring: string): PublicKey{
        return new PublicKey(JSON.parse(jwkstring));
    }
}