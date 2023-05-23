import { ITransportCommand, ISignature, TransportCryptoManager } from '@ts-core/common';
import * as _ from 'lodash';

export class TransportCryptoManagerMetamaskFrontend extends TransportCryptoManager {
    
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = 'Ed25519Metamask';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected wallet: any) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async sign<U>(command: ITransportCommand<U>, nonce: string, address: string): Promise<string> {
        return this.wallet.request({ method: 'personal_sign', params: [this.toString(command, nonce), address] });
    }

    public async verify<U>(command: ITransportCommand<U>, signature: ISignature): Promise<boolean> {
        let address = await this.wallet.request({ method: 'personal_ecRecover', params: [this.toString(command, signature.nonce), signature.value] });
        return address.toUpperCase() === signature.publicKey.toUpperCase();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get algorithm(): string {
        return TransportCryptoManagerMetamaskFrontend.ALGORITHM;
    }
}
