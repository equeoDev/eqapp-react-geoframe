import React from 'react'
import PropTypes from 'prop-types'

const CACHE = {}

class Video extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillUnmount () {
    // this.unloadB64()
  }

  getId () {
    return `${this.props.src}_video`
  }

  unloadB64 = () => {
    if (CACHE[this.props.poster]) {
      delete CACHE[this.props.poster]
    }
  }

  onContextMenu = (event) => {
    event.preventDefault()
    console.log('context menu!')
    return false
  }

  render () {
    const {videoId, poster, ...props} = this.props

    if (poster) {
      props['poster'] = CACHE[poster] || poster
      // ie shows poster only if no video is available, all other browsers show poster without any condition
    }

    console.log('video.js', this.props)

    return (
      <video
        id={this.props.videoId}
        {...props}
        crossOrigin={'anonymous'}
        onContextMenu={this.onContextMenu}
        playsInline={true}
      >
        {this.props.subtitles
          ? <track label="Untertitel" kind="subtitles" srcLang="de" src={this.props.subtitles} default={true}/>
          : null
        }
      </video>
    )
  }

}

Video.propTypes = {
  videoId: PropTypes.string,
  poster: PropTypes.string
}

export default Video
