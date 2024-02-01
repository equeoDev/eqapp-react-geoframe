export default class StringHelper {
  static removeLeadingAndTrailingBrAndPInHtml = (htmlString) => {
    const regex = /^(<\/?\s*(br|p)[^>]*\/?>)+|(<\/?\s*(br|p)[^>]*\/?>)+$/g
    return htmlString.replace(regex, '')
  }

  static removeAllPAndReplaceWithBr = (htmlString) => {
    const regex = /<p[^>]*>/g
    let stringToReturn = htmlString.replace(regex, '')
    const regex2 = /<\/p[^>]*>/g
    let stringToReturn2 = stringToReturn.replace(regex2, '<br /><br />')
    const regex3 = /<br \/><br \/>$/g
    return stringToReturn2.replace(regex3, '')
  }

  static isEmailAdress = (address) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(address.toLowerCase());
  }

  static getMathMlContent = (htmlString) => {
    if (!htmlString) {
      console.log('got no html string', htmlString)
      return null
    }
    const regex = /<math.*?>.*?<\/math>/g
    return htmlString.match(regex)
  }

  static createUuid = () => {
    let d = new Date().getTime()
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now() // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (d + (Math.random() * 16)) % 16 | 0            // eslint-disable-line
      d = Math.floor(d / 16)                                   // eslint-disable-line
      return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16)  // eslint-disable-line
    })
  }

  static getDeviceUuidVisiblePart = (deviceUuid) => {
    if (deviceUuid.split) {
      const parts = deviceUuid.split('-')
      if (parts.length > 0) {
        return parts[parts.length - 1]
      }
    }
    return null
  }

  static createShortId = (length = 5) => {                      // eslint-disable-line no-magic-numbers
    return Math.random().toString(36).substring(2, length + 2)     // eslint-disable-line no-magic-numbers
  }

  static getDjb2HashCode = (str) => {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) + hash) + char // hash = hash * 33 + c
    }
    return hash
  }

  static getHumanReadableTimeString(seconds){
    const mm = Math.floor(seconds / 60)
    const ss = Math.floor(seconds - mm * 60)
    let res
    if(ss === 0) {
      res = "" + mm + ":" + ss + "0"
    }
    else if(ss < 10) {
      res = "" + mm + ":0" + ss
    }
    else {
      res = "" + mm + ":" + ss
    }
    return res
  }

  /**
   * Returns the given text with all &shy; replaced by equivalent UTF-8 symbol \u00AD
   */
  static decodeHtmlEntities (text) {
    if (!text) {
      return null
    }
    return text
      .replace(/&shy;/g, '\u00AD')              // shy
      .replace(/&nbsp;/g, '\u00A0')             // non breaking space
      .replace(/&#?[a-zA-Z0-9]{2,8};/g, '') // hide all other symbols to be backward compatible in future
  }
}
