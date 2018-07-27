class HeroBanner {
  constructor({ el, opt }) {
    const { infinity, autoSlide } = opt;

    this.store = {
      data: {
        el,
        infinity,
        autoSlide,
        index: 0,
        device: "desktop", // 'desktop' || 'mobile'
        bannerData: []
      },
      setIndex(newVal) {
        const oldVal = this.store.data.index;
        if (oldVal !== newVal) {
          this.store.data.index = newVal;
        }
      },
      setBannerData(device, count) {
        console.log(data)
        return new Promise((resolve, reject) => {
          fetch(`/banners?device=${device}&count=${count}`)
            .then(res => {
              resolve(res.json());
            });
        });
      }
    };
  }

  init() {
    const { data, setBannerData } = this.store;

    setBannerData(data.device, "4")
      .catch(err => {
        return err
      })
      .then(jsonData => {
        data.bannerData = jsonData;
      })
      .then(() => {
        console.log(data.bannerData);
      });
  }

  renderView() {
    
  }
}

export default HeroBanner;
