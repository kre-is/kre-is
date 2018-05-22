import {utf8Decoder, utf8Encoder} from "../tools/utf8buffer";


export class PrivateKey {
    private readonly ready : PromiseLike<any>;
    private privateKey : CryptoKey;
    private publicKey : PublicKey;
    readonly version = 2;
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
        let data = JSON.stringify(obj);
        let puk = this.publicKey.toJSON();
        let header = String.fromCodePoint(this.version, puk.length, data.length);
        let signable = utf8Encoder.encode(header+puk+data);

        let sigbuffer = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: {name: "SHA-384"},
            },
            this.privateKey,
            signable
        );

        let checksm = utf8Encoder.encode(header+puk+data).reduce((a,c,i)=>a+c*i,0);
        let uft =  new Uint8Array(sigbuffer);
        let chec2 = new Uint8Array(sigbuffer).reduce((a,c,i)=>a+c*i,0);

        let vd = new VerDoc<T>();
        vd.original = header+puk+data+String.fromCodePoint(...new Uint8Array(sigbuffer));
        vd.key = this.publicKey;
        vd.data = obj;
        vd.signature = JSON.stringify(new Uint8Array(sigbuffer));

        let ku = utf8Encoder.encode(vd.original);


        return vd;
    }
}

/**
 * VerDoc DAO
 */
export class RawDoc<T>{
    original : string;
}


export class VerDoc<T> extends RawDoc<T>{
    data: T;
    key: PublicKey;
    signature: string;
    static async reconstruct<T>(rawDoc : RawDoc<T>) : Promise<VerDoc<T>>{
        let version = rawDoc.original.codePointAt(0);

        switch (version){
            case 2: {
                let header = rawDoc.original.substring(0,3);
                let puk = rawDoc.original.substr(3, rawDoc.original.codePointAt(1));
                let data = rawDoc.original.substr(3 + rawDoc.original.codePointAt(1), rawDoc.original.codePointAt(2));
                let sig = rawDoc.original.substr(3 + rawDoc.original.codePointAt(1) + rawDoc.original.codePointAt(2));

                let key = await new PublicKey(
                    JSON.parse(
                        puk
                    )
                ).ready;

                let checksm = utf8Encoder.encode(header+puk+data).reduce((a,c,i)=>a+c*i,0);
                let uft =  utf8Encoder.encode(sig);
                let chec2 = utf8Encoder.encode(sig).reduce((a,c,i)=>a+c*i,0);

                if(
                    await key.verify(utf8Encoder.encode(header+puk+data), new Uint8Array(sig.split('').map(c => c.codePointAt(0))))
                ){
                    let vd = new VerDoc<T>();
                    vd.signature = sig;
                    vd.key = key;
                    vd.data = JSON.parse(data);
                    vd.original = rawDoc.original;
                    return vd;
                }

                return Promise.reject("bad document");
            }
            default: return Promise.reject("version unsupported: "+version);
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