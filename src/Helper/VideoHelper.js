import axios from 'axios'

export async function getVideoUrl (mediaId) {
  const infoUrl = 'https://cdn.jwplayer.com/v2/media/' + mediaId
  const videoRequestResult = await axios.get(infoUrl, {})
  if (videoRequestResult.status === 200 && videoRequestResult.data) {
    const playList = videoRequestResult.data.playlist[0]
    const sources = playList.sources

    let optimalLongSide = null
    let longSideDiff = null
    let optimalMp4File = null

    const width = Math.max(window.innerHeight, window.innerWidth) || 640
    for (let i = 0, l = sources.length; i < l; i++) {
      const description = sources[i]
      if (description.label === 'Passthrough') continue
      if (!description.hasOwnProperty('width')) continue
      if (!optimalLongSide || Math.abs(width - description.width) < longSideDiff) {
        optimalMp4File = description.file
        optimalLongSide = description.width
        longSideDiff = Math.abs(width - optimalLongSide)
      }
    }

    if (optimalMp4File) {
      return {src: optimalMp4File, poster: playList.image}
    }
  }
  else {
    return false
  }
}
