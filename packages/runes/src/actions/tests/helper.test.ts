// walletUtils.test.ts
import { walletSignPsbt, signPsbtByPrivateKey, getPublicKeyAndAddress, signMessage, btcToSats, MIN_UTXO_VALUE } from '../helper' // 根据实际路径调整
import { psbtSign, BtcWallet } from '@okxweb3/coin-bitcoin'

jest.mock('@okxweb3/coin-bitcoin', () => ({
  psbtSign: jest.fn(),
  BtcWallet: jest.fn()
}))

describe('Wallet Utility Functions', () => {
  const mockPrivateKey = 'mockPrivateKey'
  const mockPsbt = 'mockPsbtBase64'
  const mockAddress = 'mockAddress'
  const mockMessage = 'Hello, Bitcoin!'
  const mockPublicKey = 'mockPublicKey'
  const mockCompressedPublicKey = 'mockCompressedPublicKey'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should sign the PSBT using the wallet', async () => {
    (psbtSign as jest.Mock).mockReturnValue('signedPsbtBase64')

    const result = await walletSignPsbt({ privateKey: mockPrivateKey, psbt: mockPsbt })

    expect(result).toEqual({ signedPsbtBase64: 'signedPsbtBase64' })
    expect(psbtSign).toHaveBeenCalledWith(mockPsbt, mockPrivateKey)
  })

  it('should sign PSBT by private key', async () => {
    (psbtSign as jest.Mock).mockReturnValue('signedPsbtBase64')

    const signedPsbt = await signPsbtByPrivateKey({ psbtBase64: mockPsbt, privateKey: mockPrivateKey })

    expect(signedPsbt).toBe('signedPsbtBase64')
    expect(psbtSign).toHaveBeenCalledWith(mockPsbt, mockPrivateKey)
  })

  it('should get public key and address by private key', async () => {
    const mockGetNewAddress = jest.fn().mockResolvedValue({
      address: mockAddress,
      publicKey: mockPublicKey,
      compressedPublicKey: mockCompressedPublicKey
    });

    // Mock the BtcWallet instance
    (BtcWallet as unknown as jest.Mock).mockImplementation(() => ({
      getNewAddress: mockGetNewAddress
    }))

    const result = await getPublicKeyAndAddress({ privateKey: mockPrivateKey })

    expect(result).toEqual({
      address: mockAddress,
      publicKey: mockPublicKey,
      compressedPublicKey: mockCompressedPublicKey
    })
    expect(mockGetNewAddress).toHaveBeenCalledWith({ privateKey: mockPrivateKey })
  })

  it('should sign a message by private key', async () => {
    const mockSignMessage = jest.fn().mockResolvedValue('signedMessage');

    // Mock the BtcWallet instance
    (BtcWallet as unknown as jest.Mock).mockImplementation(() => ({
      signMessage: mockSignMessage
    }))

    const result = await signMessage({ privateKey: mockPrivateKey, message: mockMessage, address: mockAddress })

    expect(result).toBe('signedMessage')
    expect(mockSignMessage).toHaveBeenCalledWith({
      privateKey: mockPrivateKey,
      data: {
        address: mockAddress,
        message: mockMessage,
        type: 0
      }
    })
  })

  it('should convert BTC to sats', () => {
    expect(btcToSats(1)).toBe(100000000)
    expect(btcToSats('0.5')).toBe(50000000)
    expect(btcToSats(0)).toBe(0)
  })

  it('should return the minimum UTXO value', () => {
    expect(MIN_UTXO_VALUE).toBe(546)
  })
})
