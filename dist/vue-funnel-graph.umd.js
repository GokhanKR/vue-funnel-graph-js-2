(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('polymorph-js'), require('@tweenjs/tween.js'), require('funnel-graph-js'), require('funnel-graph-js/src/js/number'), require('funnel-graph-js/src/js/graph'), require('funnel-graph-js/src/scss/main.scss'), require('funnel-graph-js/src/scss/theme.scss'), require('vue')) :
    typeof define === 'function' && define.amd ? define(['exports', 'polymorph-js', '@tweenjs/tween.js', 'funnel-graph-js', 'funnel-graph-js/src/js/number', 'funnel-graph-js/src/js/graph', 'funnel-graph-js/src/scss/main.scss', 'funnel-graph-js/src/scss/theme.scss', 'vue'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueFunnelGraph = {}, global.interpolate, global.TWEEN, global.FunnelGraph, global.formatNumber, global.getDefaultColors, null, null, global.vue));
})(this, (function (exports, polymorphJs, TWEEN, FunnelGraph, number, graph, main_scss, theme_scss, vue) { 'use strict';

    var script = {
            name: 'VueFunnelGraph',
            props: {
                animated: {
                    type: Boolean,
                    default: false
                },
                width: [String, Number],
                height: [String, Number],
                values: Array,
                labels: Array,
                colors: {
                    type: Array,
                    default: function default$1() { return []; }
                },
                subLabels: Array,
                subLabelValue: {
                    type: String,
                    default: 'percent'
                },
                direction: {
                    type: String,
                    default: 'horizontal'
                },
                gradientDirection: {
                    type: String,
                    default: 'horizontal'
                },
                displayPercentage: {
                    type: Boolean,
                    default: true
                }
            },
            data: function data() {
                return {
                    paths: [],
                    prevPaths: [], // paths before update, used for animations
                    graph: null,
                    tween: null,
                    defaultColors: graph.getDefaultColors(10)
                };
            },
            computed: {
                valuesFormatted: function valuesFormatted() {
                    if (this.graph.is2d()) {
                        return this.graph.getValues2d().map(function (value) { return number.formatNumber(value); });
                    }
                    return this.values.map(function (value) { return number.formatNumber(value); });
                },
                colorSet: function colorSet() {
                    var colorSet = [];
                    var gradientCount = 0;

                    for (var i = 0; i < this.paths.length; i++) {
                        var values = this.graph.is2d() ? this.getColors[i] : this.getColors;
                        var fillMode = (typeof values === 'string' || values.length === 1) ? 'solid' : 'gradient';
                        if (fillMode === 'gradient') { gradientCount += 1; }
                        colorSet.push({
                            values: values,
                            fillMode: fillMode,
                            fill: fillMode === 'solid' ? values : ("url('#funnelGradient-" + gradientCount + "')")
                        });
                    }
                    return colorSet;
                },
                gradientSet: function gradientSet() {
                    var gradientSet = [];
                    this.colorSet.forEach(function (colors) {
                        if (colors.fillMode === 'gradient') {
                            gradientSet.push(colors);
                        }
                    });
                    return gradientSet;
                },
                getColors: function getColors() {
                    if (this.colors instanceof Array && this.colors.length === 0) {
                        return graph.getDefaultColors(this.is2d() ? this.values[0].length : 2);
                    }
                    if (this.colors.length < this.paths.length) {
                        return [].concat( this.colors ).concat(
                            [].concat( this.defaultColors ).splice(this.paths.length, this.paths.length - this.colors.length)
                        );
                    }
                    return this.colors;
                },
                gradientAngle: function gradientAngle() {
                    return ("rotate(" + (this.gradientDirection === 'vertical' ? 90 : 0) + ")");
                }
            },
            methods: {
                enterTransition: function enterTransition(el, done) {
                    if (!this.animated) { done(); }
                    setTimeout(function () { return done(); }, 700);
                },
                leaveTransition: function leaveTransition(el, done) {
                    if (!this.animated) { done(); }
                    setTimeout(function () { return done(); }, 700);
                },
                is2d: function is2d() {
                    return this.graph.is2d();
                },
                percentages: function percentages() {
                    return this.graph.createPercentages();
                },
                twoDimPercentages: function twoDimPercentages() {
                    if (!this.is2d()) {
                        return [];
                    }
                    return this.graph.getPercentages2d();
                },
                subLabelBackgrounds: function subLabelBackgrounds(index) {
                    if (!this.is2d()) {
                        return [];
                    }
                    return graph.generateLegendBackground(this.getColors[index], this.gradientDirection);
                },
                offsetColor: function offsetColor(index, length) {
                    return ((Math.round(100 * index / (length - 1))) + "%");
                },
                makeAnimations: function makeAnimations() {
                    var this$1$1 = this;

                    if (this.tween !== null) { this.tween.stop(); }
                    var interpolators = [];
                    var dimensionChanged = this.prevPaths.length !== this.paths.length;

                    var origin = { x: 0.5, y: 0.5 };
                    if (dimensionChanged) {
                        origin = { x: 0, y: 0.5 };
                        if (this.graph.isVertical()) {
                            origin = { x: 1, y: 1 };
                        }
                        if (!this.graph.is2d()) {
                            origin = { x: 0, y: 1 };
                        }
                    }

                    this.paths.forEach(function (path, index) {
                        var oldPath = this$1$1.prevPaths[index] || this$1$1.graph.getPathMedian(index);
                        if (dimensionChanged) { oldPath = this$1$1.graph.getPathMedian(index); }
                        var interpolator = polymorphJs.interpolate([oldPath, path], {
                            addPoints: 1,
                            origin: origin,
                            optimize: 'fill',
                            precision: 1
                        });

                        interpolators.push(interpolator);
                    });

                    function animate() {
                        if (TWEEN.update()) {
                            requestAnimationFrame(animate);
                        }
                    }

                    var position = { value: 0 };
                    this.tween = new TWEEN.Tween(position)
                        .to({ value: 1 }, 700)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(function () {
                            for (var index = 0; index < this$1$1.paths.length; index++) {
                                this$1$1.$set(this$1$1.paths, index, interpolators[index](position.value));
                            }
                        });

                    this.tween.start();
                    animate();
                },
                drawPaths: function drawPaths() {
                    var this$1$1 = this;

                    this.prevPaths = this.paths;
                    this.paths = [];
                    var definitions = this.graph.getPathDefinitions();

                    definitions.forEach(function (d) {
                        this$1$1.paths.push(d);
                    });
                }
            },
            created: function created() {
                this.graph = new FunnelGraph({
                    height: this.height,
                    width: this.width,
                    direction: this.direction,
                    data: {
                        labels: this.labels,
                        values: this.values
                    }
                });
                this.drawPaths();
                if (this.animated) { this.makeAnimations(); }
            },
            watch: {
                values: function values() {
                    this.graph.setValues(this.values);
                    this.drawPaths();
                    if (this.animated) { this.makeAnimations(); }
                },
                direction: function direction() {
                    this.graph.setDirection(this.direction)
                        .setWidth(this.width)
                        .setHeight(this.height);
                    this.drawPaths();
                }
            },
            filters: {
                format: function (value) {
                    return number.formatNumber(value)
                }
            }
        };

    var _hoisted_1 = { class: "svg-funnel-js__container" };
    var _hoisted_2 = ["width", "height"];
    var _hoisted_3 = ["id", "gradientTransform"];
    var _hoisted_4 = ["stop-color", "offset"];
    var _hoisted_5 = ["fill", "stroke", "d"];
    var _hoisted_6 = { class: "label__value" };
    var _hoisted_7 = {
      key: 0,
      class: "label__title"
    };
    var _hoisted_8 = {
      key: 1,
      class: "label__percentage"
    };
    var _hoisted_9 = {
      key: 2,
      class: "label__segment-percentages"
    };
    var _hoisted_10 = { class: "segment-percentage__list" };
    var _hoisted_11 = {
      key: 0,
      class: "percentage__list-label"
    };
    var _hoisted_12 = {
      key: 1,
      class: "percentage__list-label"
    };
    var _hoisted_13 = {
      key: 0,
      class: "svg-funnel-js__subLabels"
    };
    var _hoisted_14 = { class: "svg-funnel-js__subLabel--title" };

    function render(_ctx, _cache, $props, $setup, $data, $options) {
      return (vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["funnel svg-funnel-js", {'svg-funnel-js--vertical': $props.direction === 'vertical'}])
      }, [
        vue.createElementVNode("div", _hoisted_1, [
          (vue.openBlock(), vue.createElementBlock("svg", {
            width: $props.width,
            height: $props.height
          }, [
            vue.createElementVNode("defs", null, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList($options.gradientSet, function (colors, index) {
                return (vue.openBlock(), vue.createElementBlock("linearGradient", {
                  id: ("funnelGradient-" + ((index+1))),
                  key: index,
                  gradientTransform: $options.gradientAngle
                }, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(colors.values, function (color, index) {
                    return (vue.openBlock(), vue.createElementBlock("stop", {
                      "stop-color": color,
                      offset: $options.offsetColor(index, colors.values.length),
                      key: index
                    }, null, 8, _hoisted_4))
                  }), 128))
                ], 8, _hoisted_3))
              }), 128))
            ]),
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList($data.paths, function (path, index) {
              return (vue.openBlock(), vue.createElementBlock("path", {
                fill: $options.colorSet[index].fill,
                stroke: $options.colorSet[index].fill,
                d: path,
                key: index
              }, null, 8, _hoisted_5))
            }), 128))
          ], 8, _hoisted_2))
        ]),
        vue.createVNode(vue.TransitionGroup, {
          class: "svg-funnel-js__labels",
          name: "appear",
          tag: "div",
          onEnter: $options.enterTransition,
          onLeave: $options.leaveTransition
        }, {
          default: vue.withCtx(function () { return [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList($options.valuesFormatted, function (value, index) {
              return (vue.openBlock(), vue.createElementBlock("div", {
                class: vue.normalizeClass(["svg-funnel-js__label", ("label-" + ((index+1)))]),
                key: $props.labels[index].toLowerCase().split(' ').join('-')
              }, [
                vue.createElementVNode("div", _hoisted_6, vue.toDisplayString(value), 1),
                ($props.labels)
                  ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_7, vue.toDisplayString($props.labels[index]), 1))
                  : vue.createCommentVNode("", true),
                ($props.displayPercentage && $options.percentages()[index] !== 100)
                  ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_8, vue.toDisplayString($options.percentages()[index]) + "% ", 1))
                  : vue.createCommentVNode("", true),
                ($options.is2d())
                  ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_9, [
                      vue.createElementVNode("ul", _hoisted_10, [
                        (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList($props.subLabels, function (subLabel, j) {
                          return (vue.openBlock(), vue.createElementBlock("li", { key: j }, [
                            vue.createTextVNode(vue.toDisplayString(subLabel) + ": ", 1),
                            ($props.subLabelValue === 'percent')
                              ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_11, vue.toDisplayString($options.twoDimPercentages()[index][j]) + "%", 1))
                              : (vue.openBlock(), vue.createElementBlock("span", _hoisted_12, vue.toDisplayString($props.values[index][j] | _ctx.format), 1))
                          ]))
                        }), 128))
                      ])
                    ]))
                  : vue.createCommentVNode("", true)
              ], 2))
            }), 128))
          ]; }),
          _: 1
        }, 8, ["onEnter", "onLeave"]),
        vue.createVNode(vue.Transition, {
          name: "fade",
          onEnter: $options.enterTransition,
          onLeave: $options.leaveTransition
        }, {
          default: vue.withCtx(function () { return [
            ($options.is2d())
              ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_13, [
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList($props.subLabels, function (subLabel, index) {
                    return (vue.openBlock(), vue.createElementBlock("div", {
                      class: vue.normalizeClass(("svg-funnel-js__subLabel svg-funnel-js__subLabel-" + ((index + 1)))),
                      key: index
                    }, [
                      vue.createElementVNode("div", {
                        class: "svg-funnel-js__subLabel--color",
                        style: vue.normalizeStyle($options.subLabelBackgrounds(index))
                      }, null, 4),
                      vue.createElementVNode("div", _hoisted_14, vue.toDisplayString(subLabel), 1)
                    ], 2))
                  }), 128))
                ]))
              : vue.createCommentVNode("", true)
          ]; }),
          _: 1
        }, 8, ["onEnter", "onLeave"])
      ], 2))
    }

    script.render = render;
    script.__scopeId = "data-v-409b8995";

    /* eslint-disable import/prefer-default-export */

    var components = /*#__PURE__*/Object.freeze({
        __proto__: null,
        VueFunnelGraph: script
    });

    // Import vue components

    // install function executed by Vue.use()
    function install(Vue) {
      if (install.installed) { return; }
      install.installed = true;
      Object.keys(components).forEach(function (componentName) {
        Vue.component(componentName, components[componentName]);
      });
    }

    // Create module definition for Vue.use()
    var plugin = {
      install: install
    };

    // To auto-install when vue is found
    /* global window global */
    var GlobalVue = null;
    if (typeof window !== 'undefined') {
      GlobalVue = window.Vue;
    } else if (typeof global !== 'undefined') {
      GlobalVue = global.Vue;
    }
    if (GlobalVue) {
      GlobalVue.use(plugin);
    }

    exports.VueFunnelGraph = script;
    exports.default = plugin;

    Object.defineProperty(exports, '__esModule', { value: true });

}));