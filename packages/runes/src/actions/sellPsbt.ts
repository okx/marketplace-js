import { base64, hex } from '@scure/base'
import * as btc from '@scure/btc-signer'
import { UtxoData, getPsbtPayment, getPsbtInput, getPsbtOutput, getBtcTransactionNetworkFee, PsbtTransaction } from '@okxweb3/marketplace-onchain'
import { walletSignPsbt, btcToSats, MIN_UTXO_VALUE } from './helper'

const paddingObj = {
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
  price,
  makerFee,
  makerFeeAddress
}: {
    walletAddress: string;
    publicKey: string;
    assetUtxo: UtxoData;
    price: number;
    privateKey: string;
    makerFee: number;
    makerFeeAddress: string;
  }): Promise<{ psbt: string; networkFee: number }> => {
  const tx = new btc.Transaction() as unknown as PsbtTransaction
  const sellerPayment = await getPsbtPayment({
    address: walletAddress,
    publicKey
  })
  if (!sellerPayment) {
    throw new Error('please check privateKey and addressType')
  }

  // placeholder
  tx.addInput({
    txid: paddingObj.utxo,
    index: 0,
    witnessUtxo: {
      amount: BigInt(0),
      script: btc.p2tr(hex.decode(paddingObj.publicKey)).script
    },
    tapInternalKey: hex.decode(paddingObj.publicKey),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY
  }, false)

  // nft input
  const assetInput = await getPsbtInput(
    { payment: sellerPayment, utxoData: assetUtxo }
  )
  if (!assetInput.txid) {
    throw new Error('assetUtxo is required')
  }

  tx.addInput(assetInput, true)

  if (isNaN(price)) {
    throw new Error('price error')
  }
  // receive address
  tx.addOutputAddress(
    walletAddress,
    BigInt(price)
  )

  return tx
}
