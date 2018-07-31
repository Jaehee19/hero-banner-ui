import './style.less'
import HeroBanner from './HeroBanner'

const hb = new HeroBanner({
  el: '.hero-banner-container',
  opt: {
    infinity: true
  }
})

hb.init()