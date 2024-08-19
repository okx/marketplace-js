/**
 * Define transaction types
 */
export enum PsbtTransactionType {
    P2PKH = 'p2pkh',
    P2SH = 'p2sh',
    P2WPKH = 'p2wpkh',
    P2TR = 'p2tr',
}

/**
 * Define Bitcoin address signatures
 */
export enum BtcAddressSig {
    LEGACY = '1',
    SEGWIT = '3',
    BECH32 = 'bc1q',
    TAPROOT = 'bc1p',
}

/**
 * Network configuration
 */
export const NETWORK_CONFIG = {
  bech32: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80
}
