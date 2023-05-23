import { ITransportCommand, ISignature, TransportCryptoManager } from '@ts-core/common';
import { Metamask } from '../Metamask';
import * as _ from 'lodash';

export class TransportCryptoManagerMetamaskFrontend extends TransportCryptoManager {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static ALGORITHM = Metamask.ALGORITHM;

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
        return Metamask.sign(this.toString(command, nonce), address, this.wallet);
    }

    public async verify<U>(command: ITransportCommand<U>, signature: ISignature): Promise<boolean> {
        return Metamask.verify(this.toString(command, signature.nonce), signature.value, signature.publicKey, this.wallet);
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
