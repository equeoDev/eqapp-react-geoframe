import React from 'react'
import PropTypes from 'prop-types'
import StringHelper from '../Helper/StringHelper'

class LiveTickerList extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      showNewMessageInfo: false
    }

    this.divId = StringHelper.createShortId()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const div = document.getElementById(this.divId)

    if (div.scrollTop > 50 && prevProps.children && this.props.children && prevProps.children.length < this.props.children.length) {
      this.setState({showNewMessageInfo: true})
    }
  }

  scrollToTop = () => {
    const div = document.getElementById(this.divId)
    div.scrollTop = 0
  }


  render () {
    return (
      <div id={this.divId} className={'livetickerList'}>
        {this.props.children}
      </div>
    )
  }

}

LiveTickerList.propTypes = {
  children: PropTypes.node
}

export default LiveTickerList
