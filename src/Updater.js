import React from 'react'
import LiveTickerList from './LiveTicker/LiveTickerList'
import LiveTickerMessage from './LiveTicker/LiveTickerMessage'
import LiveTicker from './LiveTicker/LiveTicker'

export default class Updater extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      updateValue: 0,
      messageCount: 0
    }
  }

  componentDidMount = () => {
    if (window.KesiTools) {
      window.KesiTools.notifyAlive()
    }

    this.getClientDataStore()
    setTimeout(() => {
      this.getClientDataStore()
    }, 5000)
  }

  getClientDataStore = async () => {
    console.log('messages from client1')
    if (window.KesiTools) {
      console.log('messages from client2')
      const channelName = 'private:ergopro:liveticker:jat2024'
      const messages = window.KesiTools.getValue('private.livetickerMessages')
      console.log('messages from client3', messages)

      if (messages) {
        this.setState({messages: messages})
      }
    }
  }

  render = () => {
    return (
      <div className={'chatMobile'}>
        <LiveTicker messages={this.state.messages} ablyChannel={'private:ergopro:liveticker:jat2024'}/>
      </div>
    )
  }
}
