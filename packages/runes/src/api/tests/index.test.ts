// OkxRunesAPI.test.ts
import crypto from 'crypto'
import { OkxRunesAPI } from '../index'
import URL from '../url'
import { getPublicKeyAndAddress, signMessage } from '../../actions'
import { ADDRESS_TYPE, UTXO_SPEND_STATUS, ORDERS_SORT_RULES } from '../../constants'

// Mock dependencies
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn(),
    digest: jest.fn().mockReturnValue('mockedAccessSign')
  })
}))

jest.mock('@okxweb3/marketplace-library', () => ({
  Service: jest.fn().mockImplementation(() => ({
    post: jest.fn(),
    get: jest.fn()
  }))
}))

jest.mock('../../actions', () => ({
  getPublicKeyAndAddress: jest.fn(),
  signMessage: jest.fn()
}))

describe('OkxRunesAPI', () => {
  let api: OkxRunesAPI

  const mockApiKey = 'mockApiKey'
  const mockSecretKey = 'mockSecretKey'
  const mockPassphrase = 'mockPassphrase'
  const mockPrivateKey = 'mockPrivateKey'
  const mockProjectId = 'mockProjectId'
  const mockAddressType = ADDRESS_TYPE.SEGWIT_TAPROOT

  beforeEach(() => {
    api = new OkxRunesAPI({
      apikey: mockApiKey,
      secretKey: mockSecretKey,
      passphrase: mockPassphrase,
      addressType: mockAddressType,
      privateKey: mockPrivateKey,
      projectId: mockProjectId
    })

    jest.clearAllMocks()
  })

  it('should initialize with correct parameters', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(api.apikey).toBe(mockApiKey)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(api.secretKey).toBe(mockSecretKey)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(api.passphrase).toBe(mockPassphrase)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(api.privateKey).toBe(mockPrivateKey)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(api.projectId).toBe(mockProjectId)
    expect(api.addressType).toBe(mockAddressType)
  })

  describe('getRequestParamsStr', () => {
    it('should return an empty string for no params', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(api.getRequestParamsStr('GET', {})).toBe('?')
    })

    it('should return query string for GET method', () => {
      const params = { key1: 'value1', key2: 'value2' }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      api.getRequestParamsStr('GET', params)
    })

    it('should return JSON string for non-GET method', () => {
      const params = { key1: 'value1', key2: 'value2' }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(api.getRequestParamsStr('POST', params)).toBe(JSON.stringify(params))
    })
  })

  describe('getRequestApiHeader', () => {
    it('should return correct headers', () => {
      const url = 'mockUrl'
      const method = 'POST'
      const params = { key: 'value' }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const headers = api.getRequestApiHeader(url, method, params)

      expect(headers).toEqual({
        headers: {
          'OK-ACCESS-KEY': mockApiKey,
          'OK-ACCESS-SIGN': 'mockedAccessSign',
          'OK-ACCESS-TIMESTAMP': expect.any(String),
          'OK-ACCESS-PASSPHRASE': mockPassphrase,
          'OK-ACCESS-PROJECT': mockProjectId
        }
      })

      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', mockSecretKey)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(crypto.createHmac().update).toHaveBeenCalled()
    })

    it('should return correct headers', () => {
      const url = 'mockUrl'
      const method = 'POST'
      const params = undefined
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      api.getRequestApiHeader(url, method, params)
    })
  })

  describe('subscribeWallet', () => {
    it('should subscribe to wallet and return data', async () => {
      (getPublicKeyAndAddress as jest.Mock).mockResolvedValue({
        address: 'mockAddress',
        publicKey: 'mockPublicKey'
      });
      (signMessage as jest.Mock).mockResolvedValue('mockSignature');
      (api.apiClient.post as jest.Mock).mockResolvedValue({ success: true })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const data = await api.subscribeWallet()

      expect(data).toEqual({ success: true })
      expect(getPublicKeyAndAddress).toHaveBeenCalledWith({
        privateKey: mockPrivateKey,
        addressType: mockAddressType
      })
      expect(signMessage).toHaveBeenCalledWith({
        privateKey: mockPrivateKey,
        message: expect.any(String),
        address: 'mockAddress'
      })
      expect(api.apiClient.post).toHaveBeenCalledWith(URL.CREATE_ACCOUNT, expect.any(Object), expect.any(Object))
    })
  })

  describe('getUtxos', () => {
    it('should get UTXOs and return data', async () => {
      (getPublicKeyAndAddress as jest.Mock).mockResolvedValue({
        address: 'mockAddress'
      });
      (api.apiClient.get as jest.Mock).mockResolvedValue({ utxos: [] })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      const data = await api.getUtxos(UTXO_SPEND_STATUS.UNSPEND)

      expect(data).toEqual({ utxos: [] })
      expect(getPublicKeyAndAddress).toHaveBeenCalledWith({
        privateKey: mockPrivateKey,
        addressType: mockAddressType
      })
      expect(api.apiClient.get).toHaveBeenCalledWith(URL.UTXOS, expect.any(Object), expect.any(Object))
    })

    it('should get UTXOs and return data', async () => {
      (getPublicKeyAndAddress as jest.Mock).mockResolvedValue({
        address: 'mockAddress'
      });
      (api.apiClient.get as jest.Mock).mockResolvedValue({ utxos: [] })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const data = await api.getUtxos()

      expect(data).toEqual({ utxos: [] })
      expect(getPublicKeyAndAddress).toHaveBeenCalledWith({
        privateKey: mockPrivateKey,
        addressType: mockAddressType
      })
      expect(api.apiClient.get).toHaveBeenCalledWith(URL.UTXOS, expect.any(Object), expect.any(Object))
    })
  })

  describe('sendTransations', () => {
    it('should send transactions and return txHash', async () => {
      const options = {
        fromAddress: 'mockFromAddress',
        orderIds: [1, 2],
        buyerPSBT: 'mockBuyerPsbt'
      };
      (api.apiClient.post as jest.Mock).mockResolvedValue({ txHash: 'mockTxHash' })

      const result = await api.sendTransations(options)

      expect(result).toEqual({ txHash: 'mockTxHash' })
      expect(api.apiClient.post).toHaveBeenCalledWith(URL.ORDERS_BUY, options, expect.any(Object))
    })
  })

  describe('getSellersPsbt', () => {
    it('should get sellers PSBT and return data', async () => {
      const orderIds = [1, 2];
      (api.apiClient.get as jest.Mock).mockResolvedValue({ orderInfos: [] })

      const result = await api.getSellersPsbt(orderIds)

      expect(result).toEqual({ orderInfos: [] })
      expect(api.apiClient.get).toHaveBeenCalledWith(URL.ORDERS_PSBT, expect.any(Object), expect.any(Object))
    })
  })

  describe('getOrders', () => {
    it('should get orders and return data', async () => {
      const params = { runesId: 'mockRunesId', cursor: 'mockCursor', limit: '10', sortBy: ORDERS_SORT_RULES.LISTED_TIME_ASC };
      (api.apiClient.get as jest.Mock).mockResolvedValue({ cursor: 'nextCursor', items: [{ orderId: 1 }] })

      const result = await api.getOrders(params)

      expect(result).toEqual({ cursor: 'nextCursor', items: [{ orderId: 1 }] })
      expect(api.apiClient.get).toHaveBeenCalledWith(URL.RUNES_ORDERS, params, expect.any(Object))
    })
  })

  describe('getOwnedAssets', () => {
    it('should get runes owned assets and return data', async () => {
      const params = { runesId: 'mockRunesId', cursor: 'mockCursor', limit: '10' };
      (api.apiClient.get as jest.Mock).mockResolvedValue({
        cursor: 'nextCursor',
        items: [
          {
            amount: '500000',
            name: 'DOG•GO•TO•THE•MOON',
            orderId: 201296,
            status: 1,
            ticker: 'DOG•GO•TO•THE•MOON'
          }
        ]
      })

      const result = await api.getOwnedAssets(params)

      expect(result).toEqual({
        cursor: 'nextCursor',
        items: [{
          amount: '500000',
          name: 'DOG•GO•TO•THE•MOON',
          orderId: 201296,
          status: 1,
          ticker: 'DOG•GO•TO•THE•MOON'
        }]
      })
    })
  })

  describe('getCancelSellText', () => {
    it('should get cancel sell text and return data', async () => {
      const params = { orderIds: 'mockOrderIds' };
      (api.apiClient.get as jest.Mock).mockResolvedValue({
        id: '0e581de5f0764529a0e5cd0e69e3f762',
        text: 'Confirm to cancel the following 1 order(s)',
        walletAddress: 'walletAddress'
      })

      const result = await api.getCancelSellText(params)

      expect(result).toEqual({
        id: '0e581de5f0764529a0e5cd0e69e3f762',
        text: 'Confirm to cancel the following 1 order(s)',
        walletAddress: 'walletAddress'
      })
    })
  })

  describe('cancelSellSubmit', () => {
    it('should cancel sell submit and return data', async () => {
      const params = { id: 'mockId', signature: 'mockSignature', signAlgorithm: 1 };
      (api.apiClient.post as jest.Mock).mockResolvedValue({})

      const result = await api.cancelSellSubmit(params)

      expect(result).toEqual({})
    })
  })
})
