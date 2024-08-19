import { base64 } from '@scure/base'
import * as btc from '@scure/btc-signer'
import { UtxoData, getPsbtPayment, getPsbtInput, getPsbtOutput, getBtcTransactionNetworkFee, PsbtTransaction } from '@okxweb3/marketplace-onchain'
import { walletSignPsbt, btcToSats, MIN_UTXO_VALUE } from './helper'

export interface orderInfoOption {
  psbt: string;
  makerFee: string;
  makerFeeAddress: string;
  takerFee: string;
  takerFeeAddress: string;
  [key: string]: unknown;
}
// Generate a buyer PSBT
export const getBuyerPsbt = async ({
  walletAddress,
  orderInfos,
  publicKey,
  paymentUtxos,
  networkFeeRate,
  privateKey
}: {
    walletAddress: string;
    orderInfos: orderInfoOption[];
    publicKey: string;
    paymentUtxos: UtxoData[];
    networkFeeRate: number;
    privateKey: string;
  }): Promise<{ psbt: string; networkFee: number }> => {
  const tx = new btc.Transaction() as unknown as PsbtTransaction
  const buyerPayment = await getPsbtPayment({ address: walletAddress, publicKey })
  if (!buyerPayment) {
    throw new Error('Invalid buyer payment, please check privateKey and addressType')
  }

  // sell utxo total amount
  let totalSellerUtxoAmount = 0

  // Add buyer's first payment UTXO as input
  const input0 = await getPsbtInput({ payment: buyerPayment, utxoData: paymentUtxos[0] })

  tx.addInput(input0, true)

  // Add seller inputs
  for (const orderInfo of orderInfos) {
    const sellTx = btc.Transaction.fromPSBT(base64.decode(orderInfo.psbt)) as unknown as PsbtTransaction
    totalSellerUtxoAmount += Number(sellTx.inputs[1]?.witnessUtxo?.amount) || 0
    tx.addInput(sellTx.inputs[1], true)
  }

  // Add remaining buyer payment UTXOs as inputs
  for (let i = 1; i < paymentUtxos.length; i++) {
    const input = await getPsbtInput({ payment: buyerPayment, utxoData: paymentUtxos[i] })
    tx.addInput(input, true)
  }

  // Add output for 546 sats
  const output0 = await getPsbtOutput({ payment: buyerPayment, value: MIN_UTXO_VALUE })
  tx.addOutput(output0, true)

  // Add seller outputs
  let totalOrdersPrice = 0
  for (const orderInfo of orderInfos) {
    const sellTx = btc.Transaction.fromPSBT(base64.decode(orderInfo.psbt)) as unknown as PsbtTransaction
    totalOrdersPrice += Number(sellTx.outputs[1].amount)
    tx.addOutput(sellTx.outputs[1], true)
  }

  // Calculate network fee
  const { networkFee } = await getBtcTransactionNetworkFee({
    psbt: tx,
    networkFeeRate,
    walletAddress
  })
  // taker fee
  let totalTakerFee = 0
  for (const orderInfo of orderInfos) {
    if (orderInfo.takerFeeAddress && orderInfo.takerFee) {
      totalTakerFee += btcToSats(orderInfo.takerFee)
      tx.addOutputAddress(orderInfo.takerFeeAddress, BigInt(btcToSats(orderInfo.takerFee)))
    }
  }

  // maker fee
  let totalMakerFee = 0
  for (const orderInfo of orderInfos) {
    if (orderInfo.makerFeeAddress && orderInfo.makerFee) {
      totalMakerFee += btcToSats(orderInfo.makerFee)
      tx.addOutputAddress(orderInfo.makerFeeAddress, BigInt(btcToSats(orderInfo.makerFee)))
    }
  }

  // Calculate change
  const paymentTotalValue = paymentUtxos.reduce((amount, paymentUtxo) => amount + paymentUtxo.value, 0)
  const change = paymentTotalValue + totalSellerUtxoAmount - MIN_UTXO_VALUE - totalOrdersPrice - networkFee - totalTakerFee - totalMakerFee
  if (change < 0) {
    throw new Error('Insufficient balance, please check utxo')
  }

  if (change >= MIN_UTXO_VALUE) {
    const changeOutput = await getPsbtOutput({ payment: buyerPayment, value: change })
    tx.addOutput(changeOutput, true)
  }

  const psbtBytes = tx.toPSBT()

  // Sign the PSBT
  const { signedPsbtBase64 } = await walletSignPsbt({
    psbt: base64.encode(psbtBytes),
    privateKey
  })

  return { psbt: signedPsbtBase64, networkFee }
}
