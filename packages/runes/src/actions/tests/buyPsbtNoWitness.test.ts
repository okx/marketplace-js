// buyerPsbt.test.ts
import { base64 } from '@scure/base'
import { getBuyerPsbt } from '../buyPsbt'
import { walletSignPsbt, btcToSats } from '../helper'
import { getPsbtPayment, getPsbtInput, getPsbtOutput, getBtcTransactionNetworkFee } from '@okxweb3/marketplace-onchain'

jest.mock('@scure/base', () => ({
  base64: {
    decode: jest.fn(),
    encode: jest.fn()
  }
}))

jest.mock('@scure/btc-signer', () => {
  class TransactionMock {
    inputs: object[]
    outputs: object[]

    static fromPSBT = jest.fn().mockImplementation(() => ({
      inputs: [
        {
          witnessUtxo: { amount: 100000 }
        },
        {
          amount: 100000
        }
      ],
      outputs: [
        {
          amount: 100000
        },
        {
          witnessUtxo: { amount: 100000 },
          amount: 100000
        }
      ]
    }))

    constructor () {
      this.inputs = []
      this.outputs = []
    }

    addInput = jest.fn()
    addOutput = jest.fn()
    addOutputAddress = jest.fn()
    toPSBT = jest.fn().mockReturnValue('mockedPsbtBytes')
  }

  return {
    Transaction: TransactionMock
  }
})

jest.mock('@okxweb3/marketplace-onchain', () => ({
  getPsbtPayment: jest.fn(),
  getPsbtInput: jest.fn(),
  getPsbtOutput: jest.fn(),
  getBtcTransactionNetworkFee: jest.fn()
}))

jest.mock('../helper', () => ({
  walletSignPsbt: jest.fn(),
  btcToSats: jest.fn(),
  MIN_UTXO_VALUE: 546
}))

describe('getBuyerPsbt', () => {
  const mockWalletAddress = 'mockWalletAddress'
  const mockPublicKey = 'mockPublicKey'
  const mockPrivateKey = 'mockPrivateKey'
  const mockOrderInfos = [
    {
      psbt: 'mockPsbt1',
      makerFee: '0.001',
      makerFeeAddress: 'makerAddress1',
      takerFee: '0.002',
      takerFeeAddress: 'takerAddress1'
    },
    {
      psbt: 'mockPsbt2',
      makerFee: '0.001',
      makerFeeAddress: 'makerAddress2',
      takerFee: '0.002',
      takerFeeAddress: 'takerAddress2'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw an error if there is insufficient balance', async () => {
    (base64.decode as jest.Mock).mockReturnValueOnce({
      inputs: [{ witnessUtxo: { amount: 100000 } }],
      outputs: [{ amount: 100000 }]
    });
    (getPsbtPayment as jest.Mock).mockResolvedValue({ address: mockWalletAddress });
    (getPsbtInput as jest.Mock).mockResolvedValue({ input: 'mockInput' });
    (getPsbtOutput as jest.Mock).mockResolvedValue({ output: 'mockOutput' });
    (getBtcTransactionNetworkFee as jest.Mock).mockResolvedValue({ networkFee: 1 });
    (walletSignPsbt as jest.Mock).mockResolvedValue({ signedPsbtBase64: 'signedPsbtBase64' });
    (btcToSats as jest.Mock).mockImplementation((value) => Number(value) * 100000000)

    await expect(getBuyerPsbt({
      walletAddress: mockWalletAddress,
      orderInfos: mockOrderInfos,
      publicKey: mockPublicKey,
      paymentUtxos: [{ txid: 'txid3', vout: 0, value: 1000 }],
      networkFeeRate: 1,
      privateKey: mockPrivateKey
    })).rejects.toThrow('Insufficient balance, please check utxo')
  })
})
