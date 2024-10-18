import { BtcWallet, psbtSign } from '@okxweb3/coin-bitcoin'

// Parameters for signing the PSBT
type WalletSignPsbtParams = {
  privateKey: string;
  psbt: string;
};

// Sign the PSBT using the wallet
export const walletSignPsbt = async ({ privateKey, psbt }: WalletSignPsbtParams): Promise<{ signedPsbtBase64: string }> => {
  const signParams = {
    psbtBase64: psbt,
    privateKey
  }
  // private key sign psbt
  const signedPsbt = await signPsbtByPrivateKey(signParams)

  return {
    signedPsbtBase64: signedPsbt
  }
}

// sign psbt by private key
export const signPsbtByPrivateKey = async ({ psbtBase64, privateKey }: { psbtBase64: string, privateKey: string }): Promise<string> => {
  const signedPsbt = psbtSign(psbtBase64, privateKey)
  return signedPsbt
}

// get publickey and address by private key
export const getPublicKeyAndAddress = async (params: { privateKey: string, addressType?: string }): Promise<{ address: string, publicKey: string, compressedPublicKey: string }> => {
  const btcWallet = new BtcWallet()
  const res = await btcWallet.getNewAddress(params)
  return res
}

// sign message by private key
export const signMessage = async ({ privateKey, message, address }: { privateKey: string, message: string, address: string }): Promise<string> => {
  const btcWallet = new BtcWallet()

  return await btcWallet.signMessage({
    privateKey,
    data: {
      address,
      message,
      type: 0
    }
  })
}

// btc change to sats
export const btcToSats = (value: number | string) => {
  if (!value) {
    return 0
  }
  const satsPerBtc = 100000000 // 1 BTC = 100,000,000 sats
  return Number(value) * satsPerBtc
}

// sats change to btc
export const satsToBtc = (value: number | string) => {
  if (!value) {
    return 0
  }
  const satsPerBtc = 100000000 // 1 BTC = 100,000,000 sats
  return Number(value) / satsPerBtc
}

// min utxo output value
export const MIN_UTXO_VALUE = 546
