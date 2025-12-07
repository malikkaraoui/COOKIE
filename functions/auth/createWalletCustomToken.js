const { onCall, HttpsError } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp()
}

const serviceAccountEmail = process.env.FUNCTIONS_IDENTITY || `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`

exports.createWalletCustomToken = onCall(
  {
    region: 'us-central1',
    serviceAccount: serviceAccountEmail,
  },
  async (request) => {
    logger.info('[createWalletCustomToken] raw payload', request?.data ?? null)

    const walletAddress = typeof request?.data?.walletAddress === 'string'
      ? request.data.walletAddress.trim()
      : ''

    if (!walletAddress) {
      throw new HttpsError('invalid-argument', 'walletAddress is required')
    }

    const uid = `wallet:${walletAddress.toLowerCase()}`

    try {
      const token = await admin.auth().createCustomToken(uid)
      logger.info('[createWalletCustomToken] token created', { uid })
      return { token, uid }
    } catch (error) {
      logger.error('[createWalletCustomToken] error', error)
      throw new HttpsError('internal', 'Unable to create custom token')
    }
  }
)
