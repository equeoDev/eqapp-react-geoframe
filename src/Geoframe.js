import React from 'react'

export default class Geoframe extends React.Component {

  constructor (props) {
    super(props)

    this.state = {}
  }

  componentDidMount = () => {
    window.addEventListener('message', this.onReceiveMessage)
  }

  cloneAsObject = (obj) => {
    if (obj === null || !(obj instanceof Object)) {
      return obj
    }
    const temp = (obj instanceof Array) ? [] : {}
    for (let key in obj) {
      temp[key] = this.cloneAsObject(obj[key])
    }
    return temp
  }

  onSuccess = (pos) => {
    const crd = this.cloneAsObject(pos)

    console.log('Your current position is:')
    console.log(`Latitude : ${crd.coords.latitude}`)
    console.log(`Longitude: ${crd.coords.longitude}`)
    console.log(`More or less ${crd.coords.accuracy} meters.`)

    this.sendCommandToIframe({
      command: 'geolocation',
      location: crd
    })
  }

  onError = (error) => {
    this.sendCommandToIframe({
      command: 'geolocationFail',
      error: {
        code: error.code,
        message: error.message
      }
    })
  }

  sendGeolocationToIframe = async () => {
    try {
      window.navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError)
    } catch (error) {
      this.onError(error)
    }
  }

  sendCommandToIframe = (command) => {
    const iframe = document.getElementById(this.getIframeId())
    console.log('sending command to iframe', command, iframe)
    if (iframe) {
      iframe.contentWindow.postMessage(command, '*')
    }
  }

  onReceiveMessage = async (evt) => {
    try {
      // any message (even empty) means that the iFrame is loaded
      const data = JSON.parse(evt.data)

      console.log('got message from iframe:', data)

      switch (data.command) {
        case 'getGeolocation':
          this.sendGeolocationToIframe()
          break
        default:
          break
      }
    } catch (error) {
      // just go on
      console.error(error)
    }

    // any message received means the site is loaded
    this.setState({
      loaded: true
    })
  }

  getIframeId = () => {
    return 'testiframe'
  }

  render = () => {

    let search = window.location.search

    if (!search) {
      search = '?config=hosp_pharm&lang=en'
    }

    return (
      <div className={'iframeContainer'} style={{position: 'relative', width: '100vw', height: '100vh'}}>
        <iframe
          title={'iframe'}
          id={this.getIframeId()}
          allow='geolocation'
          style={{height: '100%', width: '100%', position: 'relative'}}
          src={'https://erv-geoclient-prode.equeo.info/'+search}
        />
      </div>
    )
  }
}