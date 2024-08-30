import { getCurrentScope, onScopeDispose, unref, watch, ref, computed, defineComponent, provide, openBlock, createElementBlock, normalizeStyle, Fragment, renderList, createElementVNode, renderSlot } from "vue";
function tryOnScopeDispose(fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}
const isClient = typeof window !== "undefined";
function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    filter(() => fn.apply(this, args), { fn, thisArg: this, args });
  }
  return wrapper;
}
function debounceFilter(ms, options = {}) {
  let timer;
  let maxTimer;
  const filter = (invoke) => {
    const duration2 = unref(ms);
    const maxDuration = unref(options.maxWait);
    if (timer)
      clearTimeout(timer);
    if (duration2 <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
      if (maxTimer) {
        clearTimeout(maxTimer);
        maxTimer = null;
      }
      return invoke();
    }
    if (maxDuration && !maxTimer) {
      maxTimer = setTimeout(() => {
        if (timer)
          clearTimeout(timer);
        maxTimer = null;
        invoke();
      }, maxDuration);
    }
    timer = setTimeout(() => {
      if (maxTimer)
        clearTimeout(maxTimer);
      maxTimer = null;
      invoke();
    }, duration2);
  };
  return filter;
}
function useDebounceFn(fn, ms = 200, options = {}) {
  return createFilterWrapper(debounceFilter(ms, options), fn);
}
function unrefElement(elRef) {
  var _a2;
  const plain = unref(elRef);
  return (_a2 = plain == null ? void 0 : plain.$el) != null ? _a2 : plain;
}
const defaultWindow = isClient ? window : void 0;
const _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey = "__vueuse_ssr_handlers__";
_global[globalKey] = _global[globalKey] || {};
_global[globalKey];
var __getOwnPropSymbols$c = Object.getOwnPropertySymbols;
var __hasOwnProp$c = Object.prototype.hasOwnProperty;
var __propIsEnum$c = Object.prototype.propertyIsEnumerable;
var __objRest$2 = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp$c.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols$c)
    for (var prop of __getOwnPropSymbols$c(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum$c.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
function useResizeObserver(target, callback, options = {}) {
  const _a2 = options, { window: window2 = defaultWindow } = _a2, observerOptions = __objRest$2(_a2, ["window"]);
  let observer;
  const isSupported = window2 && "ResizeObserver" in window2;
  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = void 0;
    }
  };
  const stopWatch = watch(() => unrefElement(target), (el) => {
    cleanup();
    if (isSupported && window2 && el) {
      observer = new ResizeObserver(callback);
      observer.observe(el, observerOptions);
    }
  }, { immediate: true, flush: "post" });
  const stop = () => {
    cleanup();
    stopWatch();
  };
  tryOnScopeDispose(stop);
  return {
    isSupported,
    stop
  };
}
var _a, _b;
isClient && (window == null ? void 0 : window.navigator) && ((_a = window == null ? void 0 : window.navigator) == null ? void 0 : _a.platform) && /iP(ad|hone|od)/.test((_b = window == null ? void 0 : window.navigator) == null ? void 0 : _b.platform);
const getItemWidth = ({ breakpoints, wrapperWidth, gutter, hasAroundGutter, initWidth }) => {
  const sizeList = Object.keys(breakpoints).map((key) => {
    return Number(key);
  }).sort((a, b) => a - b);
  let validSize = wrapperWidth;
  let breakpoint = false;
  for (const size of sizeList) {
    if (wrapperWidth <= size) {
      validSize = size;
      breakpoint = true;
      break;
    }
  }
  if (!breakpoint)
    return initWidth;
  let breakWidth = 0;
  const col = breakpoints[validSize].rowPerView;
  if (hasAroundGutter)
    breakWidth = (wrapperWidth - gutter) / col - gutter;
  else
    breakWidth = (wrapperWidth - (col - 1) * gutter) / col;
  return Math.floor(breakWidth);
};
function useCalculateCols(props) {
  const wrapperWidth = ref(0);
  const waterfallWrapper = ref(null);
  useResizeObserver(waterfallWrapper, (entries) => {
    const entry = entries[0];
    const { width } = entry.contentRect;
    wrapperWidth.value = width;
  });
  const colWidth = computed(() => {
    return getItemWidth({
      wrapperWidth: wrapperWidth.value,
      breakpoints: props.breakpoints,
      gutter: props.gutter,
      hasAroundGutter: props.hasAroundGutter,
      initWidth: props.width
    });
  });
  const cols = computed(() => {
    const offset = props.hasAroundGutter ? -props.gutter : props.gutter;
    const val = (wrapperWidth.value + offset) / (colWidth.value + props.gutter);
    return Math.floor(val);
  });
  const offsetX = computed(() => {
    if (props.align === "left") {
      return 0;
    } else if (props.align === "center") {
      const offset = props.hasAroundGutter ? props.gutter : -props.gutter;
      const contextWidth = cols.value * (colWidth.value + props.gutter) + offset;
      return (wrapperWidth.value - contextWidth) / 2;
    } else {
      const offset = props.hasAroundGutter ? props.gutter : -props.gutter;
      const contextWidth = cols.value * (colWidth.value + props.gutter) + offset;
      return wrapperWidth.value - contextWidth;
    }
  });
  return {
    waterfallWrapper,
    wrapperWidth,
    colWidth,
    cols,
    offsetX
  };
}
function hasClass(el, className) {
  const reg = new RegExp(`(^|\\s)${className}(\\s|$)`);
  return reg.test(el.className);
}
function addClass(el, className) {
  if (hasClass(el, className))
    return;
  const newClass = el.className.split(/\s+/);
  newClass.push(className);
  el.className = newClass.join(" ");
}
const elementStyle = document.createElement("div").style;
const vendor = (() => {
  const transformNames = {
    standard: "transform",
    webkit: "webkitTransform",
    Moz: "MozTransform",
    O: "OTransform",
    ms: "msTransform"
  };
  for (const key in transformNames) {
    const val = transformNames[key];
    if (elementStyle[val] !== void 0)
      return key;
  }
  return false;
})();
function prefixStyle(style) {
  if (vendor === false)
    return false;
  if (vendor === "standard")
    return style;
  return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}
const transform = prefixStyle("transform");
const duration = prefixStyle("animation-duration");
const delay = prefixStyle("animation-delay");
const transition = prefixStyle("transition");
const fillMode = prefixStyle("animation-fill-mode");
function useLayout(props, colWidth, cols, offsetX, waterfallWrapper) {
  const posY = ref([]);
  const wrapperHeight = ref(0);
  const getX = (index) => {
    const count = props.hasAroundGutter ? index + 1 : index;
    return props.gutter * count + colWidth.value * index + offsetX.value;
  };
  const initY = () => {
    posY.value = new Array(cols.value).fill(props.hasAroundGutter ? props.gutter : 0);
  };
  const animation = addAnimation(props);
  const layoutHandle = async () => {
    return new Promise((resolve) => {
      initY();
      const items = [];
      if (waterfallWrapper && waterfallWrapper.value) {
        waterfallWrapper.value.childNodes.forEach((el) => {
          if (el.className === "waterfall-item")
            items.push(el);
        });
      }
      if (items.length === 0)
        return false;
      for (let i = 0; i < items.length; i++) {
        const curItem = items[i];
        const minY = Math.min.apply(null, posY.value);
        const minYIndex = posY.value.indexOf(minY);
        const curX = getX(minYIndex);
        const style = curItem.style;
        if (transform)
          style[transform] = `translate3d(${curX}px,${minY}px, 0)`;
        style.width = `${colWidth.value}px`;
        style.visibility = "visible";
        const { height } = curItem.getBoundingClientRect();
        posY.value[minYIndex] += height + props.gutter;
        if (!props.animationCancel) {
          animation(curItem, () => {
            const time = props.posDuration / 1e3;
            if (transition)
              style[transition] = `transform ${time}s`;
          });
        }
      }
      wrapperHeight.value = Math.max.apply(null, posY.value);
      setTimeout(() => {
        resolve(true);
      }, props.posDuration);
    });
  };
  return {
    wrapperHeight,
    layoutHandle
  };
}
function addAnimation(props) {
  return (item, callback) => {
    const content = item.firstChild;
    if (content && !hasClass(content, props.animationPrefix)) {
      const durationSec = `${props.animationDuration / 1e3}s`;
      const delaySec = `${props.animationDelay / 1e3}s`;
      const style = content.style;
      addClass(content, props.animationPrefix);
      addClass(content, props.animationEffect);
      if (duration)
        style[duration] = durationSec;
      if (delay)
        style[delay] = delaySec;
      if (fillMode)
        style[fillMode] = "both";
      if (callback) {
        setTimeout(() => {
          callback();
        }, props.animationDuration + props.animationDelay);
      }
    }
  };
}
var Waterfall_vue_vue_type_style_index_0_lang = "";
var _export_sfc = (sfc, props) => {
  for (const [key, val] of props) {
    sfc[key] = val;
  }
  return sfc;
};
const _sfc_main = defineComponent({
  props: {
    list: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: "id"
    },
    width: {
      type: Number,
      default: 200
    },
    breakpoints: {
      type: Object,
      default: () => ({
        1200: {
          rowPerView: 3
        },
        800: {
          rowPerView: 2
        },
        500: {
          rowPerView: 1
        }
      })
    },
    gutter: {
      type: Number,
      default: 10
    },
    hasAroundGutter: {
      type: Boolean,
      default: true
    },
    posDuration: {
      type: Number,
      default: 300
    },
    animationPrefix: {
      type: String,
      default: "animate__animated"
    },
    animationEffect: {
      type: String,
      default: "fadeIn"
    },
    animationDuration: {
      type: Number,
      default: 1e3
    },
    animationDelay: {
      type: Number,
      default: 300
    },
    animationCancel: {
      type: Boolean,
      default: false
    },
    delay: {
      type: Number,
      default: 300
    },
    align: {
      type: String,
      default: "center"
    }
  },
  setup(props, ctx) {
    const {
      waterfallWrapper,
      wrapperWidth,
      colWidth,
      cols,
      offsetX
    } = useCalculateCols(props);
    const { wrapperHeight, layoutHandle } = useLayout(props, colWidth, cols, offsetX, waterfallWrapper);
    const renderer = useDebounceFn(() => {
      layoutHandle().then(() => {
        ctx.emit("afterRender");
      });
    }, props.delay);
    watch(() => [wrapperWidth, colWidth, props.list], () => {
      if (wrapperWidth.value > 0)
        renderer();
    }, { deep: true });
    const sizeChangeTime = ref(0);
    provide("sizeChangeTime", sizeChangeTime);
    provide("imgLoaded", renderer);
    const getKey = (item, index) => {
      return item[props.rowKey] || index;
    };
    return {
      colWidth,
      waterfallWrapper,
      wrapperHeight,
      getKey,
      renderer
    };
  }
});
const _hoisted_1 = { class: "waterfall-card" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    ref: "waterfallWrapper",
    class: "waterfall-list",
    style: normalizeStyle({ height: `${_ctx.wrapperHeight}px` })
  }, [
    (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.list, (item, index) => {
      return openBlock(), createElementBlock("div", {
        key: _ctx.getKey(item, index),
        class: "waterfall-item"
      }, [
        createElementVNode("div", _hoisted_1, [
          renderSlot(_ctx.$slots, "default", {
            item,
            index
          })
        ])
      ]);
    }), 128))
  ], 4);
}
var Waterfall = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
export { Waterfall };
