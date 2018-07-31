import debounce from "lodash/debounce";
import 'whatwg-fetch'

class HeroBanner {
  constructor({ el, opt={} }) {
    const infinity = opt.infinity === undefined ? true : opt.infinity
    const autoSlide = opt.autoSlide === undefined ? false : opt.autoSlide
    this.store = {
      data: {
        el,
        infinity,
        autoSlide,
        index: 0,
        device: window.innerWidth > 768 ? "desktop" : "mobile",
        bannerData: [],
        intervalFn: null
      }
    };

    this.store.setIntervalFn = val => {
      this.store.data.intervalFn = val
    }

    this.store.setBannerData = (device, count) => {
      return new Promise((resolve, reject) => {
        fetch(`/banners?device=${device}&count=${count}`)
          .then(res => {
            return res.json();
          })
          .then(jsonData => {
            this.store.data.bannerData = jsonData[this.store.data.device];
            resolve();
          });
      });
    };

    this.store.getProps = value => {
      return this.store.data[value];
    };

    this.store.increaseIndex = () => {
      let { index, bannerData } = this.store.data;
      this.store.data.index = index++ === bannerData.length - 1 ? 0 : index;
    };

    this.store.decreaseIndex = () => {
      let { index, bannerData } = this.store.data;
      this.store.data.index = index-- === 0 ? bannerData.length - 1 : index;
    };

    this.store.setIndex = val => {
      const oldVal = this.store.data.index;
      if (oldVal !== val) this.store.data.index = val;
    };

    this.store.setDevice = val => {
      this.store.data.device = val;
    };
  }

  init() {
    const { store } = this;
    store.setBannerData(store.getProps("device"), "4").then(() => {
      this.renderView(store)
        .bannerArea()
        .controlsArea()
        .addGlobalEvents()
        .addEvents();
    });
  }

  renderView(store) {
    const container = document.querySelector(store.getProps("el"));
    return {
      bannerArea() {
        const bannerData = store.getProps("bannerData");
        const listItem = () => {
          let result = "";
          for (const [key, value] of Object.entries(bannerData)) {
            result += `<li class="list-item">
              <a href="${value.link}" ${key !== "0" ? `tabindex="-1"` : ``}>
                <img src="${value.image}" alt="${key}번 배너"/>
              </a>
            </li>`;
          }
          return result;
        };
        const fakeSlide = insert => {
          return insert === "before"
            ? `<li class="fake-item before" style="width:${100 /
                bannerData.length}%; left:-${100 /
                bannerData.length}%" aria-hidden><img src="${
                bannerData[bannerData.length - 1].image
              }"/></li>`
            : `<li class="fake-item after" style="width:${100 /
                bannerData.length}%; right:-${100 /
                bannerData.length}%" aria-hidden><img src="${
                bannerData[0].image
              }"/></li>`;
        };
        const listItems = () =>
          `<ul class="list-items" style="width:${bannerData.length *
            100}%; transform: translateX(0%)">
          ${store.getProps("infinity") ? fakeSlide("before") : ""}
          ${listItem()}
          ${store.getProps("infinity") ? fakeSlide("after") : ""}
        </ul>`;

        container.insertAdjacentHTML("beforeend", listItems());
        return this;
      },
      controlsArea() {
        const bannerData = store.getProps("bannerData");
        const indicators = () => {
          let result = "";
          for (const [key] of Object.entries(bannerData)) {
            result += `<button class="indicator${key==="0" ? " active" : ""}" data-id=${key}>${key}</button>`;
          }
          return result;
        };
        const bannerControls = () =>
          `<div class="banner-controls">
            ${
              store.getProps("device") === "desktop"
                ? `<button class="prev-btn ${
                    store.getProps("infinity") ? "" : "disabled"
                  }">이전</button><button class="next-btn">다음</button>`
                : ""
            }
            <div class="indicators">
              ${indicators()}
            </div>
          </div>`;
        container.insertAdjacentHTML("beforeend", bannerControls());
        return this;
      },
      reRenderView() {
        container.querySelector(".list-items").remove();
        container.querySelector(".banner-controls").remove();
        store.setIndex(0);
        if(store.getProps('autoSlide')){
          clearInterval(store.getProps('intervalFn'))
        }
        store.setBannerData(store.getProps("device"), "4").then(() => {
          this.bannerArea()
            .controlsArea()
            .addEvents();
        });
        return this;
      },
      addGlobalEvents() {
        const resizeHandler = debounce(() => {
          if (
            window.innerWidth < 769 &&
            store.getProps("device") === "desktop"
          ) {
            store.setDevice("mobile");
            this.reRenderView();
          } else if (
            window.innerWidth > 768 &&
            store.getProps("device") === "mobile"
          ) {
            store.setDevice("desktop");
            this.reRenderView();
          }
        }, 500);
        window.addEventListener("resize", resizeHandler);
        window.addEventListener("orientationchange", resizeHandler);
        return this;
      },
      addEvents() {
        const prevBtn = container.querySelector(".prev-btn");
        const nextBtn = container.querySelector(".next-btn");
        const indicators = container.querySelectorAll(".indicators .indicator");
        const listItems = container.querySelector(".list-items");

        const slideTo = (newIdx, oldIdx, eTarget) => {
          if (newIdx === oldIdx) return;
          const getTranslateX = (arrLength, newIdx) => {
            if (
              store.getProps("infinity") &&
              !eTarget.classList.contains("indicator")
            ) {
              if (oldIdx === 0 && newIdx === arrLength - 1) {
                return 100 / arrLength + "%";
              } else if (oldIdx === arrLength - 1 && newIdx === 0) {
                return "-100%";
              } else {
                return (100 / arrLength) * newIdx * -1 + "%";
              }
            } else {
              return (100 / arrLength) * newIdx * -1 + "%";
            }
          };
          listItems.classList.add("transition");
          listItems.style.transform = `translateX(${getTranslateX(
            store.getProps("bannerData").length,
            newIdx
          )})`;

          indicators[oldIdx].classList.remove('active')
          indicators[newIdx].classList.add('active')

          const transitionendHandler = () => {
            listItems.classList.remove("transition");
            if (store.getProps("infinity")) {
              listItems.style.transform = `translateX(${(100 /
                store.getProps("bannerData").length) *
                newIdx *
                -1 +
                "%"})`;
            }
            listItems.querySelectorAll(".list-item > a")[newIdx].focus();
            listItems.removeEventListener(
              "transitionend",
              transitionendHandler
            );
          };
          listItems.addEventListener("transitionend", transitionendHandler);

          if (
            !store.getProps("infinity") &&
            store.getProps("device") !== "mobile"
          ) {
            if (store.getProps("index") === 0) {
              prevBtn.classList.add("disabled");
            } else if (
              store.getProps("index") ===
              store.getProps("bannerData").length - 1
            ) {
              nextBtn.classList.add("disabled");
            } else {
              const disabledEl = container.querySelector(".banner-controls .disabled")
              if (disabledEl) {
                disabledEl.classList.remove("disabled");
              }
            }
          }
        };

        if(store.getProps('autoSlide')){
          let isStop = false
          const intervalHandler = () => {
            if(isStop) return
            const oldIdx = store.getProps('index')
            store.increaseIndex()
            slideTo(store.getProps('index'), oldIdx, listItems)
          }

          store.setIntervalFn(
            setInterval(intervalHandler, 3000)
          )

          container.addEventListener('mouseover',()=>{
            isStop = true;
          })
          container.addEventListener('mouseleave',()=>{
            isStop = false;
          })

        }

        const clickEventHandler = e => {
          if (
            e.target.classList.contains("disabled") ||
            listItems.classList.contains("transition")
          )
            return;

          const oldIdx = store.getProps("index");
          const slides = listItems.querySelectorAll(".list-item > a");
          slides[oldIdx].setAttribute("tabindex", "-1");
          slides[oldIdx].removeAttribute("aria-live");

          if (e.target.classList.contains("prev-btn")) {
            store.decreaseIndex();
          } else if (e.target.classList.contains("next-btn")) {
            store.increaseIndex();
          } else {
            store.setIndex(parseInt(e.target.getAttribute('data-id')));
          }
          const newIdx = store.getProps("index");
          slides[newIdx].removeAttribute("tabindex");
          slides[newIdx].setAttribute("aria-live", "polite");
          slideTo(newIdx, oldIdx, e.target);
        };

        let cX = 0;
        let movedX = 0;
        let resultPercent = 0;
        let slidersWid = 0;
        let swipe = false;
        const getTranslateX = () => {
          return parseFloat(
            listItems.style.transform
              .replace("translateX(", "")
              .replace("%)", "")
          );
        };
        const swipeHandler = e => {
          if (!listItems.classList.contains("transition")) {
            if (e.type === "touchstart") {
              slidersWid = listItems.getBoundingClientRect().width;
              resultPercent = getTranslateX();
              movedX = 0;
              swipe = true;
              cX = e.touches[0].clientX;
            } else if (e.type === "touchmove" && swipe) {
              movedX = e.touches[0].clientX - cX;
              if (store.getProps("infinity")) {
                listItems.style.transform = `translateX(${((100 * movedX) / slidersWid) * 0.5 + resultPercent}%)`;
              } else {
                if (store.getProps("index") === 0 && movedX > 0) {

                } else if ( store.getProps("index") === store.getProps("bannerData").length - 1 && movedX < 0 ) {
                  
                } else {
                  listItems.style.transform = `translateX(${((100 * movedX) / slidersWid) * 0.5 + resultPercent}%)`;
                }
              }
            } else if (e.type === "touchend" && swipe) {
              const oldIdx = store.getProps("index");
              if (store.getProps("infinity")) {
                if (movedX < 0) {
                  store.increaseIndex();
                } else if (movedX > 0) {
                  store.decreaseIndex();
                }
              } else {
                if (movedX < 0) {
                  if ( store.getProps("index") !== store.getProps("bannerData").length - 1 ) {
                    store.increaseIndex();
                  }
                } else if (movedX > 0) {
                  if (store.getProps("index") !== 0) {
                    store.decreaseIndex();
                  }
                }
              }
              swipe = false;
              slideTo(store.getProps("index"), oldIdx, e.target);
            }
          }
        };

        if (store.getProps("device") === "desktop") {
          prevBtn.addEventListener("click", clickEventHandler);
          nextBtn.addEventListener("click", clickEventHandler);
        } else {
          const slides = listItems.querySelectorAll(".list-item");
          Array.from(slides).map(slide => {
            slide.addEventListener("touchstart", swipeHandler);
            slide.addEventListener("touchmove", swipeHandler);
            slide.addEventListener("touchend", swipeHandler);
          });
        }
        Array.from(indicators).map(indicator => {
          indicator.addEventListener("click", clickEventHandler);
        });
      }
    };
  }
}

export default HeroBanner;
