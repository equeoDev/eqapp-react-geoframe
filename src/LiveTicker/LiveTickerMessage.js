import React from 'react'
import PropTypes from 'prop-types'
import {Card, CircularProgress} from '@material-ui/core'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import moment from 'moment'
import {getVideoUrl} from "../Helper/VideoHelper";
import Video from "../Video/Video";
import UrlHelper from "../Helper/UrlHelper";

class LiveTickerMessage extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      quotedMessage: null,
      optimalVideoSrc: null,
      videoError: null,
      posterImage: null
    }
  }

  componentDidMount() {
    if (this.props.videoId) {
      this.getVideoSrc()
    }
  }

  _correctProtocol (url) {
    const protocol = window.location.protocol.toLowerCase()
    if (protocol === 'file:' || protocol === 'https:' || protocol === 'http:') {
      const parts = UrlHelper.parseURL(url)
      const protocolToUse = protocol === 'file:' ? 'https:' : protocol
      const host = (protocol === 'https:' && parts.host.match(/:80$/))
        ? parts.host.substring(0, parts.host.length - 3)
        : ((protocol === 'http:' && parts.host.match(/:443$/))
          ? parts.host.substring(0, parts.host.length - 4)
          : parts.host)
      return protocolToUse + '//' + host + (parts.pathname.substring(0, 1) !== '/' ? '/' : '') + parts.pathname + parts.search + parts.hash
    }
    return url
  }

  getVideoSrc = async () => {
    this.setState({videoError: null})
    try {
      const videoData = await getVideoUrl(this.props.videoId)
      const finalUrl = this._correctProtocol(videoData.src)

      console.log('finalUrl', finalUrl, videoData.src)

      this.setState({optimalVideoSrc: finalUrl, posterImage: videoData.poster})
    }
    catch (error) {
      this.setState({videoError: error.message})
    }
  }

  render () {
    const message = this.props.message
    return (
      <Card className={'outer'} key={`entry_${message.id}`} id={message.id} style={this.props.isHidden ? {padding: 0, margin: 0, maxHeight: 0} : {padding: '7px', margin: '10px 0', maxHeight: '9999px'}}>
        <CardContent style={{textAlign: 'left', float: 'left', width: '18%', display: 'inline-block', verticalAlign: 'top', padding: 0}}>
          <Typography
            className={'authorMobile'}
            color='textSecondary'
            gutterBottom
          >
            {this.props.author}
          </Typography>
          <Typography
            className={'dateMobile'}
            color='textSecondary'
            gutterBottom
          >
            {moment(this.props.dateCreated).format('DD.MM.YYYY HH:mm')}
          </Typography>
        </CardContent>
        <CardContent style={{float:'right', width: '78%', display: 'inline-block', padding: 0, paddingLeft: 10, verticalAlign: 'top'}}>
          {this.props.videoId && this.state.optimalVideoSrc
            ? <Video
              videoId={this.props.videoId}
              poster={this.state.posterImage}
              playsInline={true}
              style={{width: '100%', height: 'auto', display: 'block', position: 'relative', paddingBottom: '8px'}}
              controls
              src={this.state.optimalVideoSrc} />
            : null
          }
          {this.props.videoId && !this.state.optimalVideoSrc && !this.state.videoError ? <><CircularProgress /><div style={{paddingLeft: '10px'}}>Video wird geladen</div></> : null}
          {this.props.videoId && this.state.videoError ? <><div style={{color: 'red'}}>{`Video konnte nicht geladen werden - Fehler: ${this.state.videoError}`}</div><div onClick={this.getVideoSrc}>Erneut versuchen</div></> : null}
          {this.props.imageLink ? <img style={{width: '100%', height: 'auto', display: 'block', position: 'relative', paddingBottom: '8px'}} src={this.props.imageLink} /> : null}
          <Typography
            className={'messageMobile'}
            color='textSecondary'
            gutterBottom
            dangerouslySetInnerHTML={{__html: message}}
          />
        </CardContent>
      </Card>
    )
  }

}

LiveTickerMessage.propTypes = {
  id: PropTypes.string,
  userId: PropTypes.string,
  key: PropTypes.string,
  message: PropTypes.string,
  dateCreated: PropTypes.string,
  dateEdited: PropTypes.string,
  isLatest: PropTypes.bool,
  author: PropTypes.string,
  imageLink: PropTypes.string,
  videoId: PropTypes.string,
  isHidden: PropTypes.bool
}

LiveTickerMessage.defaultProps = {
  isLatest: false,
  isExpert: false
}

export default LiveTickerMessage
