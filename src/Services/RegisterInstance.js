
/**
 * Created by falknisius on 30.05.17.
 *
 * use persistent DataStore
 * use axios for call register and get access_token
 *
 * onInstall:
 *      call init()
 *      try to register app @ auth-server using private credentials for basic auth
 *
 * onActivate:
 *      if not applicationInstanceId call init()
 *
 * getApplicationInstanceId:
 *      if not applicationInstanceId call init()
 *      return applicationInstanceId
 */

import uuidV1 from 'uuid/v1'
import axios from 'axios'
import { timeout } from '../Helper/TimeoutHelper'
const AUTH_HOST = 'https://ergopro-auth.equeo.de'
const TOKEN_URL = AUTH_HOST + '/oauth/token'
const REGISTER_URL = AUTH_HOST + '/rest/api/v1/registerInstance/application'

const target = {
  authClient: 'ergopro_client',
  authClientSecret: 'dW^SHnb3DXxbXvRVTgjMyt*gXAxjWAUJ',
  authScopes: 'eCloud:read logAggregate:read logAggregate:write dataStore:write authUser:register authUser:createRequestCode structure:read push:send',
}

let AUTH = null
let INSTANCE_ID = null

class RegisterInstance {

  static async init () {
    while (RegisterInstance.isInitRunning) {
      await timeout(500)
    }
    RegisterInstance.isInitRunning = true

    try {
      let instanceId = uuidV1()
      console.log('register instance got from uuid', instanceId)
      await RegisterInstance._setInstanceIdToStore(instanceId)
      const authFromStore = await RegisterInstance._getAuthFromStore()
      if (!authFromStore) {
        // get Access Token
        if (target.authClient && target.authClientSecret) {
          setTimeout(function () { RegisterInstance.initAuth(instanceId, target.authScopes) }, 0)
        } else {
          await RegisterInstance._setAuthToStore(true)
        }
      }

      console.log('RegisterInstance.init() instanceId authScopes', instanceId, target.authScopes)

      RegisterInstance.isInitRunning = false
      return Promise.resolve()
    } catch (reason) {
      RegisterInstance.isInitRunning = false
      return Promise.reject(reason)
    }
  }

  static async initAuth (instanceId, scopes) {
    while (RegisterInstance.isAuthRunning) {
      await timeout(50)
      if (await RegisterInstance._getAuthFromStore()) {
        return Promise.resolve(true)
      }
    }
    RegisterInstance.isAuthRunning = true

    try {
      let appAuth = await RegisterInstance._getAuthFromStore()
      if (appAuth === true) {
        RegisterInstance.isAuthRunning = false
        return Promise.resolve(true)
      } else {
        // register
        if (!appAuth || !appAuth.clientId || !appAuth.clientSecret) {
          appAuth = await RegisterInstance._registerClient(instanceId)
        }
        // request or renew Token
        if (appAuth.expires_at && (typeof appAuth.expires_at) === 'string') {
          try {
            appAuth.expires_at = new Date(appAuth.expires_at)
            if (isNaN(appAuth.expires_at.getTime())) {
              delete appAuth.expires_at
            }
          } catch (error) {
            delete appAuth.expires_at
          }
        }
        await RegisterInstance._setAuthToStore(appAuth)
        RegisterInstance.isAuthRunning = false
        return Promise.resolve(true)
      }
    } catch (reason) {
      console.error(reason)
      RegisterInstance.isAuthRunning = false
      return Promise.reject(reason)
    }
  }

  static async _registerClient (instanceId) {
    try {
      const registerAuth = await oauth2Client.getTokenForClient(target.authClient, target.authClientSecret, 'register')
      const answer = await oauth2Client.getRegisterClient(registerAuth.access_token, instanceId)
      const result = { clientId: instanceId, clientSecret: answer.secret }
      if (answer.safetureAPI) result.safetureAPI = Object.assign({}, answer.safetureAPI)
      return Promise.resolve(result)
    } catch (error) {
      console.error('_registerClient error', error)
    }
  }

  static async _requestAccessForScopes (appAuth, scopes) {
    const authResult = await oauth2Client.getTokenForClient(appAuth.clientId, appAuth.clientSecret, scopes)
    const expiresAt = new Date(new Date().getTime() + 1000 * authResult.expires_in)
    return Promise.resolve(Object.assign({}, appAuth, { expires_at: expiresAt }, authResult))
  }

  static _authTokenValid (token, expiresAt, scopes, whishedScopes) {
    if (!token) return false
    // request or renew Token
    if (expiresAt && (typeof expiresAt) === 'string') {
      expiresAt = new Date(expiresAt)
      if (isNaN(expiresAt.getTime())) {
        return false
      }
    }
    if (expiresAt.getTime() < new Date().getTime()) return false
    if (!scopes) return false
    const scopeList = scopes.split(' ')
    if (!whishedScopes) return false
    const whisedScopeList = whishedScopes.split(' ')
    let scopeMissed = false
    whisedScopeList.forEach(function (scope) {
      if (!(scopeList.indexOf(scope) >= 0)) {
        scopeMissed = true
      }
    })
    return !scopeMissed
  }

  static async _getAuthFromStore () {
    return Promise.resolve(AUTH)
  }

  static async _setAuthToStore (auth) {
    console.log('register instance 9b setAuthToStore')
    AUTH = auth
    console.log('register instance 9b setAuthToStore done')
    return Promise.resolve(true)
  }

  static async _getInstanceIdFromStore () {
    return INSTANCE_ID
  }

  static async _setInstanceIdToStore (instanceId) {
    INSTANCE_ID = instanceId
    return Promise.resolve(true)
  }

  static _mixScopes (actualScopes, whishedScopes) {
    const result = target.authScopes.split(' ')
    if (actualScopes) {
      actualScopes.split(' ').forEach(function (scope) {
        if (!(result.indexOf(scope) >= 0)) result.push(scope)
      })
    }
    if (whishedScopes) {
      whishedScopes.split(' ').forEach(function (scope) {
        if (!(result.indexOf(scope) >= 0)) result.push(scope)
      })
    }
    return result.join(' ')
  }

  static async getAccessToken (scopes) {
    // Wait when we already get a token since it will cause 500 errors when two calls get to the server in the same time
    for (let i = 0; i < 25; i++) { // 12.5 seconds; http timeout 10 seconds
      if (!RegisterInstance.gettingAccessToken) {
        break
      }
      await timeout(500)
    }
    if (RegisterInstance.gettingAccessToken) {
      throw Error('Cannot get access token')
    }

    RegisterInstance.gettingAccessToken = true

    let appAuth = await RegisterInstance._getAuthFromStore()
    if (!appAuth) {
      const instanceId = await RegisterInstance.getApplicationInstanceId()
      await RegisterInstance.initAuth(instanceId, RegisterInstance._mixScopes(target.authScopes, scopes))
      appAuth = await RegisterInstance._getAuthFromStore()
    }
    // console.log('RegisterInstance.getAccessToken appAuth', appAuth)
    if (appAuth !== true) {
      if (RegisterInstance._authTokenValid(appAuth.access_token, appAuth.expires_at, appAuth.scope, scopes)) {
        console.log('auth token valid')
        RegisterInstance.gettingAccessToken = false
        return Promise.resolve(appAuth.access_token)
      }
      // renew if not scopes included
      appAuth = await RegisterInstance._requestAccessForScopes(appAuth, RegisterInstance._mixScopes(appAuth.scope, scopes))
      await RegisterInstance._setAuthToStore(appAuth)
      console.log('RegisterInstance.getAccessToken appAuth after renew', appAuth)
      RegisterInstance.gettingAccessToken = false
      return RegisterInstance.getAccessToken(scopes)
    } else {
      RegisterInstance.gettingAccessToken = false
      return Promise.resolve(null)
    }
  }

  static async getApplicationInstanceId () {
    let applicationInstanceId = await RegisterInstance._getInstanceIdFromStore()
    if (!applicationInstanceId) {
      await RegisterInstance.init()
      applicationInstanceId = await RegisterInstance._getInstanceIdFromStore()
    }
    return Promise.resolve(applicationInstanceId || null)
  }
}

RegisterInstance.isInitRunning = false
RegisterInstance.isAuthRunning = false
RegisterInstance.gettingAccessToken = false
RegisterInstance.isRevalidationRunning = false

class oauth2Client {

  static async getTokenForClient (clientId, clientSecret, scopes) {
    return new Promise((resolve, reject) => {
      const onOnline = async () => {
        const userPwd = clientId + ':' + clientSecret

        const config = {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: 'Basic ' + window.btoa(userPwd)
          },
          timeout: 10000
        }

        const data = new window.FormData()
        if (scopes) data.append('scope', scopes)
        data.append('grant_type', 'client_credentials')

        try {
          const result = await axios.post(TOKEN_URL, data, config)
          if (result.status === 200) {
            resolve(result.data)
          }
          else {
            console.error('thats my error!', result)
            reject(new Error('Wrong request for Token: ' + result.status))
          }
        }
        catch (reason) {
          console.error('Error requesting auth token. Have you called from file://? Then try starting a local server instead and load files from there.\n\tWith python: python -m SimpleHTTPServer 8080\n\tWith webstorm: open the index.html and choose open with Chrome or other browser.\n Error:', reason)
          reject(new Error('Wrong request for Token: ' + reason.toString()))
        }
      }
      console.log('online at start')
      onOnline()
    })
  }

  static async getRegisterClient (accessToken, applicationInstanceId) {
    const config = {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      // timeout: 5000
    }
    const data = new window.FormData()
    try {
      const result = await axios.post(REGISTER_URL + '/' + applicationInstanceId, data, config)
      if (result.status === 201 || result.status === 200) {
        const answer = { secret: result.data.secret }
        if (result.data['savetureAPI']) answer.safetureAPI = Object.assign({}, result.data['savetureAPI'])
        return Promise.resolve(answer)
      } else {
        console.error(result)
        return Promise.reject(new Error('Wrong application registration ' + result.status + ' ' + JSON.stringify(result.data)))
      }
    } catch (reason) {
      return Promise.reject(new Error('Wrong application registration ' + reason.toString()))
    }
  }

}

export default RegisterInstance
