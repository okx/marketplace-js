import { hex } from '@scure/base'
import * as btc from '@scure/btc-signer'
import { PsbtTransactionType, BtcAddressSig, NETWORK_CONFIG } from '../../constants'
import { UtxoData, PsbtPayment, PsbtOutput, PsbtInput } from '../../types'

/**
 * Determine the payment details based on the address and public key
 */
export const getPsbtPayment = async ({ address, publicKey }: { address: string; publicKey: string }): Promise<PsbtPayment | null> => {
  const publicKeyBytes = hex.decode(publicKey)
  // Handle legacy (P2PKH) addresses
  if (address.startsWith(BtcAddressSig.LEGACY)) {
    return {
      script: btc.p2pkh(publicKeyBytes, NETWORK_CONFIG)?.script,
      type: PsbtTransactionType.P2PKH,
      publicKeyBytes
    }
  }

  // Handle SegWit (P2SH-P2WPKH) addresses
  if (address.startsWith(BtcAddressSig.SEGWIT)) {
    const p2wpkh = btc.p2wpkh(publicKeyBytes, NETWORK_CONFIG)
    return {
      script: btc.p2sh(p2wpkh, NETWORK_CONFIG)?.script,
      redeemScript: btc.p2sh(p2wpkh, NETWORK_CONFIG)?.redeemScript,
      type: PsbtTransactionType.P2SH,
      publicKeyBytes
    }
  }

  // Handle native SegWit (P2WPKH) addresses
  if (address.startsWith(BtcAddressSig.BECH32)) {
    return {
      script: btc.p2wpkh(publicKeyBytes, NETWORK_CONFIG)?.script,
      type: PsbtTransactionType.P2WPKH,
      publicKeyBytes
    }
  }

  // Handle Taproot (P2TR) addresses
  if (address.startsWith(BtcAddressSig.TAPROOT)) {
    return {
      script: btc.p2tr(publicKeyBytes)?.script,
      type: PsbtTransactionType.P2TR,
      publicKeyBytes
    }
  }

  return null
}

/**
   * Get input details based on UTXO data and payment
   */
export const getPsbtInput = async ({ utxoData, payment, sighashType = 1 }: { utxoData: UtxoData; payment: PsbtPayment; sighashType?: number }): Promise<PsbtInput> => {
  const input: PsbtInput = {
    txid: utxoData.txid,
    index: utxoData.vout,
    sighashType
  }

  // Handle P2PKH inputs
  if (payment.type === PsbtTransactionType.P2PKH) {
    return {
      ...input,
      nonWitnessUtxo: utxoData.rawTransaction
    }
  }

  // Base input for witness types
  const baseInput: PsbtInput = {
    ...input,
    witnessUtxo: {
      amount: BigInt(utxoData.value || 0),
      script: payment.script
    }
  }

  // Handle P2SH inputs
  if (payment.type === PsbtTransactionType.P2SH) {
    return {
      ...baseInput,
      redeemScript: hex.encode(payment.redeemScript!)
    }
  }

  // Handle Taproot inputs
  if (payment.type === PsbtTransactionType.P2TR) {
    return {
      ...baseInput,
      tapInternalKey: payment.publicKeyBytes
    }
  }

  return baseInput
}

/**
   * Calculate transaction size based on address type
   */
export const getPsbtSize = (walletAddress: string): number => {
  if (walletAddress.startsWith('1')) return 150 // Legacy
  if (walletAddress.startsWith('3')) return 100 // SegWit
  if (walletAddress.startsWith('bc1q')) return 65 // Native SegWit
  if (walletAddress.startsWith('bc1p')) return 69 // Taproot
  return 148 // Default
}

/**
   * Get output details based on value and payment
   */
export const getPsbtOutput = async ({ value, payment }: { value: number; payment: PsbtPayment }): Promise<PsbtOutput> => {
  const output: PsbtOutput = {
    amount: BigInt(value),
    script: payment.script
  }

  // Handle Taproot outputs
  if (payment.type === PsbtTransactionType.P2TR) {
    return {
      ...output,
      tapInternalKey: payment.publicKeyBytes
    }
  }

  return output
}
