import { UtxoData, BtcAddressSig } from '@okxweb3/marketplace-onchain'
import { mixinMiddleware, Middleware } from '@okxweb3/marketplace-core'
import { BaseContext } from './types/middleware'
import { loggerMiddleware } from './middleware/logger'
import { getBuyerPsbt, getSellerPsbt, getPublicKeyAndAddress, orderInfoOption, signMessage, btcToSats, satsToBtc } from './actions'
import { OkxRunesAPI } from './api'
import { ADDRESS_TYPE, UTXO_SPEND_STATUS, ORDERS_SORT_RULES, SIGN_ALGORITHM } from './constants'
interface sdkOptions {
  privateKey: string,
  apikey: string,
  secretKey: string,
  passphrase: string,
  projectId: string,
  addressType: ADDRESS_TYPE;
  requestBaseUrl?: string;
}

export class OkxRunesSDK extends Middleware<BaseContext> {
  public ctx = {
    type: '',
    address: '',
    publicKey: '',
    request: {
      params: []
    },
    response: {
      result: {}
    }
  }

  // wallet private key
  private privateKey: string = ''

  // address type
  public addressType: ADDRESS_TYPE

  public api: OkxRunesAPI

  constructor (options: sdkOptions) {
    super()
    this.privateKey = options.privateKey
    this.addressType = options.addressType || ADDRESS_TYPE.SEGWIT_TAPROOT
    this.getPublicKeyAndAddressByPrivateKey()
    // openApi
    this.api = new OkxRunesAPI({
      ...options,
      addressType: this.addressType
    })

    this.use(loggerMiddleware)
  }

  // get publickey and address by private key
  private async getPublicKeyAndAddressByPrivateKey () {
    const { address, publicKey } = await getPublicKeyAndAddress({
      privateKey: this.privateKey,
      addressType: this.addressType
    })
    this.ctx.address = address
    this.ctx.publicKey = publicKey
    return { address, publicKey }
  }

  // buy runes
  @mixinMiddleware
  async buy ({
    orderIds,
    paymentUtxos,
    networkFeeRate
  }: {
    orderIds: number[];
    paymentUtxos: UtxoData[];
    networkFeeRate: number;
    }): Promise<{ txHash: string, networkFee: number }> {
    if (!orderIds || orderIds.length <= 0) {
      throw new Error('orderId required')
    }

    if (!networkFeeRate) {
      throw new Error('networkFeeRate required')
    }

    // get publickey and address by private key
    const { address, publicKey } = await this.getPublicKeyAndAddressByPrivateKey()

    if (address.startsWith(BtcAddressSig.LEGACY)) {
      throw new Error('legacy address is not supported, please switch to another address')
    }

    const orders = await this.api.getSellersPsbt(orderIds) || []
    const orderInfos = orders.orderInfos.map(({ psbt, makerFee, makerFeeAddress, takerFee, takerFeeAddress }:orderInfoOption) => {
      return {
        psbt,
        makerFee,
        makerFeeAddress,
        takerFee,
        takerFeeAddress
      }
    })

    // get psbt
    const { psbt, networkFee } = await getBuyerPsbt({
      walletAddress: address,
      orderInfos,
      publicKey,
      paymentUtxos,
      networkFeeRate,
      privateKey: this.privateKey
    })

    // send transation
    const { txHash } = await this.api.sendTransations({ buyerPSBT: psbt, fromAddress: address, orderIds })

    return { txHash, networkFee }
  }

  /**
   * sell runes
   * @param orderIds
   * @returns {Promise<{}>} result
   */
  @mixinMiddleware
  async sell ({
    assets,
    runesId
  }: {
      assets: {
        utxoTxHash: string;
        utxoValue: number;
        utxoVout: number;
        amount: number;
        unitPrice: number; // sats
        makerFee?: number; // btc
      }[];
      runesId: string;
    }): Promise<{ result: Record<string, unknown> }> {
    if (!assets || assets.length <= 0) {
      throw new Error('assets required')
    }

    if (assets.length > 10) {
      throw new Error('the max sell number is 10')
    }

    // get publickey and address by private key
    const { address, publicKey } = await this.getPublicKeyAndAddressByPrivateKey()

    if (address.startsWith(BtcAddressSig.LEGACY)) {
      throw new Error('legacy address is not supported, please switch to another address')
    }

    assets.forEach((asset) => {
      if (!asset.utxoTxHash || !asset.utxoValue || !asset.amount || !asset.unitPrice) {
        throw new Error('assets params error, please check')
      }
    })

    // update padding input
    const results = await Promise.all(
      assets.map(async ({ utxoTxHash, utxoValue, utxoVout, unitPrice, amount, makerFee }) => {
        // calc asset total price
        const totalPrice = Number(unitPrice) * Number(amount)
        if (totalPrice < 10000) {
          throw new Error('total price must be more than 10000 sats')
        }
        // get psbt
        const { psbt } = await getSellerPsbt({
          walletAddress: address,
          publicKey,
          privateKey: this.privateKey,
          assetUtxo: {
            txid: utxoTxHash,
            vout: utxoVout,
            value: utxoValue
          },
          price: totalPrice
        })
        const totalPriceAddMakerFee = totalPrice + btcToSats(makerFee || 0)
        const unitPriceAddMakerFee = totalPriceAddMakerFee / Number(amount)
        return {
          utxo: utxoTxHash + ':' + utxoVout,
          unitPrice: unitPriceAddMakerFee,
          totalPrice: satsToBtc(totalPriceAddMakerFee),
          psbt,
          makerFee
        }
      }, true)
    )

    // sell runes
    const data = await this.api.sellRunes({
      runesId,
      walletAddress: address,
      items: results
    })
    return { result: data }
  }

  /**
   * cancel runes orders
   * @param orderIds
   * @returns {Promise<boolean>} result
   */
  @mixinMiddleware
  async cancelSell ({
    orderIds
  }: {
    orderIds: number[];
    }): Promise<boolean> {
    if (!orderIds || orderIds.length <= 0) {
      throw new Error('orderId required')
    }

    if (orderIds.length > 20) {
      throw new Error('Maximum batch cancel 20 orders')
    }

    // get signMessage text
    const { id, text } = await this.api.getCancelSellText({
      orderIds: orderIds.join(',')
    })

    // sign message
    const signature = await signMessage({
      privateKey: this.privateKey,
      message: text,
      address: this.ctx.address
    })

    // cancel runes orders
    await this.api.cancelSellSubmit({
      id,
      signature,
      signAlgorithm: SIGN_ALGORITHM.ECDSA
    })

    return true
  }
}
export { ADDRESS_TYPE, UTXO_SPEND_STATUS, ORDERS_SORT_RULES }

export * from './types/context'
