/**
 * Created by falknisius on 30.05.17.
 *
 *
 *
 * subscribeChannel:
 *      channelName, StoreAction
 *      handle connection in background
 *      if receive call storeAction
 *
 * Queue Consumer
 *      connect:
 *          encapsulate Ably connect
 *          get instanceId
 *          call auth server with applicationInstanceId for Ably token
 *
 *      register for event come online
 */

import axios from 'axios'
// import RegisterInstance from '../RegisterInstance'

const MESSAGE_HISTORY_URL = 'rest/v1/tickerMessages'
const LEDGER_HOST = 'https://ergopro-ledger.equeo.de'

class MessageService {

  /**
   * initialize ably connection
   * initialize message handler registry
   */
  constructor() {
  }

  async getMessageHistory(channel, token) {
    try {
      const channelName = channel.split(':').pop()
      // const token = await RegisterInstance.getAccessToken('logAggregate:read')
      const response = await axios.get(`${LEDGER_HOST}/${MESSAGE_HISTORY_URL}/${channelName}`, {headers: {Authorization: 'Bearer ' + token}})

      if (response.status === 200) {
        const messages = []
        response.data.forEach(obj => {
          messages.push(obj.message)
        })

        messages.sort((element1, element2) => {
          if (element1.dateCreated > element2.dateCreated) {
            return 1
          }
          if (element1.dateCreated < element2.dateCreated) {
            return -1
          }
          return 0
        })

        return messages
      } else {
        return []
      }
    } catch (error) {
      throw error
    }
  }
}

let messageService = new MessageService()

export default messageService
