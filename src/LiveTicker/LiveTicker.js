import React from 'react'
import PropTypes from 'prop-types'

import LiveTickerMessage from './LiveTickerMessage'
import LiveTickerList from './LiveTickerList'
import moment from 'moment'

const MESSAGE_STATES = {
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
  NOT_CHECKED: 'notChecked'
}

function removeDuplicatesFromHistory(history) {
  return history.filter(message => {
    const sameMessages = history.filter(m => m.id === message.id)
    // check if there are any newer messages
    // if yes, return false
    // if not return message
    if (sameMessages.length > 1 && sameMessages.some(m => m.dateEdited !== null) && message.dateEdited === null) {
      return false
    }
    if (sameMessages.length > 1 && sameMessages.some(m => (m.dateCreated && moment(m.dateCreated).isAfter(moment(message.dateCreated))))) {
      return false
    }
    if (sameMessages.length > 1 && sameMessages.some(m => (m.dateEdited && moment(m.dateEdited).isAfter(moment(message.dateEdited))))) {
      return false
    }
    return message
  })
}

function removeRejectedFromHistory(history) {
  return history.filter(message => message.state !== MESSAGE_STATES.REJECTED)
}

class LiveTicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      userId: null,
      userName: null,
      isExpert: false,
      presenceList: null,
      quotedMessage: null,
      chatActive: true,
      chatFinished: false,
      statusInitialized: false,
      ...this.state
    }

    this.channel = null  // will be initialized in connectToChatChannel
  }

  componentDidMount = () => {

  }

  render () {
    const channelId = this.props.ablyChannel

    let messages = []
    const messageObjects = this.props.messages

    if (!messageObjects) return null

    const keys = Object.keys(messageObjects)
    if (messageObjects && messageObjects[keys[0]]) {
      messages = removeDuplicatesFromHistory(messageObjects[keys[0]])
      messages = removeRejectedFromHistory(messages)
    }

    messages.sort((content1, content2) => {
      if (content1.dateCreated && content2.dateCreated) {
        if (content1.dateCreated < content2.dateCreated) {
          return 1
        }
        if (content1.dateCreated > content2.dateCreated) {
          return -1
        }
        return 0
      }
    })

    const messagesToRender = messages.map((message, index) => {
      if (index === 0) {
        console.log('last message to render', message)
      }

      return (
        <LiveTickerMessage
          key={message.id}
          id={message.id}
          userId={message.author}
          message={message.html}
          imageLink={message.imageLink}
          videoId={message.videoId}
          dateCreated={message.dateCreated}
          dateEdited={message.dateEdited}
          author={message.author}
          isLatest={index === messages.length - 1}
          isHidden={message.isHidden || false}
        />
      )
    })

    return (
      <LiveTickerList>
        {messagesToRender.length > 0 ? messagesToRender : 'Keine Nachrichten vorhanden'}
      </LiveTickerList>
    )
  }

}

LiveTicker.propTypes = {
  ablyChannel: PropTypes.string.isRequired,
  info: PropTypes.string,
  adminActive: PropTypes.bool,
  messages: PropTypes.array
}

export default LiveTicker
