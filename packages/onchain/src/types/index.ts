import { PsbtTransactionType } from '../constants'

/**
 * UTXO data type
 */
export type UtxoData = {
    txid: string;
    vout: number;
    value: number;
    rawTransaction?: Uint8Array;
};

/**
 * Payment data type
 */
export type PsbtPayment = {
    script: Uint8Array;
    type: PsbtTransactionType;
    publicKeyBytes: Uint8Array;
    redeemScript?: Uint8Array;
};

/**
 * Output data type
 */
export type PsbtOutput = {
    amount: bigint;
    script: Uint8Array;
    tapInternalKey?: Uint8Array;
};

/**
 * Input data type
 */
export type PsbtInput = {
    txid: string;
    index: number;
    sighashType: number;
    nonWitnessUtxo?: Uint8Array;
    witnessUtxo?: {
        amount: bigint;
        script: Uint8Array;
    };
    redeemScript?: string;
    tapInternalKey?: Uint8Array;
};

/**
 * Transaction interface
 */
export interface PsbtTransaction {
    inputs: PsbtInput[];
    outputs: PsbtOutput[];
    toPSBT: () => Uint8Array;
    finalize: () => void;
    extract: () => Uint8Array;
    addInput: (input: PsbtInput, flag: boolean) => void;
    addOutput: (output: PsbtOutput, flag: boolean) => void;
    addOutputAddress: (address: string, amount: bigint) => void;
}
