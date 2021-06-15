// @ts-ignore What the hell is a declaration file?
import { decryptSession, getSession } from '../../functions/dbAuthHelpers'

export const dbAuth = (authHeaderValue: string, req: { event: any }) => {
  const encrypted = getSession(req.event.headers['cookie'])

  if (!encrypted) {
    return null
  }

  const authHeaderUserId = authHeaderValue
  const [session, _csrfToken] = decryptSession(encrypted)

  if (session.id.toString() !== authHeaderUserId) {
    throw new Error(
      'Error comparing Authorization header value to decrypted user'
    )
  }

  return session
}