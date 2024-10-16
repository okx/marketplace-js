import crypto from 'crypto'
import { Service } from '@okxweb3/marketplace-library'
import URL, { OPEN_API_BASE_URL } from './url'
import {
  ADDRESS_TYPE,
  UTXO_SPEND_STATUS,
  ORDERS_SORT_RULES,
  RUNES_LISTING_STATUS
} from '../constants'
import { getPublicKeyAndAddress, signMessage } from '../actions'
import { orderInfoOption } from '../actions/buyPsbt'

interface apiOptions {
  privateKey: string;
  apikey: string;
  secretKey: string;
  passphrase: string;
  projectId: string;
  addressType: ADDRESS_TYPE;
  requestBaseUrl?: string;
}

interface getSellersPsbtOptions {
  orderInfos: orderInfoOption[];
}

interface IPrice {
  currency: string;
  currencyUrl: string;
  price: string;
  satPrice: string;
  usdPrice: string;
}

interface IRunesAssets {
  amount: string;
  assetId: string;
  chain: number;
  inscriptionNum: string;
  listTime: number;
  name: string;
  orderId: number;
  ownerAddress: string;
  status: RUNES_LISTING_STATUS;
  symbol: string;
  ticker: string;
  tickerIcon: string;
  tickerId: string;
  tickerType: number;
  totalPrice: IPrice;
  txHash: string;
  unitPrice: IPrice;
  utxoTxHash: string;
  utxoValue: string;
  utxoVout: number;
}

export class OkxRunesAPI {
  // The api Key obtained from the previous application
  private apikey: string = ''
  // The key obtained from the previous application
  private secretKey: string = ''
  // The password created when applying for the key
  private passphrase: string = ''
  // wallet private key
  private privateKey: string = ''
  // The projectId created when applying project

  private projectId: string = ''
  // address type
  public addressType: ADDRESS_TYPE = ADDRESS_TYPE.SEGWIT_TAPROOT

  public apiClient: Service

  constructor ({
    apikey,
    secretKey,
    passphrase,
    addressType,
    privateKey,
    projectId,
    requestBaseUrl
  }: apiOptions) {
    this.apikey = apikey
    this.secretKey = secretKey
    this.passphrase = passphrase
    this.addressType = addressType
    this.privateKey = privateKey
    this.projectId = projectId

    this.apiClient = new Service(requestBaseUrl || OPEN_API_BASE_URL)
  }

  // params to string
  private getRequestParamsStr (method: string, params: Record<string, unknown>) {
    if (!params) return ''
    if (method === 'GET') {
      const str = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&')
      return '?' + str
    }
    return JSON.stringify(params)
  }

  private getRequestApiHeader (
    url: string,
    method: string,
    params: Record<string, unknown>
  ) {
    // Get the current time
    const date = new Date()
    const timestamp = date.toISOString()
    const originalMessage = this.getRequestParamsStr(method, params)
    const hmac = crypto.createHmac('sha256', this.secretKey)
    hmac.update(timestamp + method + url + originalMessage)
    const accessSign = hmac.digest('base64')

    return {
      headers: {
        'OK-ACCESS-KEY': this.apikey,
        'OK-ACCESS-SIGN': accessSign,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'OK-ACCESS-PROJECT': this.projectId,
        'Ok-Sdk-Source': 'marketplace-runes-sdk'
      }
    }
  }

  // subscribe okx wallet
  private async subscribeWallet (): Promise<Record<string, unknown>> {
    // get publickey and address by private key
    const { address, publicKey } = await getPublicKeyAndAddress({
      privateKey: this.privateKey,
      addressType: this.addressType
    })

    const signature = await signMessage({
      privateKey: this.privateKey,
      message: new Date().getTime().toString(),
      address
    })

    const params = {
      signMessage: Date.now(),
      addresses: [
        {
          chainIndex: 0,
          address,
          publicKey,
          signature
        }
      ]
    }
    const requestHeader = this.getRequestApiHeader(
      URL.CREATE_ACCOUNT,
      'POST',
      params
    )
    const data = (await this.apiClient.post(
      URL.CREATE_ACCOUNT,
      params,
      requestHeader
    )) as Record<string, unknown>
    return data
  }

  // get utxos
  private async getUtxos (
    spendStatus: UTXO_SPEND_STATUS
  ): Promise<Record<string, unknown>> {
    // get publickey and address by private key
    const { address } = await getPublicKeyAndAddress({
      privateKey: this.privateKey,
      addressType: this.addressType
    })
    const params = {
      chainIndex: 0,
      address,
      spendStatus: spendStatus || UTXO_SPEND_STATUS.UNSPEND
    }
    const requestHeader = this.getRequestApiHeader(URL.UTXOS, 'GET', params)
    const data = (await this.apiClient.get(
      URL.UTXOS,
      params,
      requestHeader
    )) as Record<string, unknown>
    return data
  }

  // send transations
  public async sendTransations (options: {
    fromAddress: string;
    orderIds: number[];
    buyerPSBT: string;
  }): Promise<{ txHash: string }> {
    const requestHeader = this.getRequestApiHeader(
      URL.ORDERS_BUY,
      'POST',
      options
    )
    const data = (await this.apiClient.post(
      URL.ORDERS_BUY,
      options,
      requestHeader
    )) as { txHash: string }
    return data
  }

  // get sellers psbt
  public async getSellersPsbt (
    options: number[]
  ): Promise<getSellersPsbtOptions> {
    const params = {
      orderIds: options.join()
    }
    const requestHeader = this.getRequestApiHeader(
      URL.ORDERS_PSBT,
      'GET',
      params
    )
    const data = (await this.apiClient.get(
      URL.ORDERS_PSBT,
      params,
      requestHeader
    )) as getSellersPsbtOptions
    return data
  }

  // get marketplace runes order
  public async getOrders (params: {
    runesId: string;
    cursor?: string;
    limit?: string;
    sortBy?: ORDERS_SORT_RULES;
  }): Promise<{ cursor: string; items: { orderId: number }[] }> {
    const requestHeader = this.getRequestApiHeader(
      URL.RUNES_ORDERS,
      'GET',
      params
    )
    const data = (await this.apiClient.get(
      URL.RUNES_ORDERS,
      params,
      requestHeader
    )) as { cursor: string; items: { orderId: number }[] }
    return data
  }

  // get transaction history
  public async getTransactionHistory (params: {
    runesIds?: string;
    cursor?: string;
    limit?: string;
  }): Promise<{ cursor: string; items: { orderId: number }[] }> {
    const requestHeader = this.getRequestApiHeader(
      URL.TRADE_HISTORY,
      'GET',
      params
    )
    const data = (await this.apiClient.get(
      URL.TRADE_HISTORY,
      params,
      requestHeader
    )) as { cursor: string; items: { orderId: number }[] }
    return data
  }

  // get marketplace runes assets
  public async getOwnedAssets (params: {
    runesId: string;
    cursor?: string;
    limit?: string;
  }): Promise<{ cursor: string; items: IRunesAssets[] }> {
    const { address } = await getPublicKeyAndAddress({
      privateKey: this.privateKey,
      addressType: this.addressType
    })
    const requestParams = {
      ...params,
      walletAddresses: address
    }
    const requestHeader = this.getRequestApiHeader(
      URL.GET_OWNED_ASSETS,
      'GET',
      requestParams
    )
    const data = (await this.apiClient.get(
      URL.GET_OWNED_ASSETS,
      requestParams,
      requestHeader
    )) as { cursor: string; items: IRunesAssets[] }
    return data
  }

  // get marketplace runes cancel sell signMessage text
  public async getCancelSellText (params: {
    orderIds: string;
  }): Promise<{ id: string; text: string }> {
    const { address, publicKey } = await getPublicKeyAndAddress({
      privateKey: this.privateKey,
      addressType: this.addressType
    })
    const requestParams = {
      ...params,
      walletPubkey: publicKey,
      walletAddress: address
    }
    const requestHeader = this.getRequestApiHeader(
      URL.CANCEL_TEXT,
      'GET',
      requestParams
    )
    const data = (await this.apiClient.get(
      URL.CANCEL_TEXT,
      requestParams,
      requestHeader
    )) as { id: string; text: string }
    return data
  }

  // get marketplace runes cancel sell signMessage text
  public async cancelSellSubmit (params: {
    id: string;
    signature: string;
    signAlgorithm: number;
  }): Promise<{}> {
    const requestHeader = this.getRequestApiHeader(
      URL.CANCEL_SUBMIT,
      'POST',
      params
    )
    const data = (await this.apiClient.post(
      URL.CANCEL_SUBMIT,
      params,
      requestHeader
    )) as {}
    return data
  }

  // sell runes
  public async sellRunes (options: {
    runesId: string;
    walletAddress: string;
    items: {
      utxo: string;
      unitPrice: number;
      totalPrice: number;
      psbt: string;
      makerFee?: number;
    }[];
  }): Promise<{ orderId: string }> {
    const requestHeader = this.getRequestApiHeader(
      URL.SELL_RUNES,
      'POST',
      options
    )
    const data = (await this.apiClient.post(
      URL.SELL_RUNES,
      options,
      requestHeader
    )) as { orderId: string }
    return data
  }
}
