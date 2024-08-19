import { getPsbtSize } from './psbt'
import { PsbtTransaction } from '../../types'

/**
   * Calculate network fee based on transaction size and fee rate
   */
export const getBtcTransactionNetworkFee = async ({
  psbt,
  networkFeeRate,
  walletAddress
}: {
      psbt: PsbtTransaction;
      networkFeeRate: number;
      walletAddress: string;
  }): Promise<{ networkFee: number }> => {
  const size = getPsbtSize(walletAddress)

  const inputCount = psbt.inputs.length
  const outputCount = psbt.outputs.length

  // Estimate fee
  return {
    networkFee: (size * inputCount + 34 * outputCount + 10) * networkFeeRate || 1
  }
}
