import { UtxoData, BtcAddressSig } from '@okxweb3/marketplace-onchain'
import { mixinMiddleware, Middleware } from '@okxweb3/marketplace-core'
import { BaseContext } from './types/middleware'
import { loggerMiddleware } from './middleware/logger'
import { getBuyerPsbt, getPublicKeyAndAddress, orderInfoOption } from './actions'
import { OkxRunesAPI } from './api'
import { ADDRESS_TYPE, UTXO_SPEND_STATUS, ORDERS_SORT_RULES } from './constants'

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
  public addressType: ADDRESS_TYPE = ADDRESS_TYPE.SEGWIT_TAPROOT

  public api: OkxRunesAPI

  constructor (options: sdkOptions) {
    super()
    this.privateKey = options.privateKey
    this.addressType = options.addressType
    this.getPublicKeyAndAddressByPrivateKey()
    // openApi
    this.api = new OkxRunesAPI(options)

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
}
export { ADDRESS_TYPE, UTXO_SPEND_STATUS, ORDERS_SORT_RULES }

export * from './types/context'
