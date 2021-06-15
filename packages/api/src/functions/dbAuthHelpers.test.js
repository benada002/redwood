import CryptoJS from 'crypto-js'

import * as dbAuth from './dbAuthErrors'
import { getSession, decryptSession } from './dbAuthHelpers'

process.env.SESSION_SECRET = 'nREjs1HPS7cFia6tQHK70EWGtfhOgbqJQKsHQz3S'

const encrypt = (data) => {
  return CryptoJS.AES.encrypt(data, process.env.SESSION_SECRET).toString()
}

describe('_getSession()', () => {
  it('returns null if no text', () => {
    expect(getSession()).toEqual(null)
  })

  it('returns null if no session cookie', () => {
    expect(getSession('foo=bar')).toEqual(null)
  })

  it('returns the value of the session cookie', () => {
    expect(getSession('session=qwerty')).toEqual('qwerty')
  })

  it('returns the value of the session cookie when there are multiple cookies', () => {
    expect(getSession('foo=bar;session=qwerty')).toEqual('qwerty')
    expect(getSession('session=qwerty;foo=bar')).toEqual('qwerty')
  })

  it('returns the value of the session cookie when there are multiple cookies separated by spaces (iOS Safari)', () => {
    expect(getSession('foo=bar; session=qwerty')).toEqual('qwerty')
    expect(getSession('session=qwerty; foo=bar')).toEqual('qwerty')
  })
})

describe('decryptSession()', () => {
  it('returns an empty array if no session', () => {
    expect(decryptSession()).toEqual([])
  })

  it('returns an empty array if session is empty', () => {
    expect(decryptSession('')).toEqual([])
    expect(decryptSession(' ')).toEqual([])
  })

  it('throws an error if decryption errors out', () => {
    expect(() => decryptSession('session=qwerty')).toThrow(
      dbAuth.SessionDecryptionError
    )
  })

  it('returns an array with contents of encrypted cookie parts', () => {
    const first = { foo: 'bar' }
    const second = 'abcd'
    const text = encrypt(JSON.stringify(first) + ';' + second)

    expect(decryptSession(text)).toEqual([first, second])
  })
})
