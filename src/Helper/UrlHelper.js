export default class {
  static getUrlParams (path) {
    if (!path && (!window || !window.location || !window.location.search)) {
      return {}
    }

    const search = path || window.location.search
    const hashes = search.slice(search.indexOf('?') + 1).split('&')
    const params = {}
    hashes.map(hash => {
      const [key, val] = hash.split('=')
      params[key] = decodeURIComponent(val)
      return params
    })

    return params
  }

  static getBasePath () {
    if (!window || !window.location || !window.location.hash ) {
      return ''
    }

    const urlHash = window.location.hash
    if (urlHash) {
      const path = urlHash.substr(1, urlHash.length)
      if (path) {
        return path
      }
    }

    return ''
  }

  static parseURL (url) {
    const parser = document.createElement('a')
    const searchObject = {}
    parser.href = url
    const queries = (parser.search) ? parser.search.replace(/^\?/, '').split('&') : []
    for (let i = 0; i < queries.length; i++) {
      const split = queries[i].split('=')
      searchObject[split[0]] = decodeURIComponent(split[1])
    }
    return {
      protocol: parser.protocol,
      host: parser.host,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname,
      search: parser.search,
      searchObject: searchObject,
      hash: parser.hash
    }
  }
}
