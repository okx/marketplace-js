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
          witnessUtxo: { amount: 100000 },
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
  const mockPaymentUtxos = [
    { txid: 'txid1', vout: 0, value: 1000000 },
    { txid: 'txid2', vout: 1, value: 500000 }
  ]
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

  it('should generate a valid buyer PSBT', async () => {
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

    const result = await getBuyerPsbt({
      walletAddress: mockWalletAddress,
      orderInfos: mockOrderInfos,
      publicKey: mockPublicKey,
      paymentUtxos: mockPaymentUtxos,
      networkFeeRate: 1,
      privateKey: mockPrivateKey
    })

    expect(result).toEqual({ psbt: 'signedPsbtBase64', networkFee: 1 })
    expect(walletSignPsbt).toHaveBeenCalled()
    expect(getPsbtPayment).toHaveBeenCalledWith({ address: mockWalletAddress, publicKey: mockPublicKey })
    expect(getBtcTransactionNetworkFee).toHaveBeenCalled()
  })

  it('should throw an error if buyer payment is invalid', async () => {
    (getPsbtPayment as jest.Mock).mockResolvedValue(null)

    await expect(getBuyerPsbt({
      walletAddress: mockWalletAddress,
      orderInfos: mockOrderInfos,
      publicKey: mockPublicKey,
      paymentUtxos: mockPaymentUtxos,
      networkFeeRate: 1,
      privateKey: mockPrivateKey
    })).rejects.toThrow('Invalid buyer payment')
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

  it('should handle case where change is zero', async () => {
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

    const result = await getBuyerPsbt({
      walletAddress: mockWalletAddress,
      orderInfos: [
        {
          psbt: 'mockPsbt1',
          makerFee: '0.001',
          makerFeeAddress: 'makerAddress1',
          takerFee: '0.002',
          takerFeeAddress: 'takerAddress1'
        }
      ],
      publicKey: mockPublicKey,
      paymentUtxos: [
        { txid: 'txid1', vout: 0, value: 300547 }
      ],
      networkFeeRate: 1,
      privateKey: mockPrivateKey
    })

    expect(result).toEqual({ psbt: 'signedPsbtBase64', networkFee: 1 })
  })

  it('should handle case where taker fee is not provided', async () => {
    (base64.decode as jest.Mock).mockReturnValueOnce({
      inputs: [{ witnessUtxo: { amount: 100000 } }],
      outputs: [{ amount: 1000 }]
    });
    (getPsbtPayment as jest.Mock).mockResolvedValue({ address: mockWalletAddress });
    (getPsbtInput as jest.Mock).mockResolvedValue({ input: 'mockInput' });
    (getPsbtOutput as jest.Mock).mockResolvedValue({ output: 'mockOutput' });
    (getBtcTransactionNetworkFee as jest.Mock).mockResolvedValue({ networkFee: 1 });
    (walletSignPsbt as jest.Mock).mockResolvedValue({ signedPsbtBase64: 'signedPsbtBase64' });
    (btcToSats as jest.Mock).mockImplementation((value) => Number(value) * 100000000)

    const result = await getBuyerPsbt({
      walletAddress: mockWalletAddress,
      orderInfos: [
        {
          psbt: 'mockPsbt1',
          makerFee: '0.001',
          makerFeeAddress: 'makerAddress1',
          takerFee: '',
          takerFeeAddress: 'takerAddress1'
        }
      ],
      publicKey: mockPublicKey,
      paymentUtxos: mockPaymentUtxos,
      networkFeeRate: 1,
      privateKey: mockPrivateKey
    })

    expect(result).toEqual({ psbt: 'signedPsbtBase64', networkFee: 1 })
  })

  it('should handle case where maker fee is not provided', async () => {
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

    const result = await getBuyerPsbt({
      walletAddress: mockWalletAddress,
      orderInfos: [
        {
          psbt: 'mockPsbt1',
          makerFee: '',
          makerFeeAddress: 'makerAddress1',
          takerFee: '0.002',
          takerFeeAddress: 'takerAddress1'
        }
      ],
      publicKey: mockPublicKey,
      paymentUtxos: mockPaymentUtxos,
      networkFeeRate: 1,
      privateKey: mockPrivateKey
    })

    expect(result).toEqual({ psbt: 'signedPsbtBase64', networkFee: 1 })
  })
})
