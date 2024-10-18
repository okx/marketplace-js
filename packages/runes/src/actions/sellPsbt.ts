import { base64, hex } from '@scure/base'
import * as btc from '@scure/btc-signer'
import { UtxoData, getPsbtPayment, getPsbtInput, getPsbtOutput, PsbtTransaction } from '@okxweb3/marketplace-onchain'
import { walletSignPsbt } from './helper'

// placeholder input obj
const placeholderObj = {
  publicKey: '616e27323840ee0c2ae434d998267f81170988ba9477f78dcd00fc247a27db40',
  address: 'bc1pcyj5mt2q4t4py8jnur8vpxvxxchke4pzy7tdr9yvj3u3kdfgrj6sw3rzmr',
  utxo: '0000000000000000000000000000000000000000000000000000000000000000'
}

// Generate a seller PSBT
export const getSellerPsbt = async ({
  walletAddress,
  publicKey,
  privateKey,
  assetUtxo,
  price
}: {
    walletAddress: string;
    publicKey: string;
    assetUtxo: UtxoData;
    price: number;
    privateKey: string;
  }): Promise<{ psbt: string; }> => {
  const tx = new btc.Transaction() as unknown as PsbtTransaction
  const sellerPayment = await getPsbtPayment({
    address: walletAddress,
    publicKey
  })
  if (!sellerPayment) {
    throw new Error('please check privateKey and addressType')
  }

  // placeholder input
  tx.addInput({
    txid: placeholderObj.utxo,
    index: 0,
    witnessUtxo: {
      amount: BigInt(0),
      script: btc.p2tr(hex.decode(placeholderObj.publicKey)).script
    },
    tapInternalKey: hex.decode(placeholderObj.publicKey),
    sighashType: btc.SigHash.ALL
  }, false)

  // nft input
  const assetInput = await getPsbtInput({
    payment: sellerPayment,
    utxoData: assetUtxo
  })
  if (!assetInput.txid) {
    throw new Error('assetUtxo is required')
  }

  tx.addInput({ ...assetInput, sighashType: btc.SigHash.SINGLE | btc.SigHash.DEFAULT_ANYONECANPAY }, false)
  // placeholder output
  tx.addOutputAddress(placeholderObj.address, BigInt(0))

  if (isNaN(price)) {
    throw new Error('price error')
  }
  // seller receive btc output
  const receiveBtcOutput = await getPsbtOutput({ payment: sellerPayment, value: price })
  tx.addOutput(receiveBtcOutput, true)

  // Sign the PSBT
  const psbtBytes = tx.toPSBT()
  const { signedPsbtBase64 } = await walletSignPsbt({
    psbt: base64.encode(psbtBytes),
    privateKey
  })

  return { psbt: signedPsbtBase64 }
}
