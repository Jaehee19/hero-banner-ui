import './style.less'
import HeroBanner from './HeroBanner'

const hb = new HeroBanner({
  el: '.hero-banner-container',
  opt: {
    autoSlide: true
  }
})

hb.init()