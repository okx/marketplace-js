// openapi base url
export const OPEN_API_BASE_URL = 'https://www.okx.com/'

export default {
  CREATE_ACCOUNT: '/api/v5/waas/wallet/account/create-account',
  RUNES_ORDERS: '/api/v5/mktplace/nft/runes/get-runes-order-list',
  ORDERS_PSBT: '/api/v5/mktplace/nft/runes/bulk-psbt',
  ORDERS_BUY: '/api/v5/mktplace/nft/runes/bulk-purchase',
  UTXOS: '/api/v5/waas/wallet/utxo/utxos',
  GET_OWNED_ASSERTS: '/api/v5/mktplace/nft/runes/get-owned-asserts',
  CANCEL_TEXT: '/api/v5/mktplace/nft/runes/bulk-cancel-text',
  CANCEL_SUBMIT: '/api/v5/mktplace/nft/runes/bulk-cancel-submit'
}
