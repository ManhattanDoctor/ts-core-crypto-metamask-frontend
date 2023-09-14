import * as _ from 'lodash';

export class Metamask {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = 'Ed25519Metamask';

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static sign(message: string, address: string, wallet: any): Promise<string> {
        return wallet.request({ method: 'personal_sign', params: [message, address] });
    }

    public static async verify(message: string, signature: string, address: string, wallet: any): Promise<boolean> {
        let recovered = await wallet.request({ method: 'personal_ecRecover', params: [message, signature] });
        return recovered.toUpperCase() === address.toUpperCase();
    }
}
