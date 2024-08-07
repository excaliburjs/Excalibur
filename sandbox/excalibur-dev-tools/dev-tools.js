/*! For license information please see dev-tools.js.LICENSE.txt */
!(function (t, e) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = e(require('excalibur')))
    : 'function' == typeof define && define.amd
    ? define(['excalibur'], e)
    : 'object' == typeof exports
    ? (exports.ex = e(require('excalibur')))
    : ((t.ex = t.ex || {}), (t.ex.DevTools = e(t.ex)));
})(self, function (t) {
  return (() => {
    var e = {
        './picker-system.ts': (t, e, n) => {
          'use strict';
          n.r(e), n.d(e, { PickerSystem: () => s });
          var i = n('excalibur');
          class s extends i.System {
            constructor() {
              super(...arguments),
                (this.types = ['ex.transform']),
                (this.systemType = i.SystemType.Update),
                (this.priority = 99),
                (this.lastFrameEntityToPointers = new Map()),
                (this.currentFrameEntityToPointers = new Map());
            }
            initialize(t) {
              (this._engine = t.engine), (this._receiver = this._engine.input.pointers);
            }
            addPointerToEntity(t, e) {
              if (!this.currentFrameEntityToPointers.has(t.id)) return void this.currentFrameEntityToPointers.set(t.id, [e]);
              const n = this.currentFrameEntityToPointers.get(t.id);
              this.currentFrameEntityToPointers.set(t.id, n.concat(e));
            }
            _processPointerToEntity(t) {
              var e;
              let n, s, o;
              for (const r of t)
                if (!(r instanceof i.Particle)) {
                  if (((n = r.get(i.TransformComponent)), (s = r.get(i.ColliderComponent)), s)) {
                    const t = s.get();
                    if (t)
                      for (const [e, s] of this._receiver.currentFramePointerCoords.entries())
                        t.contains(n.coordPlane === i.CoordPlane.World ? s.worldPos : s.screenPos) && this.addPointerToEntity(r, e);
                  }
                  if (((o = r.get(i.GraphicsComponent)), o)) {
                    const t = o.localBounds.transform(n.getGlobalMatrix());
                    for (const [e, s] of this._receiver.currentFramePointerCoords.entries())
                      t.contains(n.coordPlane === i.CoordPlane.World ? s.worldPos : s.screenPos) && this.addPointerToEntity(r, e);
                  }
                  if (
                    (!(null === (e = null == o ? void 0 : o.current) || void 0 === e ? void 0 : e.length) &&
                      !(null == s ? void 0 : s.get())) ||
                    r instanceof i.ParticleEmitter
                  ) {
                    const t = i.BoundingBox.fromDimension(100, 100).transform(n.getGlobalMatrix());
                    for (const [e, s] of this._receiver.currentFramePointerCoords.entries())
                      t.contains(n.coordPlane === i.CoordPlane.World ? s.worldPos : s.screenPos) && this.addPointerToEntity(r, e);
                  }
                }
            }
            update(t, e) {
              this._processPointerToEntity(t),
                this.lastFrameEntityToPointers.clear(),
                (this.lastFrameEntityToPointers = new Map(this.currentFrameEntityToPointers)),
                this.currentFrameEntityToPointers.clear();
            }
          }
        },
        './node_modules/tweakpane/dist/tweakpane.js': function (t, e) {
          !(function (t) {
            'use strict';
            class e {
              constructor(t) {
                this.controller_ = t;
              }
              get disabled() {
                return this.controller_.viewProps.get('disabled');
              }
              set disabled(t) {
                this.controller_.viewProps.set('disabled', t);
              }
              get hidden() {
                return this.controller_.viewProps.get('hidden');
              }
              set hidden(t) {
                this.controller_.viewProps.set('hidden', t);
              }
              dispose() {
                this.controller_.viewProps.set('disposed', !0);
              }
            }
            class n {
              constructor(t) {
                this.target = t;
              }
            }
            class i extends n {
              constructor(t, e, n, i) {
                super(t), (this.value = e), (this.presetKey = n), (this.last = null == i || i);
              }
            }
            class s extends n {
              constructor(t, e, n) {
                super(t), (this.value = e), (this.presetKey = n);
              }
            }
            class o extends n {
              constructor(t, e) {
                super(t), (this.expanded = e);
              }
            }
            function r(t) {
              return null == t;
            }
            function a(t, e) {
              if (t.length !== e.length) return !1;
              for (let n = 0; n < t.length; n++) if (t[n] !== e[n]) return !1;
              return !0;
            }
            const l = {
              alreadydisposed: () => 'View has been already disposed',
              invalidparams: (t) => `Invalid parameters for '${t.name}'`,
              nomatchingcontroller: (t) => `No matching controller for '${t.key}'`,
              nomatchingview: (t) => `No matching view for '${JSON.stringify(t.params)}'`,
              notbindable: () => 'Value is not bindable',
              propertynotfound: (t) => `Property '${t.name}' not found`,
              shouldneverhappen: () => 'This error should never happen'
            };
            class p {
              constructor(t) {
                var e;
                (this.message = null !== (e = l[t.type](t.context)) && void 0 !== e ? e : 'Unexpected error'),
                  (this.name = this.constructor.name),
                  (this.stack = new Error(this.message).stack),
                  (this.type = t.type);
              }
              static alreadyDisposed() {
                return new p({ type: 'alreadydisposed' });
              }
              static notBindable() {
                return new p({ type: 'notbindable' });
              }
              static propertyNotFound(t) {
                return new p({ type: 'propertynotfound', context: { name: t } });
              }
              static shouldNeverHappen() {
                return new p({ type: 'shouldneverhappen' });
              }
            }
            class d {
              constructor(t, e, n) {
                (this.obj_ = t), (this.key_ = e), (this.presetKey_ = null != n ? n : e);
              }
              static isBindable(t) {
                return null !== t && 'object' == typeof t;
              }
              get key() {
                return this.key_;
              }
              get presetKey() {
                return this.presetKey_;
              }
              read() {
                return this.obj_[this.key_];
              }
              write(t) {
                this.obj_[this.key_] = t;
              }
              writeProperty(t, e) {
                const n = this.read();
                if (!d.isBindable(n)) throw p.notBindable();
                if (!(t in n)) throw p.propertyNotFound(t);
                n[t] = e;
              }
            }
            class c extends e {
              get label() {
                return this.controller_.props.get('label');
              }
              set label(t) {
                this.controller_.props.set('label', t);
              }
              get title() {
                var t;
                return null !== (t = this.controller_.valueController.props.get('title')) && void 0 !== t ? t : '';
              }
              set title(t) {
                this.controller_.valueController.props.set('title', t);
              }
              on(t, e) {
                const i = e.bind(this);
                return (
                  this.controller_.valueController.emitter.on(t, () => {
                    i(new n(this));
                  }),
                  this
                );
              }
            }
            class h {
              constructor() {
                this.observers_ = {};
              }
              on(t, e) {
                let n = this.observers_[t];
                return n || (n = this.observers_[t] = []), n.push({ handler: e }), this;
              }
              off(t, e) {
                const n = this.observers_[t];
                return n && (this.observers_[t] = n.filter((t) => t.handler !== e)), this;
              }
              emit(t, e) {
                const n = this.observers_[t];
                n &&
                  n.forEach((t) => {
                    t.handler(e);
                  });
              }
            }
            const u = 'tp';
            function v(t) {
              return (e, n) => [u, '-', t, 'v', e ? `_${e}` : '', n ? `-${n}` : ''].join('');
            }
            function m(t) {
              return t.rawValue;
            }
            function b(t, e) {
              var n, i;
              t.emitter.on('change', ((n = m), (i = e), (t) => i(n(t)))), e(t.rawValue);
            }
            function g(t, e, n) {
              b(t.value(e), n);
            }
            function _(t, e) {
              return (n) => {
                !(function (t, e, n) {
                  n ? t.classList.add(e) : t.classList.remove(e);
                })(t, e, n);
              };
            }
            function f(t, e) {
              b(t, (t) => {
                e.textContent = null != t ? t : '';
              });
            }
            const w = v('btn');
            class x {
              constructor(t, e) {
                (this.element = t.createElement('div')), this.element.classList.add(w()), e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('button');
                n.classList.add(w('b')), e.viewProps.bindDisabled(n), this.element.appendChild(n), (this.buttonElement = n);
                const i = t.createElement('div');
                i.classList.add(w('t')), f(e.props.value('title'), i), this.buttonElement.appendChild(i);
              }
            }
            class y {
              constructor(t, e) {
                (this.emitter = new h()),
                  (this.onClick_ = this.onClick_.bind(this)),
                  (this.props = e.props),
                  (this.viewProps = e.viewProps),
                  (this.view = new x(t, { props: this.props, viewProps: this.viewProps })),
                  this.view.buttonElement.addEventListener('click', this.onClick_);
              }
              onClick_() {
                this.emitter.emit('click', { sender: this });
              }
            }
            class C {
              constructor(t, e) {
                var n;
                (this.constraint_ = null == e ? void 0 : e.constraint),
                  (this.equals_ = null !== (n = null == e ? void 0 : e.equals) && void 0 !== n ? n : (t, e) => t === e),
                  (this.emitter = new h()),
                  (this.rawValue_ = t);
              }
              get constraint() {
                return this.constraint_;
              }
              get rawValue() {
                return this.rawValue_;
              }
              set rawValue(t) {
                this.setRawValue(t, { forceEmit: !1, last: !0 });
              }
              setRawValue(t, e) {
                const n = null != e ? e : { forceEmit: !1, last: !0 },
                  i = this.constraint_ ? this.constraint_.constrain(t) : t;
                (!this.equals_(this.rawValue_, i) || n.forceEmit) &&
                  (this.emitter.emit('beforechange', { sender: this }),
                  (this.rawValue_ = i),
                  this.emitter.emit('change', { options: n, rawValue: i, sender: this }));
              }
            }
            class P {
              constructor(t) {
                (this.emitter = new h()), (this.value_ = t);
              }
              get rawValue() {
                return this.value_;
              }
              set rawValue(t) {
                this.setRawValue(t, { forceEmit: !1, last: !0 });
              }
              setRawValue(t, e) {
                const n = null != e ? e : { forceEmit: !1, last: !0 };
                (this.value_ !== t || n.forceEmit) &&
                  (this.emitter.emit('beforechange', { sender: this }),
                  (this.value_ = t),
                  this.emitter.emit('change', { options: n, rawValue: this.value_, sender: this }));
              }
            }
            function E(t, e) {
              const n = null == e ? void 0 : e.constraint,
                i = null == e ? void 0 : e.equals;
              return n || i ? new C(t, e) : new P(t);
            }
            class k {
              constructor(t) {
                (this.emitter = new h()), (this.valMap_ = t);
                for (const t in this.valMap_)
                  this.valMap_[t].emitter.on('change', () => {
                    this.emitter.emit('change', { key: t, sender: this });
                  });
              }
              static createCore(t) {
                return Object.keys(t).reduce((e, n) => Object.assign(e, { [n]: E(t[n]) }), {});
              }
              static fromObject(t) {
                const e = this.createCore(t);
                return new k(e);
              }
              get(t) {
                return this.valMap_[t].rawValue;
              }
              set(t, e) {
                this.valMap_[t].rawValue = e;
              }
              value(t) {
                return this.valMap_[t];
              }
            }
            function V(t) {
              return (e) => (n) => {
                if (!e && void 0 === n) return { succeeded: !1, value: void 0 };
                if (e && void 0 === n) return { succeeded: !0, value: void 0 };
                const i = t(n);
                return void 0 !== i ? { succeeded: !0, value: i } : { succeeded: !1, value: void 0 };
              };
            }
            function S(t) {
              return {
                custom: (e) => V(e)(t),
                boolean: V((t) => ('boolean' == typeof t ? t : void 0))(t),
                number: V((t) => ('number' == typeof t ? t : void 0))(t),
                string: V((t) => ('string' == typeof t ? t : void 0))(t),
                function: V((t) => ('function' == typeof t ? t : void 0))(t),
                constant: (e) => V((t) => (t === e ? e : void 0))(t),
                raw: V((t) => t)(t),
                object: (e) =>
                  V((t) => {
                    if (null !== (n = t) && 'object' == typeof n)
                      return (function (t, e) {
                        return Object.keys(e).reduce((n, i) => {
                          if (void 0 === n) return;
                          const s = (0, e[i])(t[i]);
                          return s.succeeded ? Object.assign(Object.assign({}, n), { [i]: s.value }) : void 0;
                        }, {});
                      })(t, e);
                    var n;
                  })(t),
                array: (e) =>
                  V((t) => {
                    if (Array.isArray(t))
                      return (
                        (n = e),
                        t.reduce((t, e) => {
                          if (void 0 === t) return;
                          const i = n(e);
                          return i.succeeded && void 0 !== i.value ? [...t, i.value] : void 0;
                        }, [])
                      );
                    var n;
                  })(t)
              };
            }
            const M = { optional: S(!0), required: S(!1) };
            function L(t, e) {
              const n = M.required.object(e)(t);
              return n.succeeded ? n.value : void 0;
            }
            const A = v(''),
              I = { veryfirst: 'vfst', first: 'fst', last: 'lst', verylast: 'vlst' };
            class T {
              constructor(t) {
                (this.parent_ = null), (this.blade = t.blade), (this.view = t.view), (this.viewProps = t.viewProps);
                const e = this.view.element;
                this.blade.value('positions').emitter.on('change', () => {
                  ['veryfirst', 'first', 'last', 'verylast'].forEach((t) => {
                    e.classList.remove(A(void 0, I[t]));
                  }),
                    this.blade.get('positions').forEach((t) => {
                      e.classList.add(A(void 0, I[t]));
                    });
                }),
                  this.viewProps.handleDispose(() => {
                    !(function (t) {
                      t && t.parentElement && t.parentElement.removeChild(t);
                    })(e);
                  });
              }
              get parent() {
                return this.parent_;
              }
            }
            const D = 'http://www.w3.org/2000/svg';
            function j(t) {
              t.offsetHeight;
            }
            function B(t) {
              return void 0 !== t.ontouchstart;
            }
            function R() {
              return new Function('return this')().document;
            }
            const F = {
              check: '<path d="M2 8l4 4l8 -8"/>',
              dropdown: '<path d="M5 7h6l-3 3 z"/>',
              p2dpad: '<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'
            };
            function U(t, e) {
              const n = t.createElementNS(D, 'svg');
              return (n.innerHTML = F[e]), n;
            }
            function O(t, e, n) {
              t.insertBefore(e, t.children[n]);
            }
            function K(t) {
              t.parentElement && t.parentElement.removeChild(t);
            }
            function N(t) {
              for (; t.children.length > 0; ) t.removeChild(t.children[0]);
            }
            function $(t) {
              return t.relatedTarget ? t.relatedTarget : 'explicitOriginalTarget' in t ? t.explicitOriginalTarget : null;
            }
            const z = v('lbl');
            class H {
              constructor(t, e) {
                (this.element = t.createElement('div')), this.element.classList.add(z()), e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('div');
                n.classList.add(z('l')),
                  g(e.props, 'label', (e) => {
                    r(e)
                      ? this.element.classList.add(z(void 0, 'nol'))
                      : (this.element.classList.remove(z(void 0, 'nol')),
                        (function (t) {
                          for (; t.childNodes.length > 0; ) t.removeChild(t.childNodes[0]);
                        })(n),
                        n.appendChild(
                          (function (t, e) {
                            const n = t.createDocumentFragment();
                            return (
                              e
                                .split('\n')
                                .map((e) => t.createTextNode(e))
                                .forEach((e, i) => {
                                  i > 0 && n.appendChild(t.createElement('br')), n.appendChild(e);
                                }),
                              n
                            );
                          })(t, e)
                        ));
                  }),
                  this.element.appendChild(n),
                  (this.labelElement = n);
                const i = t.createElement('div');
                i.classList.add(z('v')), this.element.appendChild(i), (this.valueElement = i);
              }
            }
            class q extends T {
              constructor(t, e) {
                const n = e.valueController.viewProps;
                super(Object.assign(Object.assign({}, e), { view: new H(t, { props: e.props, viewProps: n }), viewProps: n })),
                  (this.props = e.props),
                  (this.valueController = e.valueController),
                  this.view.valueElement.appendChild(this.valueController.view.element);
              }
            }
            const G = {
              id: 'button',
              type: 'blade',
              accept(t) {
                const e = M,
                  n = L(t, { title: e.required.string, view: e.required.constant('button'), label: e.optional.string });
                return n ? { params: n } : null;
              },
              controller: (t) =>
                new q(t.document, {
                  blade: t.blade,
                  props: k.fromObject({ label: t.params.label }),
                  valueController: new y(t.document, { props: k.fromObject({ title: t.params.title }), viewProps: t.viewProps })
                }),
              api: (t) => (t.controller instanceof q && t.controller.valueController instanceof y ? new c(t.controller) : null)
            };
            class Y extends T {
              constructor(t) {
                super(t), (this.value = t.value);
              }
            }
            function W() {
              return new k({ positions: E([], { equals: a }) });
            }
            class X extends k {
              constructor(t) {
                super(t);
              }
              static create(t) {
                const e = { completed: !0, expanded: t, expandedHeight: null, shouldFixHeight: !1, temporaryExpanded: null },
                  n = k.createCore(e);
                return new X(n);
              }
              get styleExpanded() {
                var t;
                return null !== (t = this.get('temporaryExpanded')) && void 0 !== t ? t : this.get('expanded');
              }
              get styleHeight() {
                if (!this.styleExpanded) return '0';
                const t = this.get('expandedHeight');
                return this.get('shouldFixHeight') && !r(t) ? `${t}px` : 'auto';
              }
              bindExpandedClass(t, e) {
                g(this, 'expanded', () => {
                  this.styleExpanded ? t.classList.add(e) : t.classList.remove(e);
                });
              }
            }
            function Q(t, e) {
              e.style.height = t.styleHeight;
            }
            function J(t, e) {
              t.value('expanded').emitter.on('beforechange', () => {
                t.set('completed', !1),
                  r(t.get('expandedHeight')) &&
                    t.set(
                      'expandedHeight',
                      (function (t, e) {
                        let n = 0;
                        return (
                          (function (t, e) {
                            const n = t.style.transition;
                            (t.style.transition = 'none'), e(), (t.style.transition = n);
                          })(e, () => {
                            t.set('expandedHeight', null),
                              t.set('temporaryExpanded', !0),
                              j(e),
                              (n = e.clientHeight),
                              t.set('temporaryExpanded', null),
                              j(e);
                          }),
                          n
                        );
                      })(t, e)
                    ),
                  t.set('shouldFixHeight', !0),
                  j(e);
              }),
                t.emitter.on('change', () => {
                  Q(t, e);
                }),
                Q(t, e),
                e.addEventListener('transitionend', (e) => {
                  'height' === e.propertyName && (t.set('shouldFixHeight', !1), t.set('expandedHeight', null), t.set('completed', !0));
                });
            }
            class Z extends e {
              constructor(t, e) {
                super(t), (this.rackApi_ = e);
              }
            }
            class tt {
              constructor(t) {
                (this.emitter = new h()),
                  (this.items_ = []),
                  (this.cache_ = new Set()),
                  (this.onSubListAdd_ = this.onSubListAdd_.bind(this)),
                  (this.onSubListRemove_ = this.onSubListRemove_.bind(this)),
                  (this.extract_ = t);
              }
              get items() {
                return this.items_;
              }
              allItems() {
                return Array.from(this.cache_);
              }
              find(t) {
                for (const e of this.allItems()) if (t(e)) return e;
                return null;
              }
              includes(t) {
                return this.cache_.has(t);
              }
              add(t, e) {
                if (this.includes(t)) throw p.shouldNeverHappen();
                const n = void 0 !== e ? e : this.items_.length;
                this.items_.splice(n, 0, t), this.cache_.add(t);
                const i = this.extract_(t);
                i &&
                  (i.emitter.on('add', this.onSubListAdd_),
                  i.emitter.on('remove', this.onSubListRemove_),
                  i.allItems().forEach((t) => {
                    this.cache_.add(t);
                  })),
                  this.emitter.emit('add', { index: n, item: t, root: this, target: this });
              }
              remove(t) {
                const e = this.items_.indexOf(t);
                if (e < 0) return;
                this.items_.splice(e, 1), this.cache_.delete(t);
                const n = this.extract_(t);
                n && (n.emitter.off('add', this.onSubListAdd_), n.emitter.off('remove', this.onSubListRemove_)),
                  this.emitter.emit('remove', { index: e, item: t, root: this, target: this });
              }
              onSubListAdd_(t) {
                this.cache_.add(t.item), this.emitter.emit('add', { index: t.index, item: t.item, root: this, target: t.target });
              }
              onSubListRemove_(t) {
                this.cache_.delete(t.item), this.emitter.emit('remove', { index: t.index, item: t.item, root: this, target: t.target });
              }
            }
            class et extends e {
              constructor(t) {
                super(t),
                  (this.onBindingChange_ = this.onBindingChange_.bind(this)),
                  (this.emitter_ = new h()),
                  this.controller_.binding.emitter.on('change', this.onBindingChange_);
              }
              get label() {
                return this.controller_.props.get('label');
              }
              set label(t) {
                this.controller_.props.set('label', t);
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
              refresh() {
                this.controller_.binding.read();
              }
              onBindingChange_(t) {
                const e = t.sender.target.read();
                this.emitter_.emit('change', { event: new i(this, e, this.controller_.binding.target.presetKey, t.options.last) });
              }
            }
            class nt extends q {
              constructor(t, e) {
                super(t, e), (this.binding = e.binding);
              }
            }
            class it extends e {
              constructor(t) {
                super(t),
                  (this.onBindingUpdate_ = this.onBindingUpdate_.bind(this)),
                  (this.emitter_ = new h()),
                  this.controller_.binding.emitter.on('update', this.onBindingUpdate_);
              }
              get label() {
                return this.controller_.props.get('label');
              }
              set label(t) {
                this.controller_.props.set('label', t);
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
              refresh() {
                this.controller_.binding.read();
              }
              onBindingUpdate_(t) {
                const e = t.sender.target.read();
                this.emitter_.emit('update', { event: new s(this, e, this.controller_.binding.target.presetKey) });
              }
            }
            class st extends q {
              constructor(t, e) {
                super(t, e),
                  (this.binding = e.binding),
                  this.viewProps.bindDisabled(this.binding.ticker),
                  this.viewProps.handleDispose(() => {
                    this.binding.dispose();
                  });
              }
            }
            function ot(t) {
              return t instanceof lt ? t.apiSet_ : t instanceof Z ? t.rackApi_.apiSet_ : null;
            }
            function rt(t, e) {
              const n = t.find((t) => t.controller_ === e);
              if (!n) throw p.shouldNeverHappen();
              return n;
            }
            function at(t, e, n) {
              if (!d.isBindable(t)) throw p.notBindable();
              return new d(t, e, n);
            }
            class lt extends e {
              constructor(t, e) {
                super(t),
                  (this.onRackAdd_ = this.onRackAdd_.bind(this)),
                  (this.onRackRemove_ = this.onRackRemove_.bind(this)),
                  (this.onRackInputChange_ = this.onRackInputChange_.bind(this)),
                  (this.onRackMonitorUpdate_ = this.onRackMonitorUpdate_.bind(this)),
                  (this.emitter_ = new h()),
                  (this.apiSet_ = new tt(ot)),
                  (this.pool_ = e);
                const n = this.controller_.rack;
                n.emitter.on('add', this.onRackAdd_),
                  n.emitter.on('remove', this.onRackRemove_),
                  n.emitter.on('inputchange', this.onRackInputChange_),
                  n.emitter.on('monitorupdate', this.onRackMonitorUpdate_),
                  n.children.forEach((t) => {
                    this.setUpApi_(t);
                  });
              }
              get children() {
                return this.controller_.rack.children.map((t) => rt(this.apiSet_, t));
              }
              addInput(t, e, n) {
                const i = n || {},
                  s = this.controller_.view.element.ownerDocument,
                  o = this.pool_.createInput(s, at(t, e, i.presetKey), i),
                  r = new et(o);
                return this.add(r, i.index);
              }
              addMonitor(t, e, n) {
                const i = n || {},
                  s = this.controller_.view.element.ownerDocument,
                  o = this.pool_.createMonitor(s, at(t, e), i),
                  r = new it(o);
                return this.add(r, i.index);
              }
              addFolder(t) {
                return (function (t, e) {
                  return t.addBlade(Object.assign(Object.assign({}, e), { view: 'folder' }));
                })(this, t);
              }
              addButton(t) {
                return (function (t, e) {
                  return t.addBlade(Object.assign(Object.assign({}, e), { view: 'button' }));
                })(this, t);
              }
              addSeparator(t) {
                return (function (t, e) {
                  const n = e || {};
                  return t.addBlade(Object.assign(Object.assign({}, n), { view: 'separator' }));
                })(this, t);
              }
              addTab(t) {
                return (function (t, e) {
                  return t.addBlade(Object.assign(Object.assign({}, e), { view: 'tab' }));
                })(this, t);
              }
              add(t, e) {
                this.controller_.rack.add(t.controller_, e);
                const n = this.apiSet_.find((e) => e.controller_ === t.controller_);
                return n && this.apiSet_.remove(n), this.apiSet_.add(t), t;
              }
              remove(t) {
                this.controller_.rack.remove(t.controller_);
              }
              addBlade(t) {
                const e = this.controller_.view.element.ownerDocument,
                  n = this.pool_.createBlade(e, t),
                  i = this.pool_.createBladeApi(n);
                return this.add(i, t.index);
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
              setUpApi_(t) {
                this.apiSet_.find((e) => e.controller_ === t) || this.apiSet_.add(this.pool_.createBladeApi(t));
              }
              onRackAdd_(t) {
                this.setUpApi_(t.bladeController);
              }
              onRackRemove_(t) {
                if (t.isRoot) {
                  const e = rt(this.apiSet_, t.bladeController);
                  this.apiSet_.remove(e);
                }
              }
              onRackInputChange_(t) {
                const e = t.bladeController;
                if (e instanceof nt) {
                  const n = rt(this.apiSet_, e),
                    s = e.binding;
                  this.emitter_.emit('change', { event: new i(n, s.target.read(), s.target.presetKey, t.options.last) });
                } else if (e instanceof Y) {
                  const n = rt(this.apiSet_, e);
                  this.emitter_.emit('change', { event: new i(n, e.value.rawValue, void 0, t.options.last) });
                }
              }
              onRackMonitorUpdate_(t) {
                if (!(t.bladeController instanceof st)) throw p.shouldNeverHappen();
                const e = rt(this.apiSet_, t.bladeController),
                  n = t.bladeController.binding;
                this.emitter_.emit('update', { event: new s(e, n.target.read(), n.target.presetKey) });
              }
            }
            class pt extends Z {
              constructor(t, e) {
                super(t, new lt(t.rackController, e)),
                  (this.emitter_ = new h()),
                  this.controller_.foldable.value('expanded').emitter.on('change', (t) => {
                    this.emitter_.emit('fold', { event: new o(this, t.sender.rawValue) });
                  }),
                  this.rackApi_.on('change', (t) => {
                    this.emitter_.emit('change', { event: t });
                  }),
                  this.rackApi_.on('update', (t) => {
                    this.emitter_.emit('update', { event: t });
                  });
              }
              get expanded() {
                return this.controller_.foldable.get('expanded');
              }
              set expanded(t) {
                this.controller_.foldable.set('expanded', t);
              }
              get title() {
                return this.controller_.props.get('title');
              }
              set title(t) {
                this.controller_.props.set('title', t);
              }
              get children() {
                return this.rackApi_.children;
              }
              addInput(t, e, n) {
                return this.rackApi_.addInput(t, e, n);
              }
              addMonitor(t, e, n) {
                return this.rackApi_.addMonitor(t, e, n);
              }
              addFolder(t) {
                return this.rackApi_.addFolder(t);
              }
              addButton(t) {
                return this.rackApi_.addButton(t);
              }
              addSeparator(t) {
                return this.rackApi_.addSeparator(t);
              }
              addTab(t) {
                return this.rackApi_.addTab(t);
              }
              add(t, e) {
                return this.rackApi_.add(t, e);
              }
              remove(t) {
                this.rackApi_.remove(t);
              }
              addBlade(t) {
                return this.rackApi_.addBlade(t);
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
            }
            class dt extends T {
              constructor(t) {
                super({ blade: t.blade, view: t.view, viewProps: t.rackController.viewProps }), (this.rackController = t.rackController);
              }
            }
            class ct {
              constructor(t, e) {
                const n = v(e.viewName);
                (this.element = t.createElement('div')), this.element.classList.add(n()), e.viewProps.bindClassModifiers(this.element);
              }
            }
            function ht(t) {
              return t instanceof mt ? t.rack : t instanceof dt ? t.rackController.rack : null;
            }
            function ut(t) {
              const e = ht(t);
              return e ? e.bcSet_ : null;
            }
            class vt {
              constructor(t) {
                var e;
                (this.onBladePositionsChange_ = this.onBladePositionsChange_.bind(this)),
                  (this.onSetAdd_ = this.onSetAdd_.bind(this)),
                  (this.onSetRemove_ = this.onSetRemove_.bind(this)),
                  (this.onChildDispose_ = this.onChildDispose_.bind(this)),
                  (this.onChildPositionsChange_ = this.onChildPositionsChange_.bind(this)),
                  (this.onChildInputChange_ = this.onChildInputChange_.bind(this)),
                  (this.onChildMonitorUpdate_ = this.onChildMonitorUpdate_.bind(this)),
                  (this.onChildValueChange_ = this.onChildValueChange_.bind(this)),
                  (this.onChildViewPropsChange_ = this.onChildViewPropsChange_.bind(this)),
                  (this.onDescendantLayout_ = this.onDescendantLayout_.bind(this)),
                  (this.onDescendantInputChange_ = this.onDescendantInputChange_.bind(this)),
                  (this.onDescendantMonitorUpdate_ = this.onDescendantMonitorUpdate_.bind(this)),
                  (this.emitter = new h()),
                  (this.blade_ = null != t ? t : null),
                  null === (e = this.blade_) || void 0 === e || e.value('positions').emitter.on('change', this.onBladePositionsChange_),
                  (this.bcSet_ = new tt(ut)),
                  this.bcSet_.emitter.on('add', this.onSetAdd_),
                  this.bcSet_.emitter.on('remove', this.onSetRemove_);
              }
              get children() {
                return this.bcSet_.items;
              }
              add(t, e) {
                t.parent && t.parent.remove(t), (t.parent_ = this), this.bcSet_.add(t, e);
              }
              remove(t) {
                (t.parent_ = null), this.bcSet_.remove(t);
              }
              find(t) {
                return this.bcSet_.allItems().filter((e) => e instanceof t);
              }
              onSetAdd_(t) {
                this.updatePositions_();
                const e = t.target === t.root;
                if ((this.emitter.emit('add', { bladeController: t.item, index: t.index, isRoot: e, sender: this }), !e)) return;
                const n = t.item;
                if (
                  (n.viewProps.emitter.on('change', this.onChildViewPropsChange_),
                  n.blade.value('positions').emitter.on('change', this.onChildPositionsChange_),
                  n.viewProps.handleDispose(this.onChildDispose_),
                  n instanceof nt)
                )
                  n.binding.emitter.on('change', this.onChildInputChange_);
                else if (n instanceof st) n.binding.emitter.on('update', this.onChildMonitorUpdate_);
                else if (n instanceof Y) n.value.emitter.on('change', this.onChildValueChange_);
                else {
                  const t = ht(n);
                  if (t) {
                    const e = t.emitter;
                    e.on('layout', this.onDescendantLayout_),
                      e.on('inputchange', this.onDescendantInputChange_),
                      e.on('monitorupdate', this.onDescendantMonitorUpdate_);
                  }
                }
              }
              onSetRemove_(t) {
                this.updatePositions_();
                const e = t.target === t.root;
                if ((this.emitter.emit('remove', { bladeController: t.item, isRoot: e, sender: this }), !e)) return;
                const n = t.item;
                if (n instanceof nt) n.binding.emitter.off('change', this.onChildInputChange_);
                else if (n instanceof st) n.binding.emitter.off('update', this.onChildMonitorUpdate_);
                else if (n instanceof Y) n.value.emitter.off('change', this.onChildValueChange_);
                else {
                  const t = ht(n);
                  if (t) {
                    const e = t.emitter;
                    e.off('layout', this.onDescendantLayout_),
                      e.off('inputchange', this.onDescendantInputChange_),
                      e.off('monitorupdate', this.onDescendantMonitorUpdate_);
                  }
                }
              }
              updatePositions_() {
                const t = this.bcSet_.items.filter((t) => !t.viewProps.get('hidden')),
                  e = t[0],
                  n = t[t.length - 1];
                this.bcSet_.items.forEach((t) => {
                  const i = [];
                  t === e && (i.push('first'), (this.blade_ && !this.blade_.get('positions').includes('veryfirst')) || i.push('veryfirst')),
                    t === n && (i.push('last'), (this.blade_ && !this.blade_.get('positions').includes('verylast')) || i.push('verylast')),
                    t.blade.set('positions', i);
                });
              }
              onChildPositionsChange_() {
                this.updatePositions_(), this.emitter.emit('layout', { sender: this });
              }
              onChildViewPropsChange_(t) {
                this.updatePositions_(), this.emitter.emit('layout', { sender: this });
              }
              onChildDispose_() {
                this.bcSet_.items
                  .filter((t) => t.viewProps.get('disposed'))
                  .forEach((t) => {
                    this.bcSet_.remove(t);
                  });
              }
              onChildInputChange_(t) {
                const e = (function (t, e) {
                  for (let n = 0; n < t.length; n++) {
                    const i = t[n];
                    if (i instanceof nt && i.binding === e) return i;
                  }
                  return null;
                })(this.find(nt), t.sender);
                if (!e) throw p.shouldNeverHappen();
                this.emitter.emit('inputchange', { bladeController: e, options: t.options, sender: this });
              }
              onChildMonitorUpdate_(t) {
                const e = (function (t, e) {
                  for (let n = 0; n < t.length; n++) {
                    const i = t[n];
                    if (i instanceof st && i.binding === e) return i;
                  }
                  return null;
                })(this.find(st), t.sender);
                if (!e) throw p.shouldNeverHappen();
                this.emitter.emit('monitorupdate', { bladeController: e, sender: this });
              }
              onChildValueChange_(t) {
                const e = (function (t, e) {
                  for (let n = 0; n < t.length; n++) {
                    const i = t[n];
                    if (i instanceof Y && i.value === e) return i;
                  }
                  return null;
                })(this.find(Y), t.sender);
                if (!e) throw p.shouldNeverHappen();
                this.emitter.emit('inputchange', { bladeController: e, options: t.options, sender: this });
              }
              onDescendantLayout_(t) {
                this.updatePositions_(), this.emitter.emit('layout', { sender: this });
              }
              onDescendantInputChange_(t) {
                this.emitter.emit('inputchange', { bladeController: t.bladeController, options: t.options, sender: this });
              }
              onDescendantMonitorUpdate_(t) {
                this.emitter.emit('monitorupdate', { bladeController: t.bladeController, sender: this });
              }
              onBladePositionsChange_() {
                this.updatePositions_();
              }
            }
            class mt extends T {
              constructor(t, e) {
                super(Object.assign(Object.assign({}, e), { view: new ct(t, { viewName: 'brk', viewProps: e.viewProps }) })),
                  (this.onRackAdd_ = this.onRackAdd_.bind(this)),
                  (this.onRackRemove_ = this.onRackRemove_.bind(this));
                const n = new vt(e.root ? void 0 : e.blade);
                n.emitter.on('add', this.onRackAdd_),
                  n.emitter.on('remove', this.onRackRemove_),
                  (this.rack = n),
                  this.viewProps.handleDispose(() => {
                    for (let t = this.rack.children.length - 1; t >= 0; t--) this.rack.children[t].viewProps.set('disposed', !0);
                  });
              }
              onRackAdd_(t) {
                t.isRoot && O(this.view.element, t.bladeController.view.element, t.index);
              }
              onRackRemove_(t) {
                t.isRoot && K(t.bladeController.view.element);
              }
            }
            const bt = v('cnt');
            class gt {
              constructor(t, e) {
                (this.className_ = v(e.viewName || 'fld')),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(this.className_(), bt()),
                  e.viewProps.bindClassModifiers(this.element),
                  (this.foldable_ = e.foldable),
                  this.foldable_.bindExpandedClass(this.element, this.className_(void 0, 'expanded')),
                  g(this.foldable_, 'completed', _(this.element, this.className_(void 0, 'cpl')));
                const n = t.createElement('button');
                n.classList.add(this.className_('b')),
                  g(e.props, 'title', (t) => {
                    r(t)
                      ? this.element.classList.add(this.className_(void 0, 'not'))
                      : this.element.classList.remove(this.className_(void 0, 'not'));
                  }),
                  e.viewProps.bindDisabled(n),
                  this.element.appendChild(n),
                  (this.buttonElement = n);
                const i = t.createElement('div');
                i.classList.add(this.className_('t')),
                  f(e.props.value('title'), i),
                  this.buttonElement.appendChild(i),
                  (this.titleElement = i);
                const s = t.createElement('div');
                s.classList.add(this.className_('m')), this.buttonElement.appendChild(s);
                const o = e.containerElement;
                o.classList.add(this.className_('c')), this.element.appendChild(o), (this.containerElement = o);
              }
            }
            class _t extends dt {
              constructor(t, e) {
                var n;
                const i = X.create(null === (n = e.expanded) || void 0 === n || n),
                  s = new mt(t, { blade: e.blade, root: e.root, viewProps: e.viewProps });
                super(
                  Object.assign(Object.assign({}, e), {
                    rackController: s,
                    view: new gt(t, {
                      containerElement: s.view.element,
                      foldable: i,
                      props: e.props,
                      viewName: e.root ? 'rot' : void 0,
                      viewProps: e.viewProps
                    })
                  })
                ),
                  (this.onTitleClick_ = this.onTitleClick_.bind(this)),
                  (this.props = e.props),
                  (this.foldable = i),
                  J(this.foldable, this.view.containerElement),
                  this.view.buttonElement.addEventListener('click', this.onTitleClick_);
              }
              get document() {
                return this.view.element.ownerDocument;
              }
              onTitleClick_() {
                this.foldable.set('expanded', !this.foldable.get('expanded'));
              }
            }
            const ft = {
              id: 'folder',
              type: 'blade',
              accept(t) {
                const e = M,
                  n = L(t, { title: e.required.string, view: e.required.constant('folder'), expanded: e.optional.boolean });
                return n ? { params: n } : null;
              },
              controller: (t) =>
                new _t(t.document, {
                  blade: t.blade,
                  expanded: t.params.expanded,
                  props: k.fromObject({ title: t.params.title }),
                  viewProps: t.viewProps
                }),
              api: (t) => (t.controller instanceof _t ? new pt(t.controller, t.pool) : null)
            };
            class wt extends Y {
              constructor(t, e) {
                const n = e.valueController.viewProps;
                super(
                  Object.assign(Object.assign({}, e), {
                    value: e.valueController.value,
                    view: new H(t, { props: e.props, viewProps: n }),
                    viewProps: n
                  })
                ),
                  (this.props = e.props),
                  (this.valueController = e.valueController),
                  this.view.valueElement.appendChild(this.valueController.view.element);
              }
            }
            class xt extends e {}
            const yt = v('spr');
            class Ct {
              constructor(t, e) {
                (this.element = t.createElement('div')), this.element.classList.add(yt()), e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('hr');
                n.classList.add(yt('r')), this.element.appendChild(n);
              }
            }
            class Pt extends T {
              constructor(t, e) {
                super(Object.assign(Object.assign({}, e), { view: new Ct(t, { viewProps: e.viewProps }) }));
              }
            }
            const Et = {
                id: 'separator',
                type: 'blade',
                accept(t) {
                  const e = L(t, { view: M.required.constant('separator') });
                  return e ? { params: e } : null;
                },
                controller: (t) => new Pt(t.document, { blade: t.blade, viewProps: t.viewProps }),
                api: (t) => (t.controller instanceof Pt ? new xt(t.controller) : null)
              },
              kt = v('');
            function Vt(t, e) {
              return _(t, kt(void 0, e));
            }
            class St extends k {
              constructor(t) {
                super(t);
              }
              static create(t) {
                var e, n;
                const i = null != t ? t : {},
                  s = {
                    disabled: null !== (e = i.disabled) && void 0 !== e && e,
                    disposed: !1,
                    hidden: null !== (n = i.hidden) && void 0 !== n && n
                  },
                  o = k.createCore(s);
                return new St(o);
              }
              bindClassModifiers(t) {
                g(this, 'disabled', Vt(t, 'disabled')), g(this, 'hidden', Vt(t, 'hidden'));
              }
              bindDisabled(t) {
                g(this, 'disabled', (e) => {
                  t.disabled = e;
                });
              }
              bindTabIndex(t) {
                g(this, 'disabled', (e) => {
                  t.tabIndex = e ? -1 : 0;
                });
              }
              handleDispose(t) {
                this.value('disposed').emitter.on('change', (e) => {
                  e && t();
                });
              }
            }
            const Mt = v('tbi');
            class Lt {
              constructor(t, e) {
                (this.element = t.createElement('div')),
                  this.element.classList.add(Mt()),
                  e.viewProps.bindClassModifiers(this.element),
                  g(e.props, 'selected', (t) => {
                    t ? this.element.classList.add(Mt(void 0, 'sel')) : this.element.classList.remove(Mt(void 0, 'sel'));
                  });
                const n = t.createElement('button');
                n.classList.add(Mt('b')), e.viewProps.bindDisabled(n), this.element.appendChild(n), (this.buttonElement = n);
                const i = t.createElement('div');
                i.classList.add(Mt('t')), f(e.props.value('title'), i), this.buttonElement.appendChild(i), (this.titleElement = i);
              }
            }
            class At {
              constructor(t, e) {
                (this.emitter = new h()),
                  (this.onClick_ = this.onClick_.bind(this)),
                  (this.props = e.props),
                  (this.viewProps = e.viewProps),
                  (this.view = new Lt(t, { props: e.props, viewProps: e.viewProps })),
                  this.view.buttonElement.addEventListener('click', this.onClick_);
              }
              onClick_() {
                this.emitter.emit('click', { sender: this });
              }
            }
            class It {
              constructor(t, e) {
                (this.onItemClick_ = this.onItemClick_.bind(this)),
                  (this.ic_ = new At(t, { props: e.itemProps, viewProps: St.create() })),
                  this.ic_.emitter.on('click', this.onItemClick_),
                  (this.cc_ = new mt(t, { blade: W(), viewProps: St.create() })),
                  (this.props = e.props),
                  g(this.props, 'selected', (t) => {
                    this.itemController.props.set('selected', t), this.contentController.viewProps.set('hidden', !t);
                  });
              }
              get itemController() {
                return this.ic_;
              }
              get contentController() {
                return this.cc_;
              }
              onItemClick_() {
                this.props.set('selected', !0);
              }
            }
            class Tt {
              constructor(t, e) {
                (this.controller_ = t), (this.rackApi_ = e);
              }
              get title() {
                var t;
                return null !== (t = this.controller_.itemController.props.get('title')) && void 0 !== t ? t : '';
              }
              set title(t) {
                this.controller_.itemController.props.set('title', t);
              }
              get selected() {
                return this.controller_.props.get('selected');
              }
              set selected(t) {
                this.controller_.props.set('selected', t);
              }
              get children() {
                return this.rackApi_.children;
              }
              addButton(t) {
                return this.rackApi_.addButton(t);
              }
              addFolder(t) {
                return this.rackApi_.addFolder(t);
              }
              addSeparator(t) {
                return this.rackApi_.addSeparator(t);
              }
              addTab(t) {
                return this.rackApi_.addTab(t);
              }
              add(t, e) {
                this.rackApi_.add(t, e);
              }
              remove(t) {
                this.rackApi_.remove(t);
              }
              addInput(t, e, n) {
                return this.rackApi_.addInput(t, e, n);
              }
              addMonitor(t, e, n) {
                return this.rackApi_.addMonitor(t, e, n);
              }
              addBlade(t) {
                return this.rackApi_.addBlade(t);
              }
            }
            class Dt extends Z {
              constructor(t, e) {
                super(t, new lt(t.rackController, e)),
                  (this.onPageAdd_ = this.onPageAdd_.bind(this)),
                  (this.onPageRemove_ = this.onPageRemove_.bind(this)),
                  (this.emitter_ = new h()),
                  (this.pageApiMap_ = new Map()),
                  this.rackApi_.on('change', (t) => {
                    this.emitter_.emit('change', { event: t });
                  }),
                  this.rackApi_.on('update', (t) => {
                    this.emitter_.emit('update', { event: t });
                  }),
                  this.controller_.pageSet.emitter.on('add', this.onPageAdd_),
                  this.controller_.pageSet.emitter.on('remove', this.onPageRemove_),
                  this.controller_.pageSet.items.forEach((t) => {
                    this.setUpPageApi_(t);
                  });
              }
              get pages() {
                return this.controller_.pageSet.items.map((t) => {
                  const e = this.pageApiMap_.get(t);
                  if (!e) throw p.shouldNeverHappen();
                  return e;
                });
              }
              addPage(t) {
                const e = this.controller_.view.element.ownerDocument,
                  n = new It(e, { itemProps: k.fromObject({ selected: !1, title: t.title }), props: k.fromObject({ selected: !1 }) });
                this.controller_.add(n, t.index);
                const i = this.pageApiMap_.get(n);
                if (!i) throw p.shouldNeverHappen();
                return i;
              }
              removePage(t) {
                this.controller_.remove(t);
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
              setUpPageApi_(t) {
                const e = this.rackApi_.apiSet_.find((e) => e.controller_ === t.contentController);
                if (!e) throw p.shouldNeverHappen();
                const n = new Tt(t, e);
                this.pageApiMap_.set(t, n);
              }
              onPageAdd_(t) {
                this.setUpPageApi_(t.item);
              }
              onPageRemove_(t) {
                if (!this.pageApiMap_.get(t.item)) throw p.shouldNeverHappen();
                this.pageApiMap_.delete(t.item);
              }
            }
            const jt = v('tab');
            class Bt {
              constructor(t, e) {
                (this.element = t.createElement('div')),
                  this.element.classList.add(jt(), bt()),
                  e.viewProps.bindClassModifiers(this.element),
                  b(e.empty, _(this.element, jt(void 0, 'nop')));
                const n = t.createElement('div');
                n.classList.add(jt('i')), this.element.appendChild(n), (this.itemsElement = n);
                const i = e.contentsElement;
                i.classList.add(jt('c')), this.element.appendChild(i), (this.contentsElement = i);
              }
            }
            class Rt extends dt {
              constructor(t, e) {
                const n = new mt(t, { blade: e.blade, viewProps: e.viewProps }),
                  i = E(!0);
                super({
                  blade: e.blade,
                  rackController: n,
                  view: new Bt(t, { contentsElement: n.view.element, empty: i, viewProps: e.viewProps })
                }),
                  (this.onPageAdd_ = this.onPageAdd_.bind(this)),
                  (this.onPageRemove_ = this.onPageRemove_.bind(this)),
                  (this.onPageSelectedChange_ = this.onPageSelectedChange_.bind(this)),
                  (this.pageSet_ = new tt(() => null)),
                  this.pageSet_.emitter.on('add', this.onPageAdd_),
                  this.pageSet_.emitter.on('remove', this.onPageRemove_),
                  (this.empty_ = i),
                  this.applyPages_();
              }
              get pageSet() {
                return this.pageSet_;
              }
              add(t, e) {
                this.pageSet_.add(t, null != e ? e : this.pageSet_.items.length);
              }
              remove(t) {
                this.pageSet_.remove(this.pageSet_.items[t]);
              }
              applyPages_() {
                this.keepSelection_(), (this.empty_.rawValue = 0 === this.pageSet_.items.length);
              }
              onPageAdd_(t) {
                const e = t.item;
                O(this.view.itemsElement, e.itemController.view.element, t.index),
                  this.rackController.rack.add(e.contentController, t.index),
                  e.props.value('selected').emitter.on('change', this.onPageSelectedChange_),
                  this.applyPages_();
              }
              onPageRemove_(t) {
                const e = t.item;
                K(e.itemController.view.element),
                  this.rackController.rack.remove(e.contentController),
                  e.props.value('selected').emitter.off('change', this.onPageSelectedChange_),
                  this.applyPages_();
              }
              keepSelection_() {
                if (0 === this.pageSet_.items.length) return;
                const t = this.pageSet_.items.findIndex((t) => t.props.get('selected'));
                t < 0
                  ? this.pageSet_.items.forEach((t, e) => {
                      t.props.set('selected', 0 === e);
                    })
                  : this.pageSet_.items.forEach((e, n) => {
                      e.props.set('selected', n === t);
                    });
              }
              onPageSelectedChange_(t) {
                if (t.rawValue) {
                  const e = this.pageSet_.items.findIndex((e) => e.props.value('selected') === t.sender);
                  this.pageSet_.items.forEach((t, n) => {
                    t.props.set('selected', n === e);
                  });
                } else this.keepSelection_();
              }
            }
            const Ft = {
              id: 'tab',
              type: 'blade',
              accept(t) {
                const e = M,
                  n = L(t, { pages: e.required.array(e.required.object({ title: e.required.string })), view: e.required.constant('tab') });
                return n && 0 !== n.pages.length ? { params: n } : null;
              },
              controller(t) {
                const e = new Rt(t.document, { blade: t.blade, viewProps: t.viewProps });
                return (
                  t.params.pages.forEach((n) => {
                    const i = new It(t.document, {
                      itemProps: k.fromObject({ selected: !1, title: n.title }),
                      props: k.fromObject({ selected: !1 })
                    });
                    e.add(i);
                  }),
                  e
                );
              },
              api: (t) => (t.controller instanceof Rt ? new Dt(t.controller, t.pool) : null)
            };
            class Ut {
              constructor() {
                (this.disabled = !1), (this.emitter = new h());
              }
              dispose() {}
              tick() {
                this.disabled || this.emitter.emit('tick', { sender: this });
              }
            }
            class Ot {
              constructor(t, e) {
                (this.disabled_ = !1),
                  (this.timerId_ = null),
                  (this.onTick_ = this.onTick_.bind(this)),
                  (this.doc_ = t),
                  (this.emitter = new h()),
                  (this.interval_ = e),
                  this.setTimer_();
              }
              get disabled() {
                return this.disabled_;
              }
              set disabled(t) {
                (this.disabled_ = t), this.disabled_ ? this.clearTimer_() : this.setTimer_();
              }
              dispose() {
                this.clearTimer_();
              }
              clearTimer_() {
                if (null === this.timerId_) return;
                const t = this.doc_.defaultView;
                t && t.clearInterval(this.timerId_), (this.timerId_ = null);
              }
              setTimer_() {
                if ((this.clearTimer_(), this.interval_ <= 0)) return;
                const t = this.doc_.defaultView;
                t && (this.timerId_ = t.setInterval(this.onTick_, this.interval_));
              }
              onTick_() {
                this.disabled_ || this.emitter.emit('tick', { sender: this });
              }
            }
            class Kt {
              constructor(t) {
                this.constraints = t;
              }
              constrain(t) {
                return this.constraints.reduce((t, e) => e.constrain(t), t);
              }
            }
            function Nt(t, e) {
              if (t instanceof e) return t;
              if (t instanceof Kt) {
                const n = t.constraints.reduce((t, n) => t || (n instanceof e ? n : null), null);
                if (n) return n;
              }
              return null;
            }
            class $t {
              constructor(t) {
                this.options = t;
              }
              constrain(t) {
                const e = this.options;
                return 0 === e.length || e.filter((e) => e.value === t).length > 0 ? t : e[0].value;
              }
            }
            class zt {
              constructor(t) {
                (this.maxValue = t.max), (this.minValue = t.min);
              }
              constrain(t) {
                let e = t;
                return r(this.minValue) || (e = Math.max(e, this.minValue)), r(this.maxValue) || (e = Math.min(e, this.maxValue)), e;
              }
            }
            class Ht {
              constructor(t) {
                this.step = t;
              }
              constrain(t) {
                return (t < 0 ? -Math.round(-t / this.step) : Math.round(t / this.step)) * this.step;
              }
            }
            const qt = v('lst');
            class Gt {
              constructor(t, e) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.props_ = e.props),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(qt()),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('select');
                n.classList.add(qt('s')),
                  g(this.props_, 'options', (e) => {
                    N(n),
                      e.forEach((e, i) => {
                        const s = t.createElement('option');
                        (s.dataset.index = String(i)), (s.textContent = e.text), (s.value = String(e.value)), n.appendChild(s);
                      });
                  }),
                  e.viewProps.bindDisabled(n),
                  this.element.appendChild(n),
                  (this.selectElement = n);
                const i = t.createElement('div');
                i.classList.add(qt('m')),
                  i.appendChild(U(t, 'dropdown')),
                  this.element.appendChild(i),
                  e.value.emitter.on('change', this.onValueChange_),
                  (this.value_ = e.value),
                  this.update_();
              }
              update_() {
                this.selectElement.value = String(this.value_.rawValue);
              }
              onValueChange_() {
                this.update_();
              }
            }
            class Yt {
              constructor(t, e) {
                (this.onSelectChange_ = this.onSelectChange_.bind(this)),
                  (this.props = e.props),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new Gt(t, { props: this.props, value: this.value, viewProps: this.viewProps })),
                  this.view.selectElement.addEventListener('change', this.onSelectChange_);
              }
              onSelectChange_(t) {
                const e = t.currentTarget.selectedOptions.item(0);
                if (!e) return;
                const n = Number(e.dataset.index);
                this.value.rawValue = this.props.get('options')[n].value;
              }
            }
            const Wt = v('pop');
            class Xt {
              constructor(t, e) {
                (this.element = t.createElement('div')),
                  this.element.classList.add(Wt()),
                  e.viewProps.bindClassModifiers(this.element),
                  b(e.shows, _(this.element, Wt(void 0, 'v')));
              }
            }
            class Qt {
              constructor(t, e) {
                (this.shows = E(!1)),
                  (this.viewProps = e.viewProps),
                  (this.view = new Xt(t, { shows: this.shows, viewProps: this.viewProps }));
              }
            }
            const Jt = v('txt');
            class Zt {
              constructor(t, e) {
                (this.onChange_ = this.onChange_.bind(this)),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(Jt()),
                  e.viewProps.bindClassModifiers(this.element),
                  (this.props_ = e.props),
                  this.props_.emitter.on('change', this.onChange_);
                const n = t.createElement('input');
                n.classList.add(Jt('i')),
                  (n.type = 'text'),
                  e.viewProps.bindDisabled(n),
                  this.element.appendChild(n),
                  (this.inputElement = n),
                  e.value.emitter.on('change', this.onChange_),
                  (this.value_ = e.value),
                  this.refresh();
              }
              refresh() {
                const t = this.props_.get('formatter');
                this.inputElement.value = t(this.value_.rawValue);
              }
              onChange_() {
                this.refresh();
              }
            }
            class te {
              constructor(t, e) {
                (this.onInputChange_ = this.onInputChange_.bind(this)),
                  (this.parser_ = e.parser),
                  (this.props = e.props),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new Zt(t, { props: e.props, value: this.value, viewProps: this.viewProps })),
                  this.view.inputElement.addEventListener('change', this.onInputChange_);
              }
              onInputChange_(t) {
                const e = t.currentTarget.value,
                  n = this.parser_(e);
                r(n) || (this.value.rawValue = n), this.view.refresh();
              }
            }
            function ee(t) {
              return 'false' !== t && !!t;
            }
            function ne(t) {
              return (function (t) {
                return String(t);
              })(t);
            }
            class ie {
              constructor(t) {
                this.text = t;
              }
              evaluate() {
                return Number(this.text);
              }
              toString() {
                return this.text;
              }
            }
            const se = {
              '**': (t, e) => Math.pow(t, e),
              '*': (t, e) => t * e,
              '/': (t, e) => t / e,
              '%': (t, e) => t % e,
              '+': (t, e) => t + e,
              '-': (t, e) => t - e,
              '<<': (t, e) => t << e,
              '>>': (t, e) => t >> e,
              '>>>': (t, e) => t >>> e,
              '&': (t, e) => t & e,
              '^': (t, e) => t ^ e,
              '|': (t, e) => t | e
            };
            class oe {
              constructor(t, e, n) {
                (this.left = e), (this.operator = t), (this.right = n);
              }
              evaluate() {
                const t = se[this.operator];
                if (!t) throw new Error(`unexpected binary operator: '${this.operator}`);
                return t(this.left.evaluate(), this.right.evaluate());
              }
              toString() {
                return ['b(', this.left.toString(), this.operator, this.right.toString(), ')'].join(' ');
              }
            }
            const re = { '+': (t) => t, '-': (t) => -t, '~': (t) => ~t };
            class ae {
              constructor(t, e) {
                (this.operator = t), (this.expression = e);
              }
              evaluate() {
                const t = re[this.operator];
                if (!t) throw new Error(`unexpected unary operator: '${this.operator}`);
                return t(this.expression.evaluate());
              }
              toString() {
                return ['u(', this.operator, this.expression.toString(), ')'].join(' ');
              }
            }
            function le(t) {
              return (e, n) => {
                for (let i = 0; i < t.length; i++) {
                  const s = t[i](e, n);
                  if ('' !== s) return s;
                }
                return '';
              };
            }
            function pe(t, e) {
              var n;
              const i = t.substr(e).match(/^\s+/);
              return null !== (n = i && i[0]) && void 0 !== n ? n : '';
            }
            function de(t, e) {
              var n;
              const i = t.substr(e).match(/^[0-9]+/);
              return null !== (n = i && i[0]) && void 0 !== n ? n : '';
            }
            function ce(t, e) {
              const n = t.substr(e, 1);
              if (((e += 1), 'e' !== n.toLowerCase())) return '';
              const i = (function (t, e) {
                const n = de(t, e);
                if ('' !== n) return n;
                const i = t.substr(e, 1);
                if ('-' !== i && '+' !== i) return '';
                const s = de(t, (e += 1));
                return '' === s ? '' : i + s;
              })(t, e);
              return '' === i ? '' : n + i;
            }
            function he(t, e) {
              const n = t.substr(e, 1);
              if ('0' === n) return n;
              const i = (function (t, e) {
                const n = t.substr(e, 1);
                return n.match(/^[1-9]$/) ? n : '';
              })(t, e);
              return (e += i.length), '' === i ? '' : i + de(t, e);
            }
            const ue = le([
              function (t, e) {
                const n = he(t, e);
                if (((e += n.length), '' === n)) return '';
                const i = t.substr(e, 1);
                if (((e += i.length), '.' !== i)) return '';
                const s = de(t, e);
                return n + i + s + ce(t, (e += s.length));
              },
              function (t, e) {
                const n = t.substr(e, 1);
                if (((e += n.length), '.' !== n)) return '';
                const i = de(t, e);
                return (e += i.length), '' === i ? '' : n + i + ce(t, e);
              },
              function (t, e) {
                const n = he(t, e);
                return (e += n.length), '' === n ? '' : n + ce(t, e);
              }
            ]);
            const ve = le([
                function (t, e) {
                  const n = t.substr(e, 2);
                  if (((e += n.length), '0b' !== n.toLowerCase())) return '';
                  const i = (function (t, e) {
                    var n;
                    const i = t.substr(e).match(/^[01]+/);
                    return null !== (n = i && i[0]) && void 0 !== n ? n : '';
                  })(t, e);
                  return '' === i ? '' : n + i;
                },
                function (t, e) {
                  const n = t.substr(e, 2);
                  if (((e += n.length), '0o' !== n.toLowerCase())) return '';
                  const i = (function (t, e) {
                    var n;
                    const i = t.substr(e).match(/^[0-7]+/);
                    return null !== (n = i && i[0]) && void 0 !== n ? n : '';
                  })(t, e);
                  return '' === i ? '' : n + i;
                },
                function (t, e) {
                  const n = t.substr(e, 2);
                  if (((e += n.length), '0x' !== n.toLowerCase())) return '';
                  const i = (function (t, e) {
                    var n;
                    const i = t.substr(e).match(/^[0-9a-f]+/i);
                    return null !== (n = i && i[0]) && void 0 !== n ? n : '';
                  })(t, e);
                  return '' === i ? '' : n + i;
                }
              ]),
              me = le([ve, ue]);
            function be(t, e) {
              return (
                (function (t, e) {
                  const n = me(t, e);
                  return (e += n.length), '' === n ? null : { evaluable: new ie(n), cursor: e };
                })(t, e) ||
                (function (t, e) {
                  const n = t.substr(e, 1);
                  if (((e += n.length), '(' !== n)) return null;
                  const i = fe(t, e);
                  if (!i) return null;
                  (e = i.cursor), (e += pe(t, e).length);
                  const s = t.substr(e, 1);
                  return (e += s.length), ')' !== s ? null : { evaluable: i.evaluable, cursor: e };
                })(t, e)
              );
            }
            function ge(t, e, n) {
              n += pe(e, n).length;
              const i = t.filter((t) => e.startsWith(t, n))[0];
              return i ? ((n += i.length), { cursor: (n += pe(e, n).length), operator: i }) : null;
            }
            const _e = [['**'], ['*', '/', '%'], ['+', '-'], ['<<', '>>>', '>>'], ['&'], ['^'], ['|']].reduce(
              (t, e) =>
                (function (t, e) {
                  return (n, i) => {
                    const s = t(n, i);
                    if (!s) return null;
                    i = s.cursor;
                    let o = s.evaluable;
                    for (;;) {
                      const s = ge(e, n, i);
                      if (!s) break;
                      i = s.cursor;
                      const r = t(n, i);
                      if (!r) return null;
                      (i = r.cursor), (o = new oe(s.operator, o, r.evaluable));
                    }
                    return o ? { cursor: i, evaluable: o } : null;
                  };
                })(t, e),
              function t(e, n) {
                const i = be(e, n);
                if (i) return i;
                const s = e.substr(n, 1);
                if (((n += s.length), '+' !== s && '-' !== s && '~' !== s)) return null;
                const o = t(e, n);
                return o ? { cursor: (n = o.cursor), evaluable: new ae(s, o.evaluable) } : null;
              }
            );
            function fe(t, e) {
              return (e += pe(t, e).length), _e(t, e);
            }
            function we(t) {
              var e;
              const n = (function (t) {
                const e = fe(t, 0);
                return e ? (e.cursor + pe(t, e.cursor).length !== t.length ? null : e.evaluable) : null;
              })(t);
              return null !== (e = null == n ? void 0 : n.evaluate()) && void 0 !== e ? e : null;
            }
            function xe(t) {
              if ('number' == typeof t) return t;
              if ('string' == typeof t) {
                const e = we(t);
                if (!r(e)) return e;
              }
              return 0;
            }
            function ye(t) {
              return String(t);
            }
            function Ce(t) {
              return (e) => e.toFixed(Math.max(Math.min(t, 20), 0));
            }
            const Pe = Ce(0);
            function Ee(t) {
              return Pe(t) + '%';
            }
            function ke(t) {
              return String(t);
            }
            function Ve(t) {
              return t;
            }
            function Se(t, e) {
              for (; t.length < e; ) t.push(void 0);
            }
            function Me(t) {
              const e = [];
              return Se(e, t), E(e);
            }
            function Le(t) {
              const e = t.indexOf(void 0);
              return e < 0 ? t : t.slice(0, e);
            }
            function Ae({ primary: t, secondary: e, forward: n, backward: i }) {
              let s = !1;
              function o(t) {
                s || ((s = !0), t(), (s = !1));
              }
              t.emitter.on('change', (i) => {
                o(() => {
                  e.setRawValue(n(t, e), i.options);
                });
              }),
                e.emitter.on('change', (s) => {
                  o(() => {
                    t.setRawValue(i(t, e), s.options);
                  }),
                    o(() => {
                      e.setRawValue(n(t, e), s.options);
                    });
                }),
                o(() => {
                  e.setRawValue(n(t, e), { forceEmit: !1, last: !0 });
                });
            }
            function Ie(t, e) {
              const n = t * (e.altKey ? 0.1 : 1) * (e.shiftKey ? 10 : 1);
              return e.upKey ? +n : e.downKey ? -n : 0;
            }
            function Te(t) {
              return { altKey: t.altKey, downKey: 'ArrowDown' === t.key, shiftKey: t.shiftKey, upKey: 'ArrowUp' === t.key };
            }
            function De(t) {
              return { altKey: t.altKey, downKey: 'ArrowLeft' === t.key, shiftKey: t.shiftKey, upKey: 'ArrowRight' === t.key };
            }
            function je(t) {
              return (
                (function (t) {
                  return 'ArrowUp' === t || 'ArrowDown' === t;
                })(t) ||
                'ArrowLeft' === t ||
                'ArrowRight' === t
              );
            }
            function Be(t, e) {
              const n = e.ownerDocument.defaultView,
                i = e.getBoundingClientRect();
              return { x: t.pageX - (((n && n.scrollX) || 0) + i.left), y: t.pageY - (((n && n.scrollY) || 0) + i.top) };
            }
            class Re {
              constructor(t) {
                (this.lastTouch_ = null),
                  (this.onDocumentMouseMove_ = this.onDocumentMouseMove_.bind(this)),
                  (this.onDocumentMouseUp_ = this.onDocumentMouseUp_.bind(this)),
                  (this.onMouseDown_ = this.onMouseDown_.bind(this)),
                  (this.onTouchEnd_ = this.onTouchEnd_.bind(this)),
                  (this.onTouchMove_ = this.onTouchMove_.bind(this)),
                  (this.onTouchStart_ = this.onTouchStart_.bind(this)),
                  (this.elem_ = t),
                  (this.emitter = new h()),
                  t.addEventListener('touchstart', this.onTouchStart_, { passive: !1 }),
                  t.addEventListener('touchmove', this.onTouchMove_, { passive: !0 }),
                  t.addEventListener('touchend', this.onTouchEnd_),
                  t.addEventListener('mousedown', this.onMouseDown_);
              }
              computePosition_(t) {
                const e = this.elem_.getBoundingClientRect();
                return { bounds: { width: e.width, height: e.height }, point: t ? { x: t.x, y: t.y } : null };
              }
              onMouseDown_(t) {
                var e;
                t.preventDefault(), null === (e = t.currentTarget) || void 0 === e || e.focus();
                const n = this.elem_.ownerDocument;
                n.addEventListener('mousemove', this.onDocumentMouseMove_),
                  n.addEventListener('mouseup', this.onDocumentMouseUp_),
                  this.emitter.emit('down', {
                    altKey: t.altKey,
                    data: this.computePosition_(Be(t, this.elem_)),
                    sender: this,
                    shiftKey: t.shiftKey
                  });
              }
              onDocumentMouseMove_(t) {
                this.emitter.emit('move', {
                  altKey: t.altKey,
                  data: this.computePosition_(Be(t, this.elem_)),
                  sender: this,
                  shiftKey: t.shiftKey
                });
              }
              onDocumentMouseUp_(t) {
                const e = this.elem_.ownerDocument;
                e.removeEventListener('mousemove', this.onDocumentMouseMove_),
                  e.removeEventListener('mouseup', this.onDocumentMouseUp_),
                  this.emitter.emit('up', {
                    altKey: t.altKey,
                    data: this.computePosition_(Be(t, this.elem_)),
                    sender: this,
                    shiftKey: t.shiftKey
                  });
              }
              onTouchStart_(t) {
                t.preventDefault();
                const e = t.targetTouches.item(0),
                  n = this.elem_.getBoundingClientRect();
                this.emitter.emit('down', {
                  altKey: t.altKey,
                  data: this.computePosition_(e ? { x: e.clientX - n.left, y: e.clientY - n.top } : void 0),
                  sender: this,
                  shiftKey: t.shiftKey
                }),
                  (this.lastTouch_ = e);
              }
              onTouchMove_(t) {
                const e = t.targetTouches.item(0),
                  n = this.elem_.getBoundingClientRect();
                this.emitter.emit('move', {
                  altKey: t.altKey,
                  data: this.computePosition_(e ? { x: e.clientX - n.left, y: e.clientY - n.top } : void 0),
                  sender: this,
                  shiftKey: t.shiftKey
                }),
                  (this.lastTouch_ = e);
              }
              onTouchEnd_(t) {
                var e;
                const n = null !== (e = t.targetTouches.item(0)) && void 0 !== e ? e : this.lastTouch_,
                  i = this.elem_.getBoundingClientRect();
                this.emitter.emit('up', {
                  altKey: t.altKey,
                  data: this.computePosition_(n ? { x: n.clientX - i.left, y: n.clientY - i.top } : void 0),
                  sender: this,
                  shiftKey: t.shiftKey
                });
              }
            }
            function Fe(t, e, n, i, s) {
              return i + ((t - e) / (n - e)) * (s - i);
            }
            function Ue(t) {
              return String(t.toFixed(10)).split('.')[1].replace(/0+$/, '').length;
            }
            function Oe(t, e, n) {
              return Math.min(Math.max(t, e), n);
            }
            function Ke(t, e) {
              return ((t % e) + e) % e;
            }
            const Ne = v('txt');
            class $e {
              constructor(t, e) {
                (this.onChange_ = this.onChange_.bind(this)),
                  (this.props_ = e.props),
                  this.props_.emitter.on('change', this.onChange_),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(Ne(), Ne(void 0, 'num')),
                  e.arrayPosition && this.element.classList.add(Ne(void 0, e.arrayPosition)),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('input');
                n.classList.add(Ne('i')),
                  (n.type = 'text'),
                  e.viewProps.bindDisabled(n),
                  this.element.appendChild(n),
                  (this.inputElement = n),
                  (this.onDraggingChange_ = this.onDraggingChange_.bind(this)),
                  (this.dragging_ = e.dragging),
                  this.dragging_.emitter.on('change', this.onDraggingChange_),
                  this.element.classList.add(Ne()),
                  this.inputElement.classList.add(Ne('i'));
                const i = t.createElement('div');
                i.classList.add(Ne('k')), this.element.appendChild(i), (this.knobElement = i);
                const s = t.createElementNS(D, 'svg');
                s.classList.add(Ne('g')), this.knobElement.appendChild(s);
                const o = t.createElementNS(D, 'path');
                o.classList.add(Ne('gb')), s.appendChild(o), (this.guideBodyElem_ = o);
                const r = t.createElementNS(D, 'path');
                r.classList.add(Ne('gh')), s.appendChild(r), (this.guideHeadElem_ = r);
                const a = t.createElement('div');
                a.classList.add(v('tt')()),
                  this.knobElement.appendChild(a),
                  (this.tooltipElem_ = a),
                  e.value.emitter.on('change', this.onChange_),
                  (this.value = e.value),
                  this.refresh();
              }
              onDraggingChange_(t) {
                if (null === t.rawValue) return void this.element.classList.remove(Ne(void 0, 'drg'));
                this.element.classList.add(Ne(void 0, 'drg'));
                const e = t.rawValue / this.props_.get('draggingScale'),
                  n = e + (e > 0 ? -1 : e < 0 ? 1 : 0),
                  i = Oe(-n, -4, 4);
                this.guideHeadElem_.setAttributeNS(null, 'd', [`M ${n + i},0 L${n},4 L${n + i},8`, `M ${e},-1 L${e},9`].join(' ')),
                  this.guideBodyElem_.setAttributeNS(null, 'd', `M 0,4 L${e},4`);
                const s = this.props_.get('formatter');
                (this.tooltipElem_.textContent = s(this.value.rawValue)), (this.tooltipElem_.style.left = `${e}px`);
              }
              refresh() {
                const t = this.props_.get('formatter');
                this.inputElement.value = t(this.value.rawValue);
              }
              onChange_() {
                this.refresh();
              }
            }
            class ze {
              constructor(t, e) {
                (this.originRawValue_ = 0),
                  (this.onInputChange_ = this.onInputChange_.bind(this)),
                  (this.onInputKeyDown_ = this.onInputKeyDown_.bind(this)),
                  (this.onInputKeyUp_ = this.onInputKeyUp_.bind(this)),
                  (this.onPointerDown_ = this.onPointerDown_.bind(this)),
                  (this.onPointerMove_ = this.onPointerMove_.bind(this)),
                  (this.onPointerUp_ = this.onPointerUp_.bind(this)),
                  (this.baseStep_ = e.baseStep),
                  (this.parser_ = e.parser),
                  (this.props = e.props),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.dragging_ = E(null)),
                  (this.view = new $e(t, {
                    arrayPosition: e.arrayPosition,
                    dragging: this.dragging_,
                    props: this.props,
                    value: this.value,
                    viewProps: this.viewProps
                  })),
                  this.view.inputElement.addEventListener('change', this.onInputChange_),
                  this.view.inputElement.addEventListener('keydown', this.onInputKeyDown_),
                  this.view.inputElement.addEventListener('keyup', this.onInputKeyUp_);
                const n = new Re(this.view.knobElement);
                n.emitter.on('down', this.onPointerDown_), n.emitter.on('move', this.onPointerMove_), n.emitter.on('up', this.onPointerUp_);
              }
              onInputChange_(t) {
                const e = t.currentTarget.value,
                  n = this.parser_(e);
                r(n) || (this.value.rawValue = n), this.view.refresh();
              }
              onInputKeyDown_(t) {
                const e = Ie(this.baseStep_, Te(t));
                0 !== e && this.value.setRawValue(this.value.rawValue + e, { forceEmit: !1, last: !1 });
              }
              onInputKeyUp_(t) {
                0 !== Ie(this.baseStep_, Te(t)) && this.value.setRawValue(this.value.rawValue, { forceEmit: !0, last: !0 });
              }
              onPointerDown_() {
                (this.originRawValue_ = this.value.rawValue), (this.dragging_.rawValue = 0);
              }
              computeDraggingValue_(t) {
                if (!t.point) return null;
                const e = t.point.x - t.bounds.width / 2;
                return this.originRawValue_ + e * this.props.get('draggingScale');
              }
              onPointerMove_(t) {
                const e = this.computeDraggingValue_(t.data);
                null !== e &&
                  (this.value.setRawValue(e, { forceEmit: !1, last: !1 }),
                  (this.dragging_.rawValue = this.value.rawValue - this.originRawValue_));
              }
              onPointerUp_(t) {
                const e = this.computeDraggingValue_(t.data);
                null !== e && (this.value.setRawValue(e, { forceEmit: !0, last: !0 }), (this.dragging_.rawValue = null));
              }
            }
            const He = v('sld');
            class qe {
              constructor(t, e) {
                (this.onChange_ = this.onChange_.bind(this)),
                  (this.props_ = e.props),
                  this.props_.emitter.on('change', this.onChange_),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(He()),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('div');
                n.classList.add(He('t')), e.viewProps.bindTabIndex(n), this.element.appendChild(n), (this.trackElement = n);
                const i = t.createElement('div');
                i.classList.add(He('k')),
                  this.trackElement.appendChild(i),
                  (this.knobElement = i),
                  e.value.emitter.on('change', this.onChange_),
                  (this.value = e.value),
                  this.update_();
              }
              update_() {
                const t = Oe(Fe(this.value.rawValue, this.props_.get('minValue'), this.props_.get('maxValue'), 0, 100), 0, 100);
                this.knobElement.style.width = `${t}%`;
              }
              onChange_() {
                this.update_();
              }
            }
            class Ge {
              constructor(t, e) {
                (this.onKeyDown_ = this.onKeyDown_.bind(this)),
                  (this.onKeyUp_ = this.onKeyUp_.bind(this)),
                  (this.onPointerDownOrMove_ = this.onPointerDownOrMove_.bind(this)),
                  (this.onPointerUp_ = this.onPointerUp_.bind(this)),
                  (this.baseStep_ = e.baseStep),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.props = e.props),
                  (this.view = new qe(t, { props: this.props, value: this.value, viewProps: this.viewProps })),
                  (this.ptHandler_ = new Re(this.view.trackElement)),
                  this.ptHandler_.emitter.on('down', this.onPointerDownOrMove_),
                  this.ptHandler_.emitter.on('move', this.onPointerDownOrMove_),
                  this.ptHandler_.emitter.on('up', this.onPointerUp_),
                  this.view.trackElement.addEventListener('keydown', this.onKeyDown_),
                  this.view.trackElement.addEventListener('keyup', this.onKeyUp_);
              }
              handlePointerEvent_(t, e) {
                t.point &&
                  this.value.setRawValue(
                    Fe(Oe(t.point.x, 0, t.bounds.width), 0, t.bounds.width, this.props.get('minValue'), this.props.get('maxValue')),
                    e
                  );
              }
              onPointerDownOrMove_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerUp_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !0, last: !0 });
              }
              onKeyDown_(t) {
                const e = Ie(this.baseStep_, De(t));
                0 !== e && this.value.setRawValue(this.value.rawValue + e, { forceEmit: !1, last: !1 });
              }
              onKeyUp_(t) {
                0 !== Ie(this.baseStep_, De(t)) && this.value.setRawValue(this.value.rawValue, { forceEmit: !0, last: !0 });
              }
            }
            const Ye = v('sldtxt');
            class We {
              constructor(t, e) {
                (this.element = t.createElement('div')), this.element.classList.add(Ye());
                const n = t.createElement('div');
                n.classList.add(Ye('s')),
                  (this.sliderView_ = e.sliderView),
                  n.appendChild(this.sliderView_.element),
                  this.element.appendChild(n);
                const i = t.createElement('div');
                i.classList.add(Ye('t')), (this.textView_ = e.textView), i.appendChild(this.textView_.element), this.element.appendChild(i);
              }
            }
            class Xe {
              constructor(t, e) {
                (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.sliderC_ = new Ge(t, { baseStep: e.baseStep, props: e.sliderProps, value: e.value, viewProps: this.viewProps })),
                  (this.textC_ = new ze(t, {
                    baseStep: e.baseStep,
                    parser: e.parser,
                    props: e.textProps,
                    value: e.value,
                    viewProps: e.viewProps
                  })),
                  (this.view = new We(t, { sliderView: this.sliderC_.view, textView: this.textC_.view }));
              }
              get sliderController() {
                return this.sliderC_;
              }
              get textController() {
                return this.textC_;
              }
            }
            function Qe(t, e) {
              t.write(e);
            }
            function Je(t) {
              const e = M;
              return Array.isArray(t)
                ? e.required.array(e.required.object({ text: e.required.string, value: e.required.raw }))(t).value
                : 'object' == typeof t
                ? e.required.raw(t).value
                : void 0;
            }
            function Ze(t) {
              if ('inline' === t || 'popup' === t) return t;
            }
            function tn(t) {
              const e = M;
              return e.required.object({ max: e.optional.number, min: e.optional.number, step: e.optional.number })(t).value;
            }
            function en(t) {
              if (Array.isArray(t)) return t;
              const e = [];
              return (
                Object.keys(t).forEach((n) => {
                  e.push({ text: n, value: t[n] });
                }),
                e
              );
            }
            function nn(t) {
              return r(t) ? null : new $t(en(t));
            }
            function sn(t) {
              const e = t ? Nt(t, $t) : null;
              return e ? e.options : null;
            }
            function on(t, e) {
              const n = t && Nt(t, Ht);
              return n ? Ue(n.step) : Math.max(Ue(e), 2);
            }
            function rn(t) {
              const e = (function (t) {
                const e = t ? Nt(t, Ht) : null;
                return e ? e.step : null;
              })(t);
              return null != e ? e : 1;
            }
            function an(t, e) {
              var n;
              const i = t && Nt(t, Ht),
                s = Math.abs(null !== (n = null == i ? void 0 : i.step) && void 0 !== n ? n : e);
              return 0 === s ? 0.1 : Math.pow(10, Math.floor(Math.log10(s)) - 1);
            }
            const ln = v('ckb');
            class pn {
              constructor(t, e) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(ln()),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('label');
                n.classList.add(ln('l')), this.element.appendChild(n);
                const i = t.createElement('input');
                i.classList.add(ln('i')),
                  (i.type = 'checkbox'),
                  n.appendChild(i),
                  (this.inputElement = i),
                  e.viewProps.bindDisabled(this.inputElement);
                const s = t.createElement('div');
                s.classList.add(ln('w')), n.appendChild(s);
                const o = U(t, 'check');
                s.appendChild(o), e.value.emitter.on('change', this.onValueChange_), (this.value = e.value), this.update_();
              }
              update_() {
                this.inputElement.checked = this.value.rawValue;
              }
              onValueChange_() {
                this.update_();
              }
            }
            class dn {
              constructor(t, e) {
                (this.onInputChange_ = this.onInputChange_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new pn(t, { value: this.value, viewProps: this.viewProps })),
                  this.view.inputElement.addEventListener('change', this.onInputChange_);
              }
              onInputChange_(t) {
                const e = t.currentTarget;
                this.value.rawValue = e.checked;
              }
            }
            const cn = {
                id: 'input-bool',
                type: 'input',
                accept: (t, e) => {
                  if ('boolean' != typeof t) return null;
                  const n = L(e, { options: M.optional.custom(Je) });
                  return n ? { initialValue: t, params: n } : null;
                },
                binding: {
                  reader: (t) => ee,
                  constraint: (t) =>
                    (function (t) {
                      const e = [],
                        n = nn(t.options);
                      return n && e.push(n), new Kt(e);
                    })(t.params),
                  writer: (t) => Qe
                },
                controller: (t) => {
                  var e;
                  const n = t.document,
                    i = t.value,
                    s = t.constraint;
                  return s && Nt(s, $t)
                    ? new Yt(n, {
                        props: k.fromObject({ options: null !== (e = sn(s)) && void 0 !== e ? e : [] }),
                        value: i,
                        viewProps: t.viewProps
                      })
                    : new dn(n, { value: i, viewProps: t.viewProps });
                }
              },
              hn = v('col');
            class un {
              constructor(t, e) {
                (this.element = t.createElement('div')),
                  this.element.classList.add(hn()),
                  e.foldable.bindExpandedClass(this.element, hn(void 0, 'expanded')),
                  g(e.foldable, 'completed', _(this.element, hn(void 0, 'cpl')));
                const n = t.createElement('div');
                n.classList.add(hn('h')), this.element.appendChild(n);
                const i = t.createElement('div');
                i.classList.add(hn('s')), n.appendChild(i), (this.swatchElement = i);
                const s = t.createElement('div');
                if ((s.classList.add(hn('t')), n.appendChild(s), (this.textElement = s), 'inline' === e.pickerLayout)) {
                  const e = t.createElement('div');
                  e.classList.add(hn('p')), this.element.appendChild(e), (this.pickerElement = e);
                } else this.pickerElement = null;
              }
            }
            function vn(t, e, n) {
              const i = Ke(t, 360),
                s = Oe(e / 100, 0, 1),
                o = Oe(n / 100, 0, 1),
                r = o * s,
                a = r * (1 - Math.abs(((i / 60) % 2) - 1)),
                l = o - r;
              let p, d, c;
              return (
                ([p, d, c] =
                  i >= 0 && i < 60
                    ? [r, a, 0]
                    : i >= 60 && i < 120
                    ? [a, r, 0]
                    : i >= 120 && i < 180
                    ? [0, r, a]
                    : i >= 180 && i < 240
                    ? [0, a, r]
                    : i >= 240 && i < 300
                    ? [a, 0, r]
                    : [r, 0, a]),
                [255 * (p + l), 255 * (d + l), 255 * (c + l)]
              );
            }
            function mn(t) {
              return [t[0], t[1], t[2]];
            }
            function bn(t, e) {
              return [t[0], t[1], t[2], e];
            }
            const gn = {
              hsl: {
                hsl: (t, e, n) => [t, e, n],
                hsv: function (t, e, n) {
                  const i = n + (e * (100 - Math.abs(2 * n - 100))) / 200;
                  return [t, 0 !== i ? (e * (100 - Math.abs(2 * n - 100))) / i : 0, n + (e * (100 - Math.abs(2 * n - 100))) / 200];
                },
                rgb: function (t, e, n) {
                  const i = ((t % 360) + 360) % 360,
                    s = Oe(e / 100, 0, 1),
                    o = Oe(n / 100, 0, 1),
                    r = (1 - Math.abs(2 * o - 1)) * s,
                    a = r * (1 - Math.abs(((i / 60) % 2) - 1)),
                    l = o - r / 2;
                  let p, d, c;
                  return (
                    ([p, d, c] =
                      i >= 0 && i < 60
                        ? [r, a, 0]
                        : i >= 60 && i < 120
                        ? [a, r, 0]
                        : i >= 120 && i < 180
                        ? [0, r, a]
                        : i >= 180 && i < 240
                        ? [0, a, r]
                        : i >= 240 && i < 300
                        ? [a, 0, r]
                        : [r, 0, a]),
                    [255 * (p + l), 255 * (d + l), 255 * (c + l)]
                  );
                }
              },
              hsv: {
                hsl: function (t, e, n) {
                  const i = 100 - Math.abs((n * (200 - e)) / 100 - 100);
                  return [t, 0 !== i ? (e * n) / i : 0, (n * (200 - e)) / 200];
                },
                hsv: (t, e, n) => [t, e, n],
                rgb: vn
              },
              rgb: {
                hsl: function (t, e, n) {
                  const i = Oe(t / 255, 0, 1),
                    s = Oe(e / 255, 0, 1),
                    o = Oe(n / 255, 0, 1),
                    r = Math.max(i, s, o),
                    a = Math.min(i, s, o),
                    l = r - a;
                  let p = 0,
                    d = 0;
                  const c = (a + r) / 2;
                  return (
                    0 !== l &&
                      ((d = l / (1 - Math.abs(r + a - 1))),
                      (p = i === r ? (s - o) / l : s === r ? 2 + (o - i) / l : 4 + (i - s) / l),
                      (p = p / 6 + (p < 0 ? 1 : 0))),
                    [360 * p, 100 * d, 100 * c]
                  );
                },
                hsv: function (t, e, n) {
                  const i = Oe(t / 255, 0, 1),
                    s = Oe(e / 255, 0, 1),
                    o = Oe(n / 255, 0, 1),
                    r = Math.max(i, s, o),
                    a = r - Math.min(i, s, o);
                  let l;
                  return (
                    (l =
                      0 === a
                        ? 0
                        : r === i
                        ? (((((s - o) / a) % 6) + 6) % 6) * 60
                        : r === s
                        ? 60 * ((o - i) / a + 2)
                        : 60 * ((i - s) / a + 4)),
                    [l, 100 * (0 === r ? 0 : a / r), 100 * r]
                  );
                },
                rgb: (t, e, n) => [t, e, n]
              }
            };
            const _n = {
              hsl: (t) => {
                var e;
                return [Ke(t[0], 360), Oe(t[1], 0, 100), Oe(t[2], 0, 100), Oe(null !== (e = t[3]) && void 0 !== e ? e : 1, 0, 1)];
              },
              hsv: (t) => {
                var e;
                return [Ke(t[0], 360), Oe(t[1], 0, 100), Oe(t[2], 0, 100), Oe(null !== (e = t[3]) && void 0 !== e ? e : 1, 0, 1)];
              },
              rgb: (t) => {
                var e;
                return [Oe(t[0], 0, 255), Oe(t[1], 0, 255), Oe(t[2], 0, 255), Oe(null !== (e = t[3]) && void 0 !== e ? e : 1, 0, 1)];
              }
            };
            function fn(t, e) {
              return 'object' == typeof t && !r(t) && e in t && 'number' == typeof t[e];
            }
            class wn {
              constructor(t, e) {
                (this.mode_ = e), (this.comps_ = _n[e](t));
              }
              static black() {
                return new wn([0, 0, 0], 'rgb');
              }
              static fromObject(t) {
                const e = 'a' in t ? [t.r, t.g, t.b, t.a] : [t.r, t.g, t.b];
                return new wn(e, 'rgb');
              }
              static toRgbaObject(t) {
                return t.toRgbaObject();
              }
              static isRgbColorObject(t) {
                return fn(t, 'r') && fn(t, 'g') && fn(t, 'b');
              }
              static isRgbaColorObject(t) {
                return this.isRgbColorObject(t) && fn(t, 'a');
              }
              static isColorObject(t) {
                return this.isRgbColorObject(t);
              }
              static equals(t, e) {
                if (t.mode_ !== e.mode_) return !1;
                const n = t.comps_,
                  i = e.comps_;
                for (let t = 0; t < n.length; t++) if (n[t] !== i[t]) return !1;
                return !0;
              }
              get mode() {
                return this.mode_;
              }
              getComponents(t) {
                return bn(((e = mn(this.comps_)), (n = this.mode_), (i = t || this.mode_), gn[n][i](...e)), this.comps_[3]);
                var e, n, i;
              }
              toRgbaObject() {
                const t = this.getComponents('rgb');
                return { r: t[0], g: t[1], b: t[2], a: t[3] };
              }
            }
            const xn = v('colp');
            class yn {
              constructor(t, e) {
                (this.alphaViews_ = null), (this.element = t.createElement('div')), this.element.classList.add(xn());
                const n = t.createElement('div');
                n.classList.add(xn('hsv'));
                const i = t.createElement('div');
                i.classList.add(xn('sv')),
                  (this.svPaletteView_ = e.svPaletteView),
                  i.appendChild(this.svPaletteView_.element),
                  n.appendChild(i);
                const s = t.createElement('div');
                s.classList.add(xn('h')),
                  (this.hPaletteView_ = e.hPaletteView),
                  s.appendChild(this.hPaletteView_.element),
                  n.appendChild(s),
                  this.element.appendChild(n);
                const o = t.createElement('div');
                if (
                  (o.classList.add(xn('rgb')),
                  (this.textView_ = e.textView),
                  o.appendChild(this.textView_.element),
                  this.element.appendChild(o),
                  e.alphaViews)
                ) {
                  this.alphaViews_ = { palette: e.alphaViews.palette, text: e.alphaViews.text };
                  const n = t.createElement('div');
                  n.classList.add(xn('a'));
                  const i = t.createElement('div');
                  i.classList.add(xn('ap')), i.appendChild(this.alphaViews_.palette.element), n.appendChild(i);
                  const s = t.createElement('div');
                  s.classList.add(xn('at')), s.appendChild(this.alphaViews_.text.element), n.appendChild(s), this.element.appendChild(n);
                }
              }
              get allFocusableElements() {
                const t = [
                  this.svPaletteView_.element,
                  this.hPaletteView_.element,
                  this.textView_.modeSelectElement,
                  ...this.textView_.textViews.map((t) => t.inputElement)
                ];
                return this.alphaViews_ && t.push(this.alphaViews_.palette.element, this.alphaViews_.text.inputElement), t;
              }
            }
            function Cn(t) {
              const e = M;
              return L(t, { alpha: e.optional.boolean, expanded: e.optional.boolean, picker: e.optional.custom(Ze) });
            }
            function Pn(t) {
              return t ? 0.1 : 1;
            }
            function En(t, e) {
              const n = t.match(/^(.+)%$/);
              return n ? Math.min(0.01 * parseFloat(n[1]) * e, e) : Math.min(parseFloat(t), e);
            }
            const kn = { deg: (t) => t, grad: (t) => (360 * t) / 400, rad: (t) => (360 * t) / (2 * Math.PI), turn: (t) => 360 * t };
            function Vn(t) {
              const e = t.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);
              if (!e) return parseFloat(t);
              const n = parseFloat(e[1]),
                i = e[2];
              return kn[i](n);
            }
            const Sn = {
              'func.rgb': (t) => {
                const e = t.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
                if (!e) return null;
                const n = [En(e[1], 255), En(e[2], 255), En(e[3], 255)];
                return isNaN(n[0]) || isNaN(n[1]) || isNaN(n[2]) ? null : new wn(n, 'rgb');
              },
              'func.rgba': (t) => {
                const e = t.match(
                  /^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/
                );
                if (!e) return null;
                const n = [En(e[1], 255), En(e[2], 255), En(e[3], 255), En(e[4], 1)];
                return isNaN(n[0]) || isNaN(n[1]) || isNaN(n[2]) || isNaN(n[3]) ? null : new wn(n, 'rgb');
              },
              'func.hsl': (t) => {
                const e = t.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
                if (!e) return null;
                const n = [Vn(e[1]), En(e[2], 100), En(e[3], 100)];
                return isNaN(n[0]) || isNaN(n[1]) || isNaN(n[2]) ? null : new wn(n, 'hsl');
              },
              'func.hsla': (t) => {
                const e = t.match(
                  /^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/
                );
                if (!e) return null;
                const n = [Vn(e[1]), En(e[2], 100), En(e[3], 100), En(e[4], 1)];
                return isNaN(n[0]) || isNaN(n[1]) || isNaN(n[2]) || isNaN(n[3]) ? null : new wn(n, 'hsl');
              },
              'hex.rgb': (t) => {
                const e = t.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
                if (e) return new wn([parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16)], 'rgb');
                const n = t.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
                return n ? new wn([parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16)], 'rgb') : null;
              },
              'hex.rgba': (t) => {
                const e = t.match(/^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
                if (e)
                  return new wn(
                    [
                      parseInt(e[1] + e[1], 16),
                      parseInt(e[2] + e[2], 16),
                      parseInt(e[3] + e[3], 16),
                      Fe(parseInt(e[4] + e[4], 16), 0, 255, 0, 1)
                    ],
                    'rgb'
                  );
                const n = t.match(/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
                return n
                  ? new wn([parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16), Fe(parseInt(n[4], 16), 0, 255, 0, 1)], 'rgb')
                  : null;
              }
            };
            function Mn(t) {
              return Object.keys(Sn).reduce((e, n) => e || ((0, Sn[n])(t) ? n : null), null);
            }
            const Ln = (t) => {
              const e = Mn(t);
              return e ? Sn[e](t) : null;
            };
            function An(t) {
              return 'func.hsla' === t || 'func.rgba' === t || 'hex.rgba' === t;
            }
            function In(t) {
              if ('string' == typeof t) {
                const e = Ln(t);
                if (e) return e;
              }
              return wn.black();
            }
            function Tn(t) {
              const e = Oe(Math.floor(t), 0, 255).toString(16);
              return 1 === e.length ? `0${e}` : e;
            }
            function Dn(t, e = '#') {
              return `${e}${mn(t.getComponents('rgb')).map(Tn).join('')}`;
            }
            function jn(t, e = '#') {
              const n = t.getComponents('rgb');
              return `${e}${[n[0], n[1], n[2], 255 * n[3]].map(Tn).join('')}`;
            }
            function Bn(t) {
              const e = Ce(0);
              return `rgb(${mn(t.getComponents('rgb'))
                .map((t) => e(t))
                .join(', ')})`;
            }
            function Rn(t) {
              const e = Ce(2),
                n = Ce(0);
              return `rgba(${t
                .getComponents('rgb')
                .map((t, i) => (3 === i ? e : n)(t))
                .join(', ')})`;
            }
            const Fn = {
              'func.hsl': function (t) {
                const e = [Ce(0), Ee, Ee];
                return `hsl(${mn(t.getComponents('hsl'))
                  .map((t, n) => e[n](t))
                  .join(', ')})`;
              },
              'func.hsla': function (t) {
                const e = [Ce(0), Ee, Ee, Ce(2)];
                return `hsla(${t
                  .getComponents('hsl')
                  .map((t, n) => e[n](t))
                  .join(', ')})`;
              },
              'func.rgb': Bn,
              'func.rgba': Rn,
              'hex.rgb': Dn,
              'hex.rgba': jn
            };
            function Un(t) {
              return Fn[t];
            }
            const On = v('apl');
            class Kn {
              constructor(t, e) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.value = e.value),
                  this.value.emitter.on('change', this.onValueChange_),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(On()),
                  e.viewProps.bindTabIndex(this.element);
                const n = t.createElement('div');
                n.classList.add(On('b')), this.element.appendChild(n);
                const i = t.createElement('div');
                i.classList.add(On('c')), n.appendChild(i), (this.colorElem_ = i);
                const s = t.createElement('div');
                s.classList.add(On('m')), this.element.appendChild(s), (this.markerElem_ = s);
                const o = t.createElement('div');
                o.classList.add(On('p')), this.markerElem_.appendChild(o), (this.previewElem_ = o), this.update_();
              }
              update_() {
                const t = this.value.rawValue,
                  e = t.getComponents('rgb'),
                  n = new wn([e[0], e[1], e[2], 0], 'rgb'),
                  i = new wn([e[0], e[1], e[2], 255], 'rgb'),
                  s = ['to right', Rn(n), Rn(i)];
                (this.colorElem_.style.background = `linear-gradient(${s.join(',')})`), (this.previewElem_.style.backgroundColor = Rn(t));
                const o = Fe(e[3], 0, 1, 0, 100);
                this.markerElem_.style.left = `${o}%`;
              }
              onValueChange_() {
                this.update_();
              }
            }
            class Nn {
              constructor(t, e) {
                (this.onKeyDown_ = this.onKeyDown_.bind(this)),
                  (this.onKeyUp_ = this.onKeyUp_.bind(this)),
                  (this.onPointerDown_ = this.onPointerDown_.bind(this)),
                  (this.onPointerMove_ = this.onPointerMove_.bind(this)),
                  (this.onPointerUp_ = this.onPointerUp_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new Kn(t, { value: this.value, viewProps: this.viewProps })),
                  (this.ptHandler_ = new Re(this.view.element)),
                  this.ptHandler_.emitter.on('down', this.onPointerDown_),
                  this.ptHandler_.emitter.on('move', this.onPointerMove_),
                  this.ptHandler_.emitter.on('up', this.onPointerUp_),
                  this.view.element.addEventListener('keydown', this.onKeyDown_),
                  this.view.element.addEventListener('keyup', this.onKeyUp_);
              }
              handlePointerEvent_(t, e) {
                if (!t.point) return;
                const n = t.point.x / t.bounds.width,
                  i = this.value.rawValue,
                  [s, o, r] = i.getComponents('hsv');
                this.value.setRawValue(new wn([s, o, r, n], 'hsv'), e);
              }
              onPointerDown_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerMove_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerUp_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !0, last: !0 });
              }
              onKeyDown_(t) {
                const e = Ie(Pn(!0), De(t));
                if (0 === e) return;
                const n = this.value.rawValue,
                  [i, s, o, r] = n.getComponents('hsv');
                this.value.setRawValue(new wn([i, s, o, r + e], 'hsv'), { forceEmit: !1, last: !1 });
              }
              onKeyUp_(t) {
                0 !== Ie(Pn(!0), De(t)) && this.value.setRawValue(this.value.rawValue, { forceEmit: !0, last: !0 });
              }
            }
            const $n = v('coltxt');
            class zn {
              constructor(t, e) {
                (this.element = t.createElement('div')), this.element.classList.add($n());
                const n = t.createElement('div');
                n.classList.add($n('m')),
                  (this.modeElem_ = (function (t) {
                    const e = t.createElement('select');
                    return (
                      e.appendChild(
                        [
                          { text: 'RGB', value: 'rgb' },
                          { text: 'HSL', value: 'hsl' },
                          { text: 'HSV', value: 'hsv' }
                        ].reduce((e, n) => {
                          const i = t.createElement('option');
                          return (i.textContent = n.text), (i.value = n.value), e.appendChild(i), e;
                        }, t.createDocumentFragment())
                      ),
                      e
                    );
                  })(t)),
                  this.modeElem_.classList.add($n('ms')),
                  n.appendChild(this.modeSelectElement);
                const i = t.createElement('div');
                i.classList.add($n('mm')), i.appendChild(U(t, 'dropdown')), n.appendChild(i), this.element.appendChild(n);
                const s = t.createElement('div');
                s.classList.add($n('w')),
                  this.element.appendChild(s),
                  (this.textsElem_ = s),
                  (this.textViews_ = e.textViews),
                  this.applyTextViews_(),
                  b(e.colorMode, (t) => {
                    this.modeElem_.value = t;
                  });
              }
              get modeSelectElement() {
                return this.modeElem_;
              }
              get textViews() {
                return this.textViews_;
              }
              set textViews(t) {
                (this.textViews_ = t), this.applyTextViews_();
              }
              applyTextViews_() {
                N(this.textsElem_);
                const t = this.element.ownerDocument;
                this.textViews_.forEach((e) => {
                  const n = t.createElement('div');
                  n.classList.add($n('c')), n.appendChild(e.element), this.textsElem_.appendChild(n);
                });
              }
            }
            const Hn = Ce(0),
              qn = {
                rgb: () => new zt({ min: 0, max: 255 }),
                hsl: (t) => new zt(0 === t ? { min: 0, max: 360 } : { min: 0, max: 100 }),
                hsv: (t) => new zt(0 === t ? { min: 0, max: 360 } : { min: 0, max: 100 })
              };
            function Gn(t, e, n) {
              return new ze(t, {
                arrayPosition: 0 === n ? 'fst' : 2 === n ? 'lst' : 'mid',
                baseStep: Pn(!1),
                parser: e.parser,
                props: k.fromObject({ draggingScale: 1, formatter: Hn }),
                value: E(0, { constraint: qn[e.colorMode](n) }),
                viewProps: e.viewProps
              });
            }
            class Yn {
              constructor(t, e) {
                (this.onModeSelectChange_ = this.onModeSelectChange_.bind(this)),
                  (this.parser_ = e.parser),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.colorMode = E(this.value.rawValue.mode)),
                  (this.ccs_ = this.createComponentControllers_(t)),
                  (this.view = new zn(t, {
                    colorMode: this.colorMode,
                    textViews: [this.ccs_[0].view, this.ccs_[1].view, this.ccs_[2].view]
                  })),
                  this.view.modeSelectElement.addEventListener('change', this.onModeSelectChange_);
              }
              createComponentControllers_(t) {
                const e = { colorMode: this.colorMode.rawValue, parser: this.parser_, viewProps: this.viewProps },
                  n = [Gn(t, e, 0), Gn(t, e, 1), Gn(t, e, 2)];
                return (
                  n.forEach((t, e) => {
                    Ae({
                      primary: this.value,
                      secondary: t.value,
                      forward: (t) => t.rawValue.getComponents(this.colorMode.rawValue)[e],
                      backward: (t, n) => {
                        const i = this.colorMode.rawValue,
                          s = t.rawValue.getComponents(i);
                        return (s[e] = n.rawValue), new wn(bn(mn(s), s[3]), i);
                      }
                    });
                  }),
                  n
                );
              }
              onModeSelectChange_(t) {
                const e = t.currentTarget;
                (this.colorMode.rawValue = e.value),
                  (this.ccs_ = this.createComponentControllers_(this.view.element.ownerDocument)),
                  (this.view.textViews = [this.ccs_[0].view, this.ccs_[1].view, this.ccs_[2].view]);
              }
            }
            const Wn = v('hpl');
            class Xn {
              constructor(t, e) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.value = e.value),
                  this.value.emitter.on('change', this.onValueChange_),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(Wn()),
                  e.viewProps.bindTabIndex(this.element);
                const n = t.createElement('div');
                n.classList.add(Wn('c')), this.element.appendChild(n);
                const i = t.createElement('div');
                i.classList.add(Wn('m')), this.element.appendChild(i), (this.markerElem_ = i), this.update_();
              }
              update_() {
                const t = this.value.rawValue,
                  [e] = t.getComponents('hsv');
                this.markerElem_.style.backgroundColor = Bn(new wn([e, 100, 100], 'hsv'));
                const n = Fe(e, 0, 360, 0, 100);
                this.markerElem_.style.left = `${n}%`;
              }
              onValueChange_() {
                this.update_();
              }
            }
            class Qn {
              constructor(t, e) {
                (this.onKeyDown_ = this.onKeyDown_.bind(this)),
                  (this.onKeyUp_ = this.onKeyUp_.bind(this)),
                  (this.onPointerDown_ = this.onPointerDown_.bind(this)),
                  (this.onPointerMove_ = this.onPointerMove_.bind(this)),
                  (this.onPointerUp_ = this.onPointerUp_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new Xn(t, { value: this.value, viewProps: this.viewProps })),
                  (this.ptHandler_ = new Re(this.view.element)),
                  this.ptHandler_.emitter.on('down', this.onPointerDown_),
                  this.ptHandler_.emitter.on('move', this.onPointerMove_),
                  this.ptHandler_.emitter.on('up', this.onPointerUp_),
                  this.view.element.addEventListener('keydown', this.onKeyDown_),
                  this.view.element.addEventListener('keyup', this.onKeyUp_);
              }
              handlePointerEvent_(t, e) {
                if (!t.point) return;
                const n = Fe(t.point.x, 0, t.bounds.width, 0, 360),
                  i = this.value.rawValue,
                  [, s, o, r] = i.getComponents('hsv');
                this.value.setRawValue(new wn([n, s, o, r], 'hsv'), e);
              }
              onPointerDown_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerMove_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerUp_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !0, last: !0 });
              }
              onKeyDown_(t) {
                const e = Ie(Pn(!1), De(t));
                if (0 === e) return;
                const n = this.value.rawValue,
                  [i, s, o, r] = n.getComponents('hsv');
                this.value.setRawValue(new wn([i + e, s, o, r], 'hsv'), { forceEmit: !1, last: !1 });
              }
              onKeyUp_(t) {
                0 !== Ie(Pn(!1), De(t)) && this.value.setRawValue(this.value.rawValue, { forceEmit: !0, last: !0 });
              }
            }
            const Jn = v('svp');
            class Zn {
              constructor(t, e) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.value = e.value),
                  this.value.emitter.on('change', this.onValueChange_),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(Jn()),
                  e.viewProps.bindTabIndex(this.element);
                const n = t.createElement('canvas');
                (n.height = 64), (n.width = 64), n.classList.add(Jn('c')), this.element.appendChild(n), (this.canvasElement = n);
                const i = t.createElement('div');
                i.classList.add(Jn('m')), this.element.appendChild(i), (this.markerElem_ = i), this.update_();
              }
              update_() {
                const t = (function (t) {
                  const e = t.ownerDocument.defaultView;
                  return e && 'document' in e ? t.getContext('2d') : null;
                })(this.canvasElement);
                if (!t) return;
                const e = this.value.rawValue.getComponents('hsv'),
                  n = this.canvasElement.width,
                  i = this.canvasElement.height,
                  s = t.getImageData(0, 0, n, i),
                  o = s.data;
                for (let t = 0; t < i; t++)
                  for (let s = 0; s < n; s++) {
                    const r = Fe(s, 0, n, 0, 100),
                      a = Fe(t, 0, i, 100, 0),
                      l = vn(e[0], r, a),
                      p = 4 * (t * n + s);
                    (o[p] = l[0]), (o[p + 1] = l[1]), (o[p + 2] = l[2]), (o[p + 3] = 255);
                  }
                t.putImageData(s, 0, 0);
                const r = Fe(e[1], 0, 100, 0, 100);
                this.markerElem_.style.left = `${r}%`;
                const a = Fe(e[2], 0, 100, 100, 0);
                this.markerElem_.style.top = `${a}%`;
              }
              onValueChange_() {
                this.update_();
              }
            }
            class ti {
              constructor(t, e) {
                (this.onKeyDown_ = this.onKeyDown_.bind(this)),
                  (this.onKeyUp_ = this.onKeyUp_.bind(this)),
                  (this.onPointerDown_ = this.onPointerDown_.bind(this)),
                  (this.onPointerMove_ = this.onPointerMove_.bind(this)),
                  (this.onPointerUp_ = this.onPointerUp_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new Zn(t, { value: this.value, viewProps: this.viewProps })),
                  (this.ptHandler_ = new Re(this.view.element)),
                  this.ptHandler_.emitter.on('down', this.onPointerDown_),
                  this.ptHandler_.emitter.on('move', this.onPointerMove_),
                  this.ptHandler_.emitter.on('up', this.onPointerUp_),
                  this.view.element.addEventListener('keydown', this.onKeyDown_),
                  this.view.element.addEventListener('keyup', this.onKeyUp_);
              }
              handlePointerEvent_(t, e) {
                if (!t.point) return;
                const n = Fe(t.point.x, 0, t.bounds.width, 0, 100),
                  i = Fe(t.point.y, 0, t.bounds.height, 100, 0),
                  [s, , , o] = this.value.rawValue.getComponents('hsv');
                this.value.setRawValue(new wn([s, n, i, o], 'hsv'), e);
              }
              onPointerDown_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerMove_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerUp_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !0, last: !0 });
              }
              onKeyDown_(t) {
                je(t.key) && t.preventDefault();
                const [e, n, i, s] = this.value.rawValue.getComponents('hsv'),
                  o = Pn(!1),
                  r = Ie(o, De(t)),
                  a = Ie(o, Te(t));
                (0 === r && 0 === a) || this.value.setRawValue(new wn([e, n + r, i + a, s], 'hsv'), { forceEmit: !1, last: !1 });
              }
              onKeyUp_(t) {
                const e = Pn(!1),
                  n = Ie(e, De(t)),
                  i = Ie(e, Te(t));
                (0 === n && 0 === i) || this.value.setRawValue(this.value.rawValue, { forceEmit: !0, last: !0 });
              }
            }
            class ei {
              constructor(t, e) {
                (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.hPaletteC_ = new Qn(t, { value: this.value, viewProps: this.viewProps })),
                  (this.svPaletteC_ = new ti(t, { value: this.value, viewProps: this.viewProps })),
                  (this.alphaIcs_ = e.supportsAlpha
                    ? {
                        palette: new Nn(t, { value: this.value, viewProps: this.viewProps }),
                        text: new ze(t, {
                          parser: we,
                          baseStep: 0.1,
                          props: k.fromObject({ draggingScale: 0.01, formatter: Ce(2) }),
                          value: E(0, { constraint: new zt({ min: 0, max: 1 }) }),
                          viewProps: this.viewProps
                        })
                      }
                    : null),
                  this.alphaIcs_ &&
                    Ae({
                      primary: this.value,
                      secondary: this.alphaIcs_.text.value,
                      forward: (t) => t.rawValue.getComponents()[3],
                      backward: (t, e) => {
                        const n = t.rawValue.getComponents();
                        return (n[3] = e.rawValue), new wn(n, t.rawValue.mode);
                      }
                    }),
                  (this.textC_ = new Yn(t, { parser: we, value: this.value, viewProps: this.viewProps })),
                  (this.view = new yn(t, {
                    alphaViews: this.alphaIcs_ ? { palette: this.alphaIcs_.palette.view, text: this.alphaIcs_.text.view } : null,
                    hPaletteView: this.hPaletteC_.view,
                    supportsAlpha: e.supportsAlpha,
                    svPaletteView: this.svPaletteC_.view,
                    textView: this.textC_.view
                  }));
              }
              get textController() {
                return this.textC_;
              }
            }
            const ni = v('colsw');
            class ii {
              constructor(t, e) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  e.value.emitter.on('change', this.onValueChange_),
                  (this.value = e.value),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(ni()),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('div');
                n.classList.add(ni('sw')), this.element.appendChild(n), (this.swatchElem_ = n);
                const i = t.createElement('button');
                i.classList.add(ni('b')),
                  e.viewProps.bindDisabled(i),
                  this.element.appendChild(i),
                  (this.buttonElement = i),
                  this.update_();
              }
              update_() {
                const t = this.value.rawValue;
                this.swatchElem_.style.backgroundColor = jn(t);
              }
              onValueChange_() {
                this.update_();
              }
            }
            class si {
              constructor(t, e) {
                (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new ii(t, { value: this.value, viewProps: this.viewProps }));
              }
            }
            class oi {
              constructor(t, e) {
                (this.onButtonBlur_ = this.onButtonBlur_.bind(this)),
                  (this.onButtonClick_ = this.onButtonClick_.bind(this)),
                  (this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this)),
                  (this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.foldable_ = X.create(e.expanded)),
                  (this.swatchC_ = new si(t, { value: this.value, viewProps: this.viewProps }));
                const n = this.swatchC_.view.buttonElement;
                n.addEventListener('blur', this.onButtonBlur_),
                  n.addEventListener('click', this.onButtonClick_),
                  (this.textC_ = new te(t, {
                    parser: e.parser,
                    props: k.fromObject({ formatter: e.formatter }),
                    value: this.value,
                    viewProps: this.viewProps
                  })),
                  (this.view = new un(t, { foldable: this.foldable_, pickerLayout: e.pickerLayout })),
                  this.view.swatchElement.appendChild(this.swatchC_.view.element),
                  this.view.textElement.appendChild(this.textC_.view.element),
                  (this.popC_ = 'popup' === e.pickerLayout ? new Qt(t, { viewProps: this.viewProps }) : null);
                const i = new ei(t, { supportsAlpha: e.supportsAlpha, value: this.value, viewProps: this.viewProps });
                i.view.allFocusableElements.forEach((t) => {
                  t.addEventListener('blur', this.onPopupChildBlur_), t.addEventListener('keydown', this.onPopupChildKeydown_);
                }),
                  (this.pickerC_ = i),
                  this.popC_
                    ? (this.view.element.appendChild(this.popC_.view.element),
                      this.popC_.view.element.appendChild(i.view.element),
                      Ae({
                        primary: this.foldable_.value('expanded'),
                        secondary: this.popC_.shows,
                        forward: (t) => t.rawValue,
                        backward: (t, e) => e.rawValue
                      }))
                    : this.view.pickerElement &&
                      (this.view.pickerElement.appendChild(this.pickerC_.view.element), J(this.foldable_, this.view.pickerElement));
              }
              get textController() {
                return this.textC_;
              }
              onButtonBlur_(t) {
                if (!this.popC_) return;
                const e = this.view.element,
                  n = t.relatedTarget;
                (n && e.contains(n)) || (this.popC_.shows.rawValue = !1);
              }
              onButtonClick_() {
                this.foldable_.set('expanded', !this.foldable_.get('expanded')),
                  this.foldable_.get('expanded') && this.pickerC_.view.allFocusableElements[0].focus();
              }
              onPopupChildBlur_(t) {
                if (!this.popC_) return;
                const e = this.popC_.view.element,
                  n = $(t);
                (n && e.contains(n)) ||
                  (n && n === this.swatchC_.view.buttonElement && !B(e.ownerDocument)) ||
                  (this.popC_.shows.rawValue = !1);
              }
              onPopupChildKeydown_(t) {
                this.popC_
                  ? 'Escape' === t.key && (this.popC_.shows.rawValue = !1)
                  : this.view.pickerElement && 'Escape' === t.key && this.swatchC_.view.buttonElement.focus();
              }
            }
            function ri(t) {
              return wn.isColorObject(t) ? wn.fromObject(t) : wn.black();
            }
            function ai(t) {
              return mn(t.getComponents('rgb')).reduce((t, e) => (t << 8) | (255 & Math.floor(e)), 0);
            }
            function li(t) {
              return t.getComponents('rgb').reduce((t, e, n) => (t << 8) | (255 & Math.floor(3 === n ? 255 * e : e)), 0) >>> 0;
            }
            function pi(t) {
              return 'number' != typeof t ? wn.black() : new wn([((e = t) >> 16) & 255, (e >> 8) & 255, 255 & e], 'rgb');
              var e;
            }
            function di(t) {
              return 'number' != typeof t
                ? wn.black()
                : new wn([((e = t) >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, Fe(255 & e, 0, 255, 0, 1)], 'rgb');
              var e;
            }
            function ci(t, e) {
              const n = e.toRgbaObject();
              t.writeProperty('r', n.r), t.writeProperty('g', n.g), t.writeProperty('b', n.b), t.writeProperty('a', n.a);
            }
            function hi(t, e) {
              const n = e.toRgbaObject();
              t.writeProperty('r', n.r), t.writeProperty('g', n.g), t.writeProperty('b', n.b);
            }
            function ui(t) {
              return 'alpha' in t && !0 === t.alpha;
            }
            function vi(t) {
              return t ? (t) => jn(t, '0x') : (t) => Dn(t, '0x');
            }
            const mi = {
              id: 'input-color-number',
              type: 'input',
              accept: (t, e) => {
                if ('number' != typeof t) return null;
                if (!('view' in e)) return null;
                if ('color' !== e.view) return null;
                const n = Cn(e);
                return n ? { initialValue: t, params: n } : null;
              },
              binding: {
                reader: (t) => (ui(t.params) ? di : pi),
                equals: wn.equals,
                writer: (t) =>
                  (function (t) {
                    const e = t ? li : ai;
                    return (t, n) => {
                      Qe(t, e(n));
                    };
                  })(ui(t.params))
              },
              controller: (t) => {
                const e = ui(t.params),
                  n = 'expanded' in t.params ? t.params.expanded : void 0,
                  i = 'picker' in t.params ? t.params.picker : void 0;
                return new oi(t.document, {
                  expanded: null != n && n,
                  formatter: vi(e),
                  parser: Ln,
                  pickerLayout: null != i ? i : 'popup',
                  supportsAlpha: e,
                  value: t.value,
                  viewProps: t.viewProps
                });
              }
            };
            const bi = {
                id: 'input-color-object',
                type: 'input',
                accept: (t, e) => {
                  if (!wn.isColorObject(t)) return null;
                  const n = Cn(e);
                  return n ? { initialValue: t, params: n } : null;
                },
                binding: {
                  reader: (t) => ri,
                  equals: wn.equals,
                  writer: (t) => {
                    return (e = t.initialValue), wn.isRgbaColorObject(e) ? ci : hi;
                    var e;
                  }
                },
                controller: (t) => {
                  const e = wn.isRgbaColorObject(t.initialValue),
                    n = 'expanded' in t.params ? t.params.expanded : void 0,
                    i = 'picker' in t.params ? t.params.picker : void 0,
                    s = e ? jn : Dn;
                  return new oi(t.document, {
                    expanded: null != n && n,
                    formatter: s,
                    parser: Ln,
                    pickerLayout: null != i ? i : 'popup',
                    supportsAlpha: e,
                    value: t.value,
                    viewProps: t.viewProps
                  });
                }
              },
              gi = {
                id: 'input-color-string',
                type: 'input',
                accept: (t, e) => {
                  if ('string' != typeof t) return null;
                  if ('view' in e && 'text' === e.view) return null;
                  if (!Mn(t)) return null;
                  const n = Cn(e);
                  return n ? { initialValue: t, params: n } : null;
                },
                binding: {
                  reader: (t) => In,
                  equals: wn.equals,
                  writer: (t) => {
                    const e = Mn(t.initialValue);
                    if (!e) throw p.shouldNeverHappen();
                    return (function (t) {
                      const e = Un(t);
                      return (t, n) => {
                        Qe(t, e(n));
                      };
                    })(e);
                  }
                },
                controller: (t) => {
                  const e = Mn(t.initialValue);
                  if (!e) throw p.shouldNeverHappen();
                  const n = Un(e),
                    i = 'expanded' in t.params ? t.params.expanded : void 0,
                    s = 'picker' in t.params ? t.params.picker : void 0;
                  return new oi(t.document, {
                    expanded: null != i && i,
                    formatter: n,
                    parser: Ln,
                    pickerLayout: null != s ? s : 'popup',
                    supportsAlpha: An(e),
                    value: t.value,
                    viewProps: t.viewProps
                  });
                }
              };
            class _i {
              constructor(t) {
                (this.components = t.components), (this.asm_ = t.assembly);
              }
              constrain(t) {
                const e = this.asm_.toComponents(t).map((t, e) => {
                  var n, i;
                  return null !== (i = null === (n = this.components[e]) || void 0 === n ? void 0 : n.constrain(t)) && void 0 !== i ? i : t;
                });
                return this.asm_.fromComponents(e);
              }
            }
            const fi = v('pndtxt');
            class wi {
              constructor(t, e) {
                (this.textViews = e.textViews),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(fi()),
                  this.textViews.forEach((e) => {
                    const n = t.createElement('div');
                    n.classList.add(fi('a')), n.appendChild(e.element), this.element.appendChild(n);
                  });
              }
            }
            class xi {
              constructor(t, e) {
                (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.acs_ = e.axes.map((n, i) =>
                    (function (t, e, n) {
                      return new ze(t, {
                        arrayPosition: 0 === n ? 'fst' : n === e.axes.length - 1 ? 'lst' : 'mid',
                        baseStep: e.axes[n].baseStep,
                        parser: e.parser,
                        props: e.axes[n].textProps,
                        value: E(0, { constraint: e.axes[n].constraint }),
                        viewProps: e.viewProps
                      });
                    })(t, e, i)
                  )),
                  this.acs_.forEach((t, n) => {
                    Ae({
                      primary: this.value,
                      secondary: t.value,
                      forward: (t) => e.assembly.toComponents(t.rawValue)[n],
                      backward: (t, i) => {
                        const s = e.assembly.toComponents(t.rawValue);
                        return (s[n] = i.rawValue), e.assembly.fromComponents(s);
                      }
                    });
                  }),
                  (this.view = new wi(t, { textViews: this.acs_.map((t) => t.view) }));
              }
            }
            function yi(t) {
              const e = [],
                n = (function (t) {
                  return 'step' in t && !r(t.step) ? new Ht(t.step) : null;
                })(t);
              n && e.push(n);
              const i = (function (t) {
                return ('max' in t && !r(t.max)) || ('min' in t && !r(t.min)) ? new zt({ max: t.max, min: t.min }) : null;
              })(t);
              i && e.push(i);
              const s = nn(t.options);
              return s && e.push(s), new Kt(e);
            }
            function Ci(t) {
              const [e, n] = (function (t) {
                const e = t ? Nt(t, zt) : null;
                return e ? [e.minValue, e.maxValue] : [void 0, void 0];
              })(t);
              return [null != e ? e : 0, null != n ? n : 100];
            }
            const Pi = {
              id: 'input-number',
              type: 'input',
              accept: (t, e) => {
                if ('number' != typeof t) return null;
                const n = M,
                  i = L(e, {
                    format: n.optional.function,
                    max: n.optional.number,
                    min: n.optional.number,
                    options: n.optional.custom(Je),
                    step: n.optional.number
                  });
                return i ? { initialValue: t, params: i } : null;
              },
              binding: { reader: (t) => xe, constraint: (t) => yi(t.params), writer: (t) => Qe },
              controller: (t) => {
                var e, n;
                const i = t.value,
                  s = t.constraint;
                if (s && Nt(s, $t))
                  return new Yt(t.document, {
                    props: k.fromObject({ options: null !== (e = sn(s)) && void 0 !== e ? e : [] }),
                    value: i,
                    viewProps: t.viewProps
                  });
                const o = null !== (n = 'format' in t.params ? t.params.format : void 0) && void 0 !== n ? n : Ce(on(s, i.rawValue));
                if (s && Nt(s, zt)) {
                  const [e, n] = Ci(s);
                  return new Xe(t.document, {
                    baseStep: rn(s),
                    parser: we,
                    sliderProps: k.fromObject({ maxValue: n, minValue: e }),
                    textProps: k.fromObject({ draggingScale: an(s, i.rawValue), formatter: o }),
                    value: i,
                    viewProps: t.viewProps
                  });
                }
                return new ze(t.document, {
                  baseStep: rn(s),
                  parser: we,
                  props: k.fromObject({ draggingScale: an(s, i.rawValue), formatter: o }),
                  value: i,
                  viewProps: t.viewProps
                });
              }
            };
            class Ei {
              constructor(t = 0, e = 0) {
                (this.x = t), (this.y = e);
              }
              getComponents() {
                return [this.x, this.y];
              }
              static isObject(t) {
                if (r(t)) return !1;
                const e = t.x,
                  n = t.y;
                return 'number' == typeof e && 'number' == typeof n;
              }
              static equals(t, e) {
                return t.x === e.x && t.y === e.y;
              }
              toObject() {
                return { x: this.x, y: this.y };
              }
            }
            const ki = { toComponents: (t) => t.getComponents(), fromComponents: (t) => new Ei(...t) },
              Vi = v('p2d');
            class Si {
              constructor(t, e) {
                (this.element = t.createElement('div')),
                  this.element.classList.add(Vi()),
                  e.viewProps.bindClassModifiers(this.element),
                  b(e.expanded, _(this.element, Vi(void 0, 'expanded')));
                const n = t.createElement('div');
                n.classList.add(Vi('h')), this.element.appendChild(n);
                const i = t.createElement('button');
                i.classList.add(Vi('b')),
                  i.appendChild(U(t, 'p2dpad')),
                  e.viewProps.bindDisabled(i),
                  n.appendChild(i),
                  (this.buttonElement = i);
                const s = t.createElement('div');
                if ((s.classList.add(Vi('t')), n.appendChild(s), (this.textElement = s), 'inline' === e.pickerLayout)) {
                  const e = t.createElement('div');
                  e.classList.add(Vi('p')), this.element.appendChild(e), (this.pickerElement = e);
                } else this.pickerElement = null;
              }
            }
            const Mi = v('p2dp');
            class Li {
              constructor(t, e) {
                (this.onFoldableChange_ = this.onFoldableChange_.bind(this)),
                  (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.invertsY_ = e.invertsY),
                  (this.maxValue_ = e.maxValue),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(Mi()),
                  'popup' === e.layout && this.element.classList.add(Mi(void 0, 'p'));
                const n = t.createElement('div');
                n.classList.add(Mi('p')), e.viewProps.bindTabIndex(n), this.element.appendChild(n), (this.padElement = n);
                const i = t.createElementNS(D, 'svg');
                i.classList.add(Mi('g')), this.padElement.appendChild(i), (this.svgElem_ = i);
                const s = t.createElementNS(D, 'line');
                s.classList.add(Mi('ax')),
                  s.setAttributeNS(null, 'x1', '0'),
                  s.setAttributeNS(null, 'y1', '50%'),
                  s.setAttributeNS(null, 'x2', '100%'),
                  s.setAttributeNS(null, 'y2', '50%'),
                  this.svgElem_.appendChild(s);
                const o = t.createElementNS(D, 'line');
                o.classList.add(Mi('ax')),
                  o.setAttributeNS(null, 'x1', '50%'),
                  o.setAttributeNS(null, 'y1', '0'),
                  o.setAttributeNS(null, 'x2', '50%'),
                  o.setAttributeNS(null, 'y2', '100%'),
                  this.svgElem_.appendChild(o);
                const r = t.createElementNS(D, 'line');
                r.classList.add(Mi('l')),
                  r.setAttributeNS(null, 'x1', '50%'),
                  r.setAttributeNS(null, 'y1', '50%'),
                  this.svgElem_.appendChild(r),
                  (this.lineElem_ = r);
                const a = t.createElement('div');
                a.classList.add(Mi('m')),
                  this.padElement.appendChild(a),
                  (this.markerElem_ = a),
                  e.value.emitter.on('change', this.onValueChange_),
                  (this.value = e.value),
                  this.update_();
              }
              get allFocusableElements() {
                return [this.padElement];
              }
              update_() {
                const [t, e] = this.value.rawValue.getComponents(),
                  n = this.maxValue_,
                  i = Fe(t, -n, +n, 0, 100),
                  s = Fe(e, -n, +n, 0, 100),
                  o = this.invertsY_ ? 100 - s : s;
                this.lineElem_.setAttributeNS(null, 'x2', `${i}%`),
                  this.lineElem_.setAttributeNS(null, 'y2', `${o}%`),
                  (this.markerElem_.style.left = `${i}%`),
                  (this.markerElem_.style.top = `${o}%`);
              }
              onValueChange_() {
                this.update_();
              }
              onFoldableChange_() {
                this.update_();
              }
            }
            function Ai(t, e, n) {
              return [Ie(e[0], De(t)), Ie(e[1], Te(t)) * (n ? 1 : -1)];
            }
            class Ii {
              constructor(t, e) {
                (this.onPadKeyDown_ = this.onPadKeyDown_.bind(this)),
                  (this.onPadKeyUp_ = this.onPadKeyUp_.bind(this)),
                  (this.onPointerDown_ = this.onPointerDown_.bind(this)),
                  (this.onPointerMove_ = this.onPointerMove_.bind(this)),
                  (this.onPointerUp_ = this.onPointerUp_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.baseSteps_ = e.baseSteps),
                  (this.maxValue_ = e.maxValue),
                  (this.invertsY_ = e.invertsY),
                  (this.view = new Li(t, {
                    invertsY: this.invertsY_,
                    layout: e.layout,
                    maxValue: this.maxValue_,
                    value: this.value,
                    viewProps: this.viewProps
                  })),
                  (this.ptHandler_ = new Re(this.view.padElement)),
                  this.ptHandler_.emitter.on('down', this.onPointerDown_),
                  this.ptHandler_.emitter.on('move', this.onPointerMove_),
                  this.ptHandler_.emitter.on('up', this.onPointerUp_),
                  this.view.padElement.addEventListener('keydown', this.onPadKeyDown_),
                  this.view.padElement.addEventListener('keyup', this.onPadKeyUp_);
              }
              handlePointerEvent_(t, e) {
                if (!t.point) return;
                const n = this.maxValue_,
                  i = Fe(t.point.x, 0, t.bounds.width, -n, +n),
                  s = Fe(this.invertsY_ ? t.bounds.height - t.point.y : t.point.y, 0, t.bounds.height, -n, +n);
                this.value.setRawValue(new Ei(i, s), e);
              }
              onPointerDown_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerMove_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !1, last: !1 });
              }
              onPointerUp_(t) {
                this.handlePointerEvent_(t.data, { forceEmit: !0, last: !0 });
              }
              onPadKeyDown_(t) {
                je(t.key) && t.preventDefault();
                const [e, n] = Ai(t, this.baseSteps_, this.invertsY_);
                (0 === e && 0 === n) ||
                  this.value.setRawValue(new Ei(this.value.rawValue.x + e, this.value.rawValue.y + n), { forceEmit: !1, last: !1 });
              }
              onPadKeyUp_(t) {
                const [e, n] = Ai(t, this.baseSteps_, this.invertsY_);
                (0 === e && 0 === n) || this.value.setRawValue(this.value.rawValue, { forceEmit: !0, last: !0 });
              }
            }
            class Ti {
              constructor(t, e) {
                var n, i;
                (this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this)),
                  (this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this)),
                  (this.onPadButtonBlur_ = this.onPadButtonBlur_.bind(this)),
                  (this.onPadButtonClick_ = this.onPadButtonClick_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.foldable_ = X.create(e.expanded)),
                  (this.popC_ = 'popup' === e.pickerLayout ? new Qt(t, { viewProps: this.viewProps }) : null);
                const s = new Ii(t, {
                  baseSteps: [e.axes[0].baseStep, e.axes[1].baseStep],
                  invertsY: e.invertsY,
                  layout: e.pickerLayout,
                  maxValue: e.maxValue,
                  value: this.value,
                  viewProps: this.viewProps
                });
                s.view.allFocusableElements.forEach((t) => {
                  t.addEventListener('blur', this.onPopupChildBlur_), t.addEventListener('keydown', this.onPopupChildKeydown_);
                }),
                  (this.pickerC_ = s),
                  (this.textC_ = new xi(t, { assembly: ki, axes: e.axes, parser: e.parser, value: this.value, viewProps: this.viewProps })),
                  (this.view = new Si(t, {
                    expanded: this.foldable_.value('expanded'),
                    pickerLayout: e.pickerLayout,
                    viewProps: this.viewProps
                  })),
                  this.view.textElement.appendChild(this.textC_.view.element),
                  null === (n = this.view.buttonElement) || void 0 === n || n.addEventListener('blur', this.onPadButtonBlur_),
                  null === (i = this.view.buttonElement) || void 0 === i || i.addEventListener('click', this.onPadButtonClick_),
                  this.popC_
                    ? (this.view.element.appendChild(this.popC_.view.element),
                      this.popC_.view.element.appendChild(this.pickerC_.view.element),
                      Ae({
                        primary: this.foldable_.value('expanded'),
                        secondary: this.popC_.shows,
                        forward: (t) => t.rawValue,
                        backward: (t, e) => e.rawValue
                      }))
                    : this.view.pickerElement &&
                      (this.view.pickerElement.appendChild(this.pickerC_.view.element), J(this.foldable_, this.view.pickerElement));
              }
              onPadButtonBlur_(t) {
                if (!this.popC_) return;
                const e = this.view.element,
                  n = t.relatedTarget;
                (n && e.contains(n)) || (this.popC_.shows.rawValue = !1);
              }
              onPadButtonClick_() {
                this.foldable_.set('expanded', !this.foldable_.get('expanded')),
                  this.foldable_.get('expanded') && this.pickerC_.view.allFocusableElements[0].focus();
              }
              onPopupChildBlur_(t) {
                if (!this.popC_) return;
                const e = this.popC_.view.element,
                  n = $(t);
                (n && e.contains(n)) || (n && n === this.view.buttonElement && !B(e.ownerDocument)) || (this.popC_.shows.rawValue = !1);
              }
              onPopupChildKeydown_(t) {
                this.popC_
                  ? 'Escape' === t.key && (this.popC_.shows.rawValue = !1)
                  : this.view.pickerElement && 'Escape' === t.key && this.view.buttonElement.focus();
              }
            }
            function Di(t) {
              return Ei.isObject(t) ? new Ei(t.x, t.y) : new Ei();
            }
            function ji(t, e) {
              t.writeProperty('x', e.x), t.writeProperty('y', e.y);
            }
            function Bi(t) {
              if (!t) return;
              const e = [];
              return r(t.step) || e.push(new Ht(t.step)), (r(t.max) && r(t.min)) || e.push(new zt({ max: t.max, min: t.min })), new Kt(e);
            }
            function Ri(t, e) {
              const n = t && Nt(t, zt);
              if (n) return Math.max(Math.abs(n.minValue || 0), Math.abs(n.maxValue || 0));
              const i = rn(t);
              return Math.max(10 * Math.abs(i), 10 * Math.abs(e));
            }
            function Fi(t, e) {
              const n = e instanceof _i ? e.components[0] : void 0,
                i = e instanceof _i ? e.components[1] : void 0,
                s = Ri(n, t.x),
                o = Ri(i, t.y);
              return Math.max(s, o);
            }
            function Ui(t, e) {
              return { baseStep: rn(e), constraint: e, textProps: k.fromObject({ draggingScale: an(e, t), formatter: Ce(on(e, t)) }) };
            }
            function Oi(t) {
              if (!('y' in t)) return !1;
              const e = t.y;
              return !!e && 'inverted' in e && !!e.inverted;
            }
            const Ki = {
              id: 'input-point2d',
              type: 'input',
              accept: (t, e) => {
                if (!Ei.isObject(t)) return null;
                const n = M,
                  i = L(e, {
                    expanded: n.optional.boolean,
                    picker: n.optional.custom(Ze),
                    x: n.optional.custom(tn),
                    y: n.optional.object({
                      inverted: n.optional.boolean,
                      max: n.optional.number,
                      min: n.optional.number,
                      step: n.optional.number
                    })
                  });
                return i ? { initialValue: t, params: i } : null;
              },
              binding: {
                reader: (t) => Di,
                constraint: (t) => {
                  return (e = t.params), new _i({ assembly: ki, components: [Bi('x' in e ? e.x : void 0), Bi('y' in e ? e.y : void 0)] });
                  var e;
                },
                equals: Ei.equals,
                writer: (t) => ji
              },
              controller: (t) => {
                const e = t.document,
                  n = t.value,
                  i = t.constraint;
                if (!(i instanceof _i)) throw p.shouldNeverHappen();
                const s = 'expanded' in t.params ? t.params.expanded : void 0,
                  o = 'picker' in t.params ? t.params.picker : void 0;
                return new Ti(e, {
                  axes: [Ui(n.rawValue.x, i.components[0]), Ui(n.rawValue.y, i.components[1])],
                  expanded: null != s && s,
                  invertsY: Oi(t.params),
                  maxValue: Fi(n.rawValue, i),
                  parser: we,
                  pickerLayout: null != o ? o : 'popup',
                  value: n,
                  viewProps: t.viewProps
                });
              }
            };
            class Ni {
              constructor(t = 0, e = 0, n = 0) {
                (this.x = t), (this.y = e), (this.z = n);
              }
              getComponents() {
                return [this.x, this.y, this.z];
              }
              static isObject(t) {
                if (r(t)) return !1;
                const e = t.x,
                  n = t.y,
                  i = t.z;
                return 'number' == typeof e && 'number' == typeof n && 'number' == typeof i;
              }
              static equals(t, e) {
                return t.x === e.x && t.y === e.y && t.z === e.z;
              }
              toObject() {
                return { x: this.x, y: this.y, z: this.z };
              }
            }
            const $i = { toComponents: (t) => t.getComponents(), fromComponents: (t) => new Ni(...t) };
            function zi(t) {
              return Ni.isObject(t) ? new Ni(t.x, t.y, t.z) : new Ni();
            }
            function Hi(t, e) {
              t.writeProperty('x', e.x), t.writeProperty('y', e.y), t.writeProperty('z', e.z);
            }
            function qi(t) {
              if (!t) return;
              const e = [];
              return r(t.step) || e.push(new Ht(t.step)), (r(t.max) && r(t.min)) || e.push(new zt({ max: t.max, min: t.min })), new Kt(e);
            }
            function Gi(t, e) {
              return { baseStep: rn(e), constraint: e, textProps: k.fromObject({ draggingScale: an(e, t), formatter: Ce(on(e, t)) }) };
            }
            const Yi = {
              id: 'input-point3d',
              type: 'input',
              accept: (t, e) => {
                if (!Ni.isObject(t)) return null;
                const n = M,
                  i = L(e, { x: n.optional.custom(tn), y: n.optional.custom(tn), z: n.optional.custom(tn) });
                return i ? { initialValue: t, params: i } : null;
              },
              binding: {
                reader: (t) => zi,
                constraint: (t) => {
                  return (
                    (e = t.params),
                    new _i({
                      assembly: $i,
                      components: [qi('x' in e ? e.x : void 0), qi('y' in e ? e.y : void 0), qi('z' in e ? e.z : void 0)]
                    })
                  );
                  var e;
                },
                equals: Ni.equals,
                writer: (t) => Hi
              },
              controller: (t) => {
                const e = t.value,
                  n = t.constraint;
                if (!(n instanceof _i)) throw p.shouldNeverHappen();
                return new xi(t.document, {
                  assembly: $i,
                  axes: [Gi(e.rawValue.x, n.components[0]), Gi(e.rawValue.y, n.components[1]), Gi(e.rawValue.z, n.components[2])],
                  parser: we,
                  value: e,
                  viewProps: t.viewProps
                });
              }
            };
            class Wi {
              constructor(t = 0, e = 0, n = 0, i = 0) {
                (this.x = t), (this.y = e), (this.z = n), (this.w = i);
              }
              getComponents() {
                return [this.x, this.y, this.z, this.w];
              }
              static isObject(t) {
                if (r(t)) return !1;
                const e = t.x,
                  n = t.y,
                  i = t.z,
                  s = t.w;
                return 'number' == typeof e && 'number' == typeof n && 'number' == typeof i && 'number' == typeof s;
              }
              static equals(t, e) {
                return t.x === e.x && t.y === e.y && t.z === e.z && t.w === e.w;
              }
              toObject() {
                return { x: this.x, y: this.y, z: this.z, w: this.w };
              }
            }
            const Xi = { toComponents: (t) => t.getComponents(), fromComponents: (t) => new Wi(...t) };
            function Qi(t) {
              return Wi.isObject(t) ? new Wi(t.x, t.y, t.z, t.w) : new Wi();
            }
            function Ji(t, e) {
              t.writeProperty('x', e.x), t.writeProperty('y', e.y), t.writeProperty('z', e.z), t.writeProperty('w', e.w);
            }
            function Zi(t) {
              if (!t) return;
              const e = [];
              return r(t.step) || e.push(new Ht(t.step)), (r(t.max) && r(t.min)) || e.push(new zt({ max: t.max, min: t.min })), new Kt(e);
            }
            const ts = {
              id: 'input-point4d',
              type: 'input',
              accept: (t, e) => {
                if (!Wi.isObject(t)) return null;
                const n = M,
                  i = L(e, { x: n.optional.custom(tn), y: n.optional.custom(tn), z: n.optional.custom(tn), w: n.optional.custom(tn) });
                return i ? { initialValue: t, params: i } : null;
              },
              binding: {
                reader: (t) => Qi,
                constraint: (t) => {
                  return (
                    (e = t.params),
                    new _i({
                      assembly: Xi,
                      components: [
                        Zi('x' in e ? e.x : void 0),
                        Zi('y' in e ? e.y : void 0),
                        Zi('z' in e ? e.z : void 0),
                        Zi('w' in e ? e.w : void 0)
                      ]
                    })
                  );
                  var e;
                },
                equals: Wi.equals,
                writer: (t) => Ji
              },
              controller: (t) => {
                const e = t.value,
                  n = t.constraint;
                if (!(n instanceof _i)) throw p.shouldNeverHappen();
                return new xi(t.document, {
                  assembly: Xi,
                  axes: e.rawValue.getComponents().map((t, e) => {
                    return (
                      (i = t),
                      {
                        baseStep: rn((s = n.components[e])),
                        constraint: s,
                        textProps: k.fromObject({ draggingScale: an(s, i), formatter: Ce(on(s, i)) })
                      }
                    );
                    var i, s;
                  }),
                  parser: we,
                  value: e,
                  viewProps: t.viewProps
                });
              }
            };
            const es = {
                id: 'input-string',
                type: 'input',
                accept: (t, e) => {
                  if ('string' != typeof t) return null;
                  const n = L(e, { options: M.optional.custom(Je) });
                  return n ? { initialValue: t, params: n } : null;
                },
                binding: {
                  reader: (t) => ke,
                  constraint: (t) =>
                    (function (t) {
                      const e = [],
                        n = nn(t.options);
                      return n && e.push(n), new Kt(e);
                    })(t.params),
                  writer: (t) => Qe
                },
                controller: (t) => {
                  var e;
                  const n = t.document,
                    i = t.value,
                    s = t.constraint;
                  return s && Nt(s, $t)
                    ? new Yt(n, {
                        props: k.fromObject({ options: null !== (e = sn(s)) && void 0 !== e ? e : [] }),
                        value: i,
                        viewProps: t.viewProps
                      })
                    : new te(n, { parser: (t) => t, props: k.fromObject({ formatter: Ve }), value: i, viewProps: t.viewProps });
                }
              },
              ns = { defaultInterval: 200, defaultLineCount: 3 },
              is = v('mll');
            class ss {
              constructor(t, e) {
                (this.onValueUpdate_ = this.onValueUpdate_.bind(this)),
                  (this.formatter_ = e.formatter),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(is()),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('textarea');
                n.classList.add(is('i')),
                  (n.style.height = `calc(var(--bld-us) * ${e.lineCount})`),
                  (n.readOnly = !0),
                  e.viewProps.bindDisabled(n),
                  this.element.appendChild(n),
                  (this.textareaElem_ = n),
                  e.value.emitter.on('change', this.onValueUpdate_),
                  (this.value = e.value),
                  this.update_();
              }
              update_() {
                const t = this.textareaElem_,
                  e = t.scrollTop === t.scrollHeight - t.clientHeight,
                  n = [];
                this.value.rawValue.forEach((t) => {
                  void 0 !== t && n.push(this.formatter_(t));
                }),
                  (t.textContent = n.join('\n')),
                  e && (t.scrollTop = t.scrollHeight);
              }
              onValueUpdate_() {
                this.update_();
              }
            }
            class os {
              constructor(t, e) {
                (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new ss(t, { formatter: e.formatter, lineCount: e.lineCount, value: this.value, viewProps: this.viewProps }));
              }
            }
            const rs = v('sgl');
            class as {
              constructor(t, e) {
                (this.onValueUpdate_ = this.onValueUpdate_.bind(this)),
                  (this.formatter_ = e.formatter),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(rs()),
                  e.viewProps.bindClassModifiers(this.element);
                const n = t.createElement('input');
                n.classList.add(rs('i')),
                  (n.readOnly = !0),
                  (n.type = 'text'),
                  e.viewProps.bindDisabled(n),
                  this.element.appendChild(n),
                  (this.inputElement = n),
                  e.value.emitter.on('change', this.onValueUpdate_),
                  (this.value = e.value),
                  this.update_();
              }
              update_() {
                const t = this.value.rawValue,
                  e = t[t.length - 1];
                this.inputElement.value = void 0 !== e ? this.formatter_(e) : '';
              }
              onValueUpdate_() {
                this.update_();
              }
            }
            class ls {
              constructor(t, e) {
                (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.view = new as(t, { formatter: e.formatter, value: this.value, viewProps: this.viewProps }));
              }
            }
            const ps = {
              id: 'monitor-bool',
              type: 'monitor',
              accept: (t, e) => {
                if ('boolean' != typeof t) return null;
                const n = L(e, { lineCount: M.optional.number });
                return n ? { initialValue: t, params: n } : null;
              },
              binding: { reader: (t) => ee },
              controller: (t) => {
                var e;
                return 1 === t.value.rawValue.length
                  ? new ls(t.document, { formatter: ne, value: t.value, viewProps: t.viewProps })
                  : new os(t.document, {
                      formatter: ne,
                      lineCount: null !== (e = t.params.lineCount) && void 0 !== e ? e : ns.defaultLineCount,
                      value: t.value,
                      viewProps: t.viewProps
                    });
              }
            };
            class ds {
              constructor() {
                (this.emitter = new h()), (this.index_ = -1);
              }
              get index() {
                return this.index_;
              }
              set index(t) {
                this.index_ !== t && ((this.index_ = t), this.emitter.emit('change', { index: t, sender: this }));
              }
            }
            const cs = v('grl');
            class hs {
              constructor(t, e) {
                (this.onCursorChange_ = this.onCursorChange_.bind(this)),
                  (this.onValueUpdate_ = this.onValueUpdate_.bind(this)),
                  (this.element = t.createElement('div')),
                  this.element.classList.add(cs()),
                  e.viewProps.bindClassModifiers(this.element),
                  (this.formatter_ = e.formatter),
                  (this.minValue_ = e.minValue),
                  (this.maxValue_ = e.maxValue),
                  (this.cursor_ = e.cursor),
                  this.cursor_.emitter.on('change', this.onCursorChange_);
                const n = t.createElementNS(D, 'svg');
                n.classList.add(cs('g')),
                  (n.style.height = `calc(var(--bld-us) * ${e.lineCount})`),
                  this.element.appendChild(n),
                  (this.svgElem_ = n);
                const i = t.createElementNS(D, 'polyline');
                this.svgElem_.appendChild(i), (this.lineElem_ = i);
                const s = t.createElement('div');
                s.classList.add(cs('t'), v('tt')()),
                  this.element.appendChild(s),
                  (this.tooltipElem_ = s),
                  e.value.emitter.on('change', this.onValueUpdate_),
                  (this.value = e.value),
                  this.update_();
              }
              get graphElement() {
                return this.svgElem_;
              }
              update_() {
                const t = this.svgElem_.getBoundingClientRect(),
                  e = this.value.rawValue.length - 1,
                  n = this.minValue_,
                  i = this.maxValue_,
                  s = [];
                this.value.rawValue.forEach((o, r) => {
                  if (void 0 === o) return;
                  const a = Fe(r, 0, e, 0, t.width),
                    l = Fe(o, n, i, t.height, 0);
                  s.push([a, l].join(','));
                }),
                  this.lineElem_.setAttributeNS(null, 'points', s.join(' '));
                const o = this.tooltipElem_,
                  r = this.value.rawValue[this.cursor_.index];
                if (void 0 === r) return void o.classList.remove(cs('t', 'a'));
                const a = Fe(this.cursor_.index, 0, e, 0, t.width),
                  l = Fe(r, n, i, t.height, 0);
                (o.style.left = `${a}px`),
                  (o.style.top = `${l}px`),
                  (o.textContent = `${this.formatter_(r)}`),
                  o.classList.contains(cs('t', 'a')) ||
                    (o.classList.add(cs('t', 'a'), cs('t', 'in')), j(o), o.classList.remove(cs('t', 'in')));
              }
              onValueUpdate_() {
                this.update_();
              }
              onCursorChange_() {
                this.update_();
              }
            }
            class us {
              constructor(t, e) {
                if (
                  ((this.onGraphMouseMove_ = this.onGraphMouseMove_.bind(this)),
                  (this.onGraphMouseLeave_ = this.onGraphMouseLeave_.bind(this)),
                  (this.onGraphPointerDown_ = this.onGraphPointerDown_.bind(this)),
                  (this.onGraphPointerMove_ = this.onGraphPointerMove_.bind(this)),
                  (this.onGraphPointerUp_ = this.onGraphPointerUp_.bind(this)),
                  (this.value = e.value),
                  (this.viewProps = e.viewProps),
                  (this.cursor_ = new ds()),
                  (this.view = new hs(t, {
                    cursor: this.cursor_,
                    formatter: e.formatter,
                    lineCount: e.lineCount,
                    maxValue: e.maxValue,
                    minValue: e.minValue,
                    value: this.value,
                    viewProps: this.viewProps
                  })),
                  B(t))
                ) {
                  const t = new Re(this.view.element);
                  t.emitter.on('down', this.onGraphPointerDown_),
                    t.emitter.on('move', this.onGraphPointerMove_),
                    t.emitter.on('up', this.onGraphPointerUp_);
                } else
                  this.view.element.addEventListener('mousemove', this.onGraphMouseMove_),
                    this.view.element.addEventListener('mouseleave', this.onGraphMouseLeave_);
              }
              onGraphMouseLeave_() {
                this.cursor_.index = -1;
              }
              onGraphMouseMove_(t) {
                const e = this.view.element.getBoundingClientRect();
                this.cursor_.index = Math.floor(Fe(t.offsetX, 0, e.width, 0, this.value.rawValue.length));
              }
              onGraphPointerDown_(t) {
                this.onGraphPointerMove_(t);
              }
              onGraphPointerMove_(t) {
                t.data.point
                  ? (this.cursor_.index = Math.floor(Fe(t.data.point.x, 0, t.data.bounds.width, 0, this.value.rawValue.length)))
                  : (this.cursor_.index = -1);
              }
              onGraphPointerUp_() {
                this.cursor_.index = -1;
              }
            }
            function vs(t) {
              return 'format' in t && !r(t.format) ? t.format : Ce(2);
            }
            function ms(t) {
              return 'view' in t && 'graph' === t.view;
            }
            const bs = {
                id: 'monitor-number',
                type: 'monitor',
                accept: (t, e) => {
                  if ('number' != typeof t) return null;
                  const n = M,
                    i = L(e, {
                      format: n.optional.function,
                      lineCount: n.optional.number,
                      max: n.optional.number,
                      min: n.optional.number,
                      view: n.optional.string
                    });
                  return i ? { initialValue: t, params: i } : null;
                },
                binding: { defaultBufferSize: (t) => (ms(t) ? 64 : 1), reader: (t) => xe },
                controller: (t) =>
                  ms(t.params)
                    ? (function (t) {
                        var e, n, i;
                        return new us(t.document, {
                          formatter: vs(t.params),
                          lineCount: null !== (e = t.params.lineCount) && void 0 !== e ? e : ns.defaultLineCount,
                          maxValue: null !== (n = 'max' in t.params ? t.params.max : null) && void 0 !== n ? n : 100,
                          minValue: null !== (i = 'min' in t.params ? t.params.min : null) && void 0 !== i ? i : 0,
                          value: t.value,
                          viewProps: t.viewProps
                        });
                      })(t)
                    : (function (t) {
                        var e;
                        return 1 === t.value.rawValue.length
                          ? new ls(t.document, { formatter: vs(t.params), value: t.value, viewProps: t.viewProps })
                          : new os(t.document, {
                              formatter: vs(t.params),
                              lineCount: null !== (e = t.params.lineCount) && void 0 !== e ? e : ns.defaultLineCount,
                              value: t.value,
                              viewProps: t.viewProps
                            });
                      })(t)
              },
              gs = {
                id: 'monitor-string',
                type: 'monitor',
                accept: (t, e) => {
                  if ('string' != typeof t) return null;
                  const n = M,
                    i = L(e, { lineCount: n.optional.number, multiline: n.optional.boolean });
                  return i ? { initialValue: t, params: i } : null;
                },
                binding: { reader: (t) => ke },
                controller: (t) => {
                  var e;
                  const n = t.value;
                  return n.rawValue.length > 1 || ('multiline' in t.params && t.params.multiline)
                    ? new os(t.document, {
                        formatter: Ve,
                        lineCount: null !== (e = t.params.lineCount) && void 0 !== e ? e : ns.defaultLineCount,
                        value: n,
                        viewProps: t.viewProps
                      })
                    : new ls(t.document, { formatter: Ve, value: n, viewProps: t.viewProps });
                }
              };
            class _s {
              constructor(t) {
                (this.onValueChange_ = this.onValueChange_.bind(this)),
                  (this.reader = t.reader),
                  (this.writer = t.writer),
                  (this.emitter = new h()),
                  (this.value = t.value),
                  this.value.emitter.on('change', this.onValueChange_),
                  (this.target = t.target),
                  this.read();
              }
              read() {
                const t = this.target.read();
                void 0 !== t && (this.value.rawValue = this.reader(t));
              }
              write_(t) {
                this.writer(this.target, t);
              }
              onValueChange_(t) {
                this.write_(t.rawValue), this.emitter.emit('change', { options: t.options, rawValue: t.rawValue, sender: this });
              }
            }
            class fs {
              constructor(t) {
                (this.onTick_ = this.onTick_.bind(this)),
                  (this.reader_ = t.reader),
                  (this.target = t.target),
                  (this.emitter = new h()),
                  (this.value = t.value),
                  (this.ticker = t.ticker),
                  this.ticker.emitter.on('tick', this.onTick_),
                  this.read();
              }
              dispose() {
                this.ticker.dispose();
              }
              read() {
                const t = this.target.read();
                if (void 0 === t) return;
                const e = this.value.rawValue,
                  n = this.reader_(t);
                (this.value.rawValue = (function (t, e) {
                  const n = [...Le(t), e];
                  return n.length > t.length ? n.splice(0, n.length - t.length) : Se(n, t.length), n;
                })(e, n)),
                  this.emitter.emit('update', { rawValue: n, sender: this });
              }
              onTick_(t) {
                this.read();
              }
            }
            function ws(t, e) {
              return 0 === e ? new Ut() : new Ot(t, null != e ? e : ns.defaultInterval);
            }
            class xs {
              constructor() {
                this.pluginsMap_ = { blades: [], inputs: [], monitors: [] };
              }
              getAll() {
                return [...this.pluginsMap_.blades, ...this.pluginsMap_.inputs, ...this.pluginsMap_.monitors];
              }
              register(t) {
                'blade' === t.type
                  ? this.pluginsMap_.blades.unshift(t)
                  : 'input' === t.type
                  ? this.pluginsMap_.inputs.unshift(t)
                  : 'monitor' === t.type && this.pluginsMap_.monitors.unshift(t);
              }
              createInput(t, e, n) {
                if (r(e.read())) throw new p({ context: { key: e.key }, type: 'nomatchingcontroller' });
                const i = this.pluginsMap_.inputs.reduce(
                  (i, s) =>
                    i ||
                    (function (t, e) {
                      const n = t.accept(e.target.read(), e.params);
                      if (r(n)) return null;
                      const i = M,
                        s = { target: e.target, initialValue: n.initialValue, params: n.params },
                        o = t.binding.reader(s),
                        a = t.binding.constraint ? t.binding.constraint(s) : void 0,
                        l = E(o(n.initialValue), { constraint: a, equals: t.binding.equals }),
                        p = new _s({ reader: o, target: e.target, value: l, writer: t.binding.writer(s) }),
                        d = i.optional.boolean(e.params.disabled).value,
                        c = i.optional.boolean(e.params.hidden).value,
                        h = t.controller({
                          constraint: a,
                          document: e.document,
                          initialValue: n.initialValue,
                          params: n.params,
                          value: p.value,
                          viewProps: St.create({ disabled: d, hidden: c })
                        }),
                        u = i.optional.string(e.params.label).value;
                      return new nt(e.document, {
                        binding: p,
                        blade: W(),
                        props: k.fromObject({ label: u || e.target.key }),
                        valueController: h
                      });
                    })(s, { document: t, target: e, params: n }),
                  null
                );
                if (i) return i;
                throw new p({ context: { key: e.key }, type: 'nomatchingcontroller' });
              }
              createMonitor(t, e, n) {
                const i = this.pluginsMap_.monitors.reduce(
                  (i, s) =>
                    i ||
                    (function (t, e) {
                      var n, i, s;
                      const o = M,
                        a = t.accept(e.target.read(), e.params);
                      if (r(a)) return null;
                      const l = { target: e.target, initialValue: a.initialValue, params: a.params },
                        p = t.binding.reader(l),
                        d =
                          null !==
                            (i =
                              null !== (n = o.optional.number(e.params.bufferSize).value) && void 0 !== n
                                ? n
                                : t.binding.defaultBufferSize && t.binding.defaultBufferSize(a.params)) && void 0 !== i
                            ? i
                            : 1,
                        c = o.optional.number(e.params.interval).value,
                        h = new fs({ reader: p, target: e.target, ticker: ws(e.document, c), value: Me(d) }),
                        u = o.optional.boolean(e.params.disabled).value,
                        v = o.optional.boolean(e.params.hidden).value,
                        m = t.controller({
                          document: e.document,
                          params: a.params,
                          value: h.value,
                          viewProps: St.create({ disabled: u, hidden: v })
                        }),
                        b = null !== (s = o.optional.string(e.params.label).value) && void 0 !== s ? s : e.target.key;
                      return new st(e.document, { binding: h, blade: W(), props: k.fromObject({ label: b }), valueController: m });
                    })(s, { document: t, params: n, target: e }),
                  null
                );
                if (i) return i;
                throw new p({ context: { key: e.key }, type: 'nomatchingcontroller' });
              }
              createBlade(t, e) {
                const n = this.pluginsMap_.blades.reduce(
                  (n, i) =>
                    n ||
                    (function (t, e) {
                      const n = t.accept(e.params);
                      if (!n) return null;
                      const i = M.optional.boolean(e.params.disabled).value,
                        s = M.optional.boolean(e.params.hidden).value;
                      return t.controller({
                        blade: W(),
                        document: e.document,
                        params: Object.assign(Object.assign({}, n.params), { disabled: i, hidden: s }),
                        viewProps: St.create({ disabled: i, hidden: s })
                      });
                    })(i, { document: t, params: e }),
                  null
                );
                if (!n) throw new p({ type: 'nomatchingview', context: { params: e } });
                return n;
              }
              createBladeApi(t) {
                if (t instanceof nt) return new et(t);
                if (t instanceof st) return new it(t);
                if (t instanceof mt) return new lt(t, this);
                const e = this.pluginsMap_.blades.reduce((e, n) => e || n.api({ controller: t, pool: this }), null);
                if (!e) throw p.shouldNeverHappen();
                return e;
              }
            }
            class ys extends e {
              constructor(t) {
                super(t),
                  (this.emitter_ = new h()),
                  this.controller_.valueController.value.emitter.on('change', (t) => {
                    this.emitter_.emit('change', { event: new i(this, t.rawValue) });
                  });
              }
              get label() {
                return this.controller_.props.get('label');
              }
              set label(t) {
                this.controller_.props.set('label', t);
              }
              get options() {
                return this.controller_.valueController.props.get('options');
              }
              set options(t) {
                this.controller_.valueController.props.set('options', t);
              }
              get value() {
                return this.controller_.valueController.value.rawValue;
              }
              set value(t) {
                this.controller_.valueController.value.rawValue = t;
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
            }
            class Cs extends e {
              constructor(t) {
                super(t),
                  (this.emitter_ = new h()),
                  this.controller_.valueController.value.emitter.on('change', (t) => {
                    this.emitter_.emit('change', { event: new i(this, t.rawValue) });
                  });
              }
              get label() {
                return this.controller_.props.get('label');
              }
              set label(t) {
                this.controller_.props.set('label', t);
              }
              get maxValue() {
                return this.controller_.valueController.sliderController.props.get('maxValue');
              }
              set maxValue(t) {
                this.controller_.valueController.sliderController.props.set('maxValue', t);
              }
              get minValue() {
                return this.controller_.valueController.sliderController.props.get('minValue');
              }
              set minValue(t) {
                this.controller_.valueController.sliderController.props.set('minValue', t);
              }
              get value() {
                return this.controller_.valueController.value.rawValue;
              }
              set value(t) {
                this.controller_.valueController.value.rawValue = t;
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
            }
            class Ps extends e {
              constructor(t) {
                super(t),
                  (this.emitter_ = new h()),
                  this.controller_.valueController.value.emitter.on('change', (t) => {
                    this.emitter_.emit('change', { event: new i(this, t.rawValue) });
                  });
              }
              get label() {
                return this.controller_.props.get('label');
              }
              set label(t) {
                this.controller_.props.set('label', t);
              }
              get formatter() {
                return this.controller_.valueController.props.get('formatter');
              }
              set formatter(t) {
                this.controller_.valueController.props.set('formatter', t);
              }
              get value() {
                return this.controller_.valueController.value.rawValue;
              }
              set value(t) {
                this.controller_.valueController.value.rawValue = t;
              }
              on(t, e) {
                const n = e.bind(this);
                return (
                  this.emitter_.on(t, (t) => {
                    n(t.event);
                  }),
                  this
                );
              }
            }
            const Es = {
              id: 'list',
              type: 'blade',
              accept(t) {
                const e = M,
                  n = L(t, {
                    options: e.required.custom(Je),
                    value: e.required.raw,
                    view: e.required.constant('list'),
                    label: e.optional.string
                  });
                return n ? { params: n } : null;
              },
              controller(t) {
                const e = new Yt(t.document, {
                  props: k.fromObject({ options: en(t.params.options) }),
                  value: E(t.params.value),
                  viewProps: t.viewProps
                });
                return new wt(t.document, { blade: t.blade, props: k.fromObject({ label: t.params.label }), valueController: e });
              },
              api: (t) => (t.controller instanceof wt && t.controller.valueController instanceof Yt ? new ys(t.controller) : null)
            };
            class ks extends pt {
              constructor(t, e) {
                super(t, e);
              }
              get element() {
                return this.controller_.view.element;
              }
              importPreset(t) {
                (function (t, e) {
                  t.forEach((t) => {
                    const n = e[t.presetKey];
                    void 0 !== n && t.write(n);
                  });
                })(
                  this.controller_.rackController.rack.find(nt).map((t) => t.binding.target),
                  t
                ),
                  this.refresh();
              }
              exportPreset() {
                return this.controller_.rackController.rack
                  .find(nt)
                  .map((t) => t.binding.target)
                  .reduce((t, e) => Object.assign(t, { [e.presetKey]: e.read() }), {});
              }
              refresh() {
                this.controller_.rackController.rack.find(nt).forEach((t) => {
                  t.binding.read();
                }),
                  this.controller_.rackController.rack.find(st).forEach((t) => {
                    t.binding.read();
                  });
              }
            }
            class Vs extends _t {
              constructor(t, e) {
                super(t, { expanded: e.expanded, blade: e.blade, props: e.props, root: !0, viewProps: e.viewProps });
              }
            }
            const Ss = {
                id: 'slider',
                type: 'blade',
                accept(t) {
                  const e = M,
                    n = L(t, {
                      max: e.required.number,
                      min: e.required.number,
                      view: e.required.constant('slider'),
                      format: e.optional.function,
                      label: e.optional.string,
                      value: e.optional.number
                    });
                  return n ? { params: n } : null;
                },
                controller(t) {
                  var e, n;
                  const i = null !== (e = t.params.value) && void 0 !== e ? e : 0,
                    s = new Xe(t.document, {
                      baseStep: 1,
                      parser: we,
                      sliderProps: k.fromObject({ maxValue: t.params.max, minValue: t.params.min }),
                      textProps: k.fromObject({
                        draggingScale: an(void 0, i),
                        formatter: null !== (n = t.params.format) && void 0 !== n ? n : ye
                      }),
                      value: E(i),
                      viewProps: t.viewProps
                    });
                  return new wt(t.document, { blade: t.blade, props: k.fromObject({ label: t.params.label }), valueController: s });
                },
                api: (t) => (t.controller instanceof wt && t.controller.valueController instanceof Xe ? new Cs(t.controller) : null)
              },
              Ms = {
                id: 'text',
                type: 'blade',
                accept(t) {
                  const e = M,
                    n = L(t, {
                      parse: e.required.function,
                      value: e.required.raw,
                      view: e.required.constant('text'),
                      format: e.optional.function,
                      label: e.optional.string
                    });
                  return n ? { params: n } : null;
                },
                controller(t) {
                  var e;
                  const n = new te(t.document, {
                    parser: t.params.parse,
                    props: k.fromObject({ formatter: null !== (e = t.params.format) && void 0 !== e ? e : (t) => String(t) }),
                    value: E(t.params.value),
                    viewProps: t.viewProps
                  });
                  return new wt(t.document, { blade: t.blade, props: k.fromObject({ label: t.params.label }), valueController: n });
                },
                api: (t) => (t.controller instanceof wt && t.controller.valueController instanceof te ? new Ps(t.controller) : null)
              };
            function Ls(t, e, n) {
              if (t.querySelector(`style[data-tp-style=${e}]`)) return;
              const i = t.createElement('style');
              (i.dataset.tpStyle = e), (i.textContent = n), t.head.appendChild(i);
            }
            const As = new (class {
              constructor(t) {
                const [e, n] = t.split('-'),
                  i = e.split('.');
                (this.major = parseInt(i[0], 10)),
                  (this.minor = parseInt(i[1], 10)),
                  (this.patch = parseInt(i[2], 10)),
                  (this.prerelease = null != n ? n : null);
              }
              toString() {
                const t = [this.major, this.minor, this.patch].join('.');
                return null !== this.prerelease ? [t, this.prerelease].join('-') : t;
              }
            })('3.0.7');
            (t.BladeApi = e),
              (t.ButtonApi = c),
              (t.FolderApi = pt),
              (t.InputBindingApi = et),
              (t.ListApi = ys),
              (t.MonitorBindingApi = it),
              (t.Pane = class extends ks {
                constructor(t) {
                  var e;
                  const n = t || {},
                    i = null !== (e = n.document) && void 0 !== e ? e : R(),
                    s = (function () {
                      const t = new xs();
                      return (
                        [Ki, Yi, ts, es, Pi, gi, bi, mi, cn, ps, gs, bs, G, ft, Et, Ft].forEach((e) => {
                          t.register(e);
                        }),
                        t
                      );
                    })();
                  super(
                    new Vs(i, { expanded: n.expanded, blade: W(), props: k.fromObject({ title: n.title }), viewProps: St.create() }),
                    s
                  ),
                    (this.pool_ = s),
                    (this.containerElem_ =
                      n.container ||
                      (function (t) {
                        const e = t.createElement('div');
                        return e.classList.add(v('dfw')()), t.body && t.body.appendChild(e), e;
                      })(i)),
                    this.containerElem_.appendChild(this.element),
                    (this.doc_ = i),
                    (this.usesDefaultWrapper_ = !n.container),
                    this.setUpDefaultPlugins_();
                }
                get document() {
                  if (!this.doc_) throw p.alreadyDisposed();
                  return this.doc_;
                }
                dispose() {
                  const t = this.containerElem_;
                  if (!t) throw p.alreadyDisposed();
                  if (this.usesDefaultWrapper_) {
                    const e = t.parentElement;
                    e && e.removeChild(t);
                  }
                  (this.containerElem_ = null), (this.doc_ = null), super.dispose();
                }
                registerPlugin(t) {
                  ('plugin' in t ? [t.plugin] : 'plugins' in t ? t.plugins : []).forEach((t) => {
                    this.pool_.register(t), this.embedPluginStyle_(t);
                  });
                }
                embedPluginStyle_(t) {
                  t.css && Ls(this.document, `plugin-${t.id}`, t.css);
                }
                setUpDefaultPlugins_() {
                  Ls(
                    this.document,
                    'default',
                    ".tp-lstv_s,.tp-btnv_b,.tp-p2dv_b,.tp-colswv_sw,.tp-p2dpv_p,.tp-txtv_i,.tp-grlv_g,.tp-sglv_i,.tp-mllv_i,.tp-fldv_b,.tp-rotv_b,.tp-ckbv_i,.tp-coltxtv_ms,.tp-tbiv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-lstv_s,.tp-btnv_b,.tp-p2dv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-lstv_s:hover,.tp-btnv_b:hover,.tp-p2dv_b:hover{background-color:var(--btn-bg-h)}.tp-lstv_s:focus,.tp-btnv_b:focus,.tp-p2dv_b:focus{background-color:var(--btn-bg-f)}.tp-lstv_s:active,.tp-btnv_b:active,.tp-p2dv_b:active{background-color:var(--btn-bg-a)}.tp-lstv_s:disabled,.tp-btnv_b:disabled,.tp-p2dv_b:disabled{opacity:0.5}.tp-colswv_sw,.tp-p2dpv_p,.tp-txtv_i{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-colswv_sw:hover,.tp-p2dpv_p:hover,.tp-txtv_i:hover{background-color:var(--in-bg-h)}.tp-colswv_sw:focus,.tp-p2dpv_p:focus,.tp-txtv_i:focus{background-color:var(--in-bg-f)}.tp-colswv_sw:active,.tp-p2dpv_p:active,.tp-txtv_i:active{background-color:var(--in-bg-a)}.tp-colswv_sw:disabled,.tp-p2dpv_p:disabled,.tp-txtv_i:disabled{opacity:0.5}.tp-grlv_g,.tp-sglv_i,.tp-mllv_i{background-color:var(--mo-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--mo-fg);height:var(--bld-us);width:100%}.tp-rotv{--font-family: var(--tp-font-family, Roboto Mono,Source Code Pro,Menlo,Courier,monospace);--bs-br: var(--tp-base-border-radius, 6px);--cnt-h-p: var(--tp-container-horizontal-padding, 4px);--cnt-v-p: var(--tp-container-vertical-padding, 4px);--elm-br: var(--tp-element-border-radius, 2px);--bld-s: var(--tp-blade-spacing, 4px);--bld-us: var(--tp-blade-unit-size, 20px);--bs-bg: var(--tp-base-background-color, #2f3137);--bs-sh: var(--tp-base-shadow-color, rgba(0,0,0,0.2));--btn-bg: var(--tp-button-background-color, #adafb8);--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, #2f3137);--cnt-bg: var(--tp-container-background-color, rgba(187,188,196,0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187,188,196,0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187,188,196,0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187,188,196,0.15));--cnt-fg: var(--tp-container-foreground-color, #bbbcc4);--in-bg: var(--tp-input-background-color, rgba(187,188,196,0.1));--in-bg-a: var(--tp-input-background-color-active, rgba(187,188,196,0.25));--in-bg-f: var(--tp-input-background-color-focus, rgba(187,188,196,0.2));--in-bg-h: var(--tp-input-background-color-hover, rgba(187,188,196,0.15));--in-fg: var(--tp-input-foreground-color, #bbbcc4);--lbl-fg: var(--tp-label-foreground-color, rgba(187,188,196,0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0,0,0,0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187,188,196,0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(0,0,0,0.2))}.tp-fldv_c>.tp-cntv.tp-v-lst,.tp-tabv_c .tp-brkv>.tp-cntv.tp-v-lst,.tp-rotv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1 * var(--cnt-v-p))}.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-fldv_c>*:not(.tp-v-fst),.tp-tabv_c .tp-brkv>*:not(.tp-v-fst),.tp-rotv_c>*:not(.tp-v-fst){margin-top:var(--bld-s)}.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-v-p)}.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-cntv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-v-p)}.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-fldv_c>.tp-cntv,.tp-tabv_c .tp-brkv>.tp-cntv{margin-left:4px}.tp-fldv_c>.tp-fldv>.tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--elm-br);border-bottom-left-radius:var(--elm-br)}.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-fldv_c .tp-fldv>.tp-fldv_c,.tp-tabv_c .tp-brkv .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--elm-br)}.tp-fldv_c>.tp-tabv>.tp-tabv_i,.tp-tabv_c .tp-brkv>.tp-tabv>.tp-tabv_i{border-top-left-radius:var(--elm-br)}.tp-fldv_c .tp-tabv>.tp-tabv_c,.tp-tabv_c .tp-brkv .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--elm-br)}.tp-fldv_b,.tp-rotv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);overflow:hidden;padding-left:var(--cnt-h-p);padding-right:calc(2px * 2 + var(--bld-us) + var(--cnt-h-p));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-fldv_b:hover,.tp-rotv_b:hover{background-color:var(--cnt-bg-h)}.tp-fldv_b:focus,.tp-rotv_b:focus{background-color:var(--cnt-bg-f)}.tp-fldv_b:active,.tp-rotv_b:active{background-color:var(--cnt-bg-a)}.tp-fldv_b:disabled,.tp-rotv_b:disabled{opacity:0.5}.tp-fldv_m,.tp-rotv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:'';display:block;height:6px;right:calc(var(--cnt-h-p) + (var(--bld-us) + 4px - 6px) / 2 - 2px);margin:auto;opacity:0.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m,.tp-rotv.tp-rotv-expanded .tp-rotv_m{transform:none}.tp-fldv_c,.tp-rotv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c,.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c{display:none}.tp-fldv.tp-fldv-expanded>.tp-fldv_c,.tp-rotv.tp-rotv-expanded .tp-rotv_c{opacity:1;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-coltxtv_m,.tp-lstv{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-coltxtv_mm,.tp-lstv_m{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-coltxtv_mm svg,.tp-lstv_m svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-coltxtv_mm svg path,.tp-lstv_m svg path{fill:currentColor}.tp-coltxtv_w,.tp-pndtxtv{display:flex}.tp-coltxtv_c,.tp-pndtxtv_a{width:100%}.tp-coltxtv_c+.tp-coltxtv_c,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-pndtxtv_a{margin-left:2px}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--elm-br);cursor:pointer;display:block;height:var(--bld-us);position:relative;width:var(--bld-us)}.tp-ckbv_w svg{bottom:0;display:block;height:16px;left:0;margin:auto;opacity:0;position:absolute;right:0;top:0;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:0.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--bld-us)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--bld-s);opacity:1}.tp-colv .tp-popv{left:calc(-1 * var(--cnt-h-p));right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--bld-s)}.tp-colpv_rgb{display:flex;margin-top:var(--bld-s);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-v-p);padding-top:calc(var(--cnt-v-p) + 2px);position:relative}.tp-colpv_a:before{background-color:var(--grv-fg);content:'';height:2px;left:calc(-1 * var(--cnt-h-p));position:absolute;right:calc(-1 * var(--cnt-h-p));top:0}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--elm-br);outline:none;overflow:hidden;position:relative}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--bld-us) * 4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,0.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0,0,0,0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--elm-br);border:rgba(255,255,255,0.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,0.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative;width:100%}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--elm-br);box-shadow:0 0 2px rgba(0,0,0,0.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;pointer-events:none;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--elm-br);border:rgba(255,255,255,0.75) solid 2px;box-sizing:border-box;bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--elm-br)}.tp-colswv.tp-v-disabled{opacity:0.5}.tp-colswv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;cursor:pointer;display:block;height:var(--bld-us);left:0;margin:0;outline:none;padding:0;position:absolute;top:0;width:var(--bld-us)}.tp-colswv_b:focus::after{border:rgba(255,255,255,0.75) solid 2px;border-radius:var(--elm-br);bottom:0;content:'';display:block;left:0;position:absolute;right:0;top:0}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--elm-br);color:var(--lbl-fg);cursor:pointer;height:var(--bld-us);line-height:var(--bld-us);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv.tp-fldv-not .tp-fldv_b{display:none}.tp-fldv_t{padding-left:4px}.tp-fldv_c{border-left:var(--cnt-bg) solid 4px}.tp-fldv_b:hover+.tp-fldv_c{border-left-color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_c{border-left-color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_c{border-left-color:var(--cnt-bg-a)}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--bld-us) * 3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left 0.05s, top 0.05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:0.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-h-p);padding-right:var(--cnt-h-p)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;-ms-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:0.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:160px}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding:0 4px}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:0.5}.tp-mllv_i{display:block;height:calc(var(--bld-us) * 3);line-height:var(--bld-us);padding:0 4px;resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:0.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--bld-us);margin-right:4px;position:relative;width:var(--bld-us)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--bld-s);opacity:1}.tp-p2dv .tp-popv{left:calc(-1 * var(--cnt-h-p));right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-p2dpv{padding-left:calc(var(--bld-us) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:0.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:0.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:6px;box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:168px;padding:var(--cnt-v-p) var(--cnt-h-p);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sldv.tp-v-disabled{opacity:0.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--bld-us);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;bottom:0;content:'';display:block;height:2px;left:0;margin:auto;position:absolute;right:0;top:0}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:'';display:block;height:2px;left:0;margin-bottom:auto;margin-top:auto;position:absolute;right:0;top:0}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--elm-br);bottom:0;content:'';display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv.tp-v-disabled{opacity:0.5}.tp-tabv_i{align-items:flex-end;display:flex;overflow:hidden}.tp-tabv.tp-tabv-nop .tp-tabv_i{height:calc(var(--bld-us) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_i::before{background-color:var(--cnt-bg);bottom:0;content:'';height:2px;left:0;position:absolute;right:0}.tp-tabv_c{border-left:var(--cnt-bg) solid 4px;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p)}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv::before{background-color:var(--cnt-bg);bottom:0;content:'';height:2px;left:-2px;position:absolute;width:2px}.tp-tbiv_b{background-color:var(--cnt-bg);display:block;padding-left:calc(var(--cnt-h-p) + 4px);padding-right:calc(var(--cnt-h-p) + 4px);width:100%}.tp-tbiv_b:hover{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active{background-color:var(--cnt-bg-a)}.tp-tbiv_b:disabled{opacity:0.5}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);opacity:0.5;overflow:hidden;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-txtv{position:relative}.tp-txtv_i{padding:0 4px}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:0.3}.tp-txtv_k{cursor:pointer;height:100%;left:-3px;position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:'';height:calc(var(--bld-us) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:0.1;position:absolute;top:0;transition:border-radius 0.1s, height 0.1s, transform 0.1s, width 0.1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--elm-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) transparent transparent transparent;border-style:solid;border-width:2px;box-sizing:border-box;content:'';font-size:0.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--font-family);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(2px * 2 + var(--bld-us) + var(--cnt-h-p));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0}.tp-rotv.tp-rotv-not .tp-rotv_b{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c,.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1 * var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1 * var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_i{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}"
                  ),
                    this.pool_.getAll().forEach((t) => {
                      this.embedPluginStyle_(t);
                    }),
                    this.registerPlugin({ plugins: [Ss, Es, Ft, Ms] });
                }
              }),
              (t.SeparatorApi = xt),
              (t.SliderApi = Cs),
              (t.TabApi = Dt),
              (t.TabPageApi = Tt),
              (t.TextApi = Ps),
              (t.TpChangeEvent = i),
              (t.VERSION = As),
              Object.defineProperty(t, '__esModule', { value: !0 });
          })(e);
        },
        excalibur: (e) => {
          'use strict';
          e.exports = t;
        }
      },
      n = {};
    function i(t) {
      var s = n[t];
      if (void 0 !== s) return s.exports;
      var o = (n[t] = { exports: {} });
      return e[t].call(o.exports, o, o.exports, i), o.exports;
    }
    (i.n = (t) => {
      var e = t && t.__esModule ? () => t.default : () => t;
      return i.d(e, { a: e }), e;
    }),
      (i.d = (t, e) => {
        for (var n in e) i.o(e, n) && !i.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: e[n] });
      }),
      (i.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
      (i.r = (t) => {
        'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(t, '__esModule', { value: !0 });
      });
    var s = {};
    return (
      (() => {
        'use strict';
        i.r(s), i.d(s, { DevTool: () => o });
        var t = i('excalibur'),
          e = i('./node_modules/tweakpane/dist/tweakpane.js'),
          n = i('./picker-system.ts');
        class o {
          constructor(t) {
            (this.engine = t),
              (this.pointerPos = { x: 0, y: 0 }),
              (this.highlightedEntities = [-1]),
              (this.selectedEntity = null),
              (this.selectedEntityId = -1),
              (this.pane = new e.Pane({ title: 'Excalibur Dev Tools', expanded: !0 }));
            const n = document.createElement('style');
            (n.innerText = '.excalibur-tweakpane-custom { width: 405px; }'),
              document.head.appendChild(n),
              this.pane.element.parentElement.classList.add('excalibur-tweakpane-custom'),
              this._buildMain(),
              (this.tabs = this.pane.addTab({
                pages: [
                  { title: 'Entity' },
                  { title: 'Screen' },
                  { title: 'Camera' },
                  { title: 'Clock' },
                  { title: 'Timers' },
                  { title: 'Physics' },
                  { title: 'Settings' }
                ]
              })),
              (this.selectedEntityTab = this.tabs.pages[0]),
              (this.screenTab = this.tabs.pages[1]),
              (this.cameraTab = this.tabs.pages[2]),
              (this.clockTab = this.tabs.pages[3]),
              (this.timerTab = this.tabs.pages[4]),
              (this.physicsTab = this.tabs.pages[5]),
              (this.debugTab = this.tabs.pages[6]),
              this._installPickerSystemIfNeeded(t.currentScene),
              (t.debug.transform.showPosition = !0),
              (t.debug.entity.showName = !0),
              (this.selectedEntityFolder = this.selectedEntityTab.addFolder({ title: 'Selected' })),
              this._buildScreenTab(),
              this._buildCameraTab(),
              this._buildClockTab(),
              this._buildTimersTab(),
              this._buildPhysicsTab(),
              this._buildDebugSettingsTab(),
              setInterval(() => {
                this.update(this);
              }, 30),
              this.addListeners();
          }
          addListeners() {
            this.engine.canvas.addEventListener('click', () => {
              -1 !== this.highlightedEntities[0] && this.selectEntityById(this.highlightedEntities[0]);
            });
          }
          selectEntityById(e) {
            const n = this.engine;
            (this.selectedEntityId = e),
              (this.selectedEntity = n.currentScene.world.entityManager.getById(e)),
              this._buildEntityUI(this.selectedEntity);
            const i = this.selectedEntity.get(t.TransformComponent);
            this._buildTransformUI(i);
            const s = this.selectedEntity.get(t.MotionComponent);
            if ((this._buildMotionUI(s), this.selectedEntity instanceof t.ParticleEmitter))
              this._buildParticleEmitterUI(this.selectedEntity);
            else {
              const e = this.selectedEntity.get(t.GraphicsComponent);
              this._buildGraphicsUI(e);
              const n = this.selectedEntity.get(t.ColliderComponent),
                i = this.selectedEntity.get(t.BodyComponent);
              this._buildColliderUI(n, i);
            }
          }
          update(t) {
            const e = t.engine,
              n = e.input.pointers.primary.lastWorldPos;
            (this.pointerPos.x = n.x), (this.pointerPos.y = n.y), this.pointerPosInput.refresh();
            const i = [...this.pickerSystem.lastFrameEntityToPointers.keys(), ...this.pickerSystem.currentFrameEntityToPointers.keys()];
            0 === i.length && (i.push(-1), i.push(this.selectedEntityId)),
              (this.highlightedEntities = i),
              (e.debug.filter.useFilter = !0),
              (e.debug.filter.ids = i),
              (this.currentResolution.width === e.screen.resolution.width &&
                this.currentResolution.height === e.screen.resolution.height &&
                this.currentViewport.width === e.screen.viewport.width &&
                this.currentViewport.height === e.screen.viewport.height) ||
                (this.resolutionText.dispose(),
                this.viewportText.dispose(),
                (this.resolutionText = this.screenFolder.addBlade({
                  view: 'text',
                  label: 'resolution',
                  value: `(${e.screen.resolution.width}x${e.screen.resolution.height})`,
                  parse: (t) => String(t),
                  index: 0
                })),
                (this.viewportText = this.screenFolder.addBlade({
                  view: 'text',
                  label: 'viewport',
                  value: `(${e.screen.viewport.width.toFixed(0)}x${e.screen.viewport.height.toFixed(0)})`,
                  parse: (t) => String(t),
                  index: 1
                }))),
              this._buildTimersTab();
          }
          _installPickerSystemIfNeeded(t) {
            (this.pickerSystem = t.world.systemManager.get(n.PickerSystem)),
              this.pickerSystem || ((this.pickerSystem = new n.PickerSystem()), t.world.systemManager.addSystem(this.pickerSystem));
          }
          _buildMain() {
            this.pane.addInput({ debug: !1 }, 'debug').on('change', () => {
              this.engine.toggleDebug();
            }),
              this.pane.addMonitor(this.engine.clock.fpsSampler, 'fps', { view: 'graph', label: 'fps (0 - 120)', min: 0, max: 120 });
            let t,
              e = '',
              n = [];
            for (let t in this.engine.scenes) this.engine.currentScene === this.engine.scenes[t] && (e = t), n.push({ text: t, value: t });
            this.pane.addBlade({ view: 'list', label: 'current scene', options: n, value: e }).on('change', (e) => {
              this.engine.goToScene(e.value),
                this._installPickerSystemIfNeeded(this.engine.currentScene),
                t.dispose(),
                (t = this.pane.addBlade({
                  view: 'text',
                  label: 'number of entities',
                  value: this.engine.currentScene.world.entityManager.entities.length,
                  parse: (t) => String(t),
                  index: 3
                }));
            }),
              (t = this.pane.addBlade({
                view: 'text',
                label: 'number of entities',
                value: this.engine.currentScene.world.entityManager.entities.length,
                parse: (t) => String(t),
                index: 3
              })),
              (this.pointerPos = { x: 10, y: 10 }),
              (this.pointerPosInput = this.pane.addInput(this, 'pointerPos', { label: 'pointer pos (world)' })),
              this.pane.addInput(this, 'selectedEntityId', { label: 'Select By Id' }).on('change', (t) => this.selectEntityById(t.value));
          }
          _buildEntityUI(e) {
            var n, i;
            this.selectedEntityFolder &&
              (this.selectedEntityFolder.dispose(), (this.selectedEntityFolder = this.selectedEntityTab.addFolder({ title: 'Selected' }))),
              this.selectedEntityFolder.addBlade({ view: 'text', label: 'id', value: e.id.toString(), parse: (t) => String(t) }),
              this.selectedEntityFolder.addInput(this.selectedEntity, 'name'),
              this.selectedEntityFolder.addBlade({
                view: 'text',
                label: 'tags',
                value: e.tags.join(',') || 'none',
                parse: (t) => String(t)
              }),
              e instanceof t.Actor &&
                e.color &&
                this.selectedEntityFolder.addInput(this.selectedEntity, 'color').on('change', (n) => {
                  e.color = new t.Color(n.value.r, n.value.g, n.value.b, n.value.a);
                }),
              this.selectedEntityFolder.addBlade({
                view: 'text',
                label: 'parent',
                value: e.parent
                  ? `(${null === (n = e.parent) || void 0 === n ? void 0 : n.id}) ${
                      null === (i = e.parent) || void 0 === i ? void 0 : i.name
                    }`
                  : 'none',
                parse: (t) => String(t)
              }),
              this.selectedEntityFolder.addBlade({
                view: 'list',
                label: 'children',
                options: e.children.map((t) => ({ text: `(${t.id}) ${t.name}`, value: t.id })),
                value: e.children.length ? e.children[0].id : 'none'
              });
          }
          _buildColliderUI(e, n) {
            var i, s;
            if (e) {
              const o = this.selectedEntityFolder.addFolder({ title: 'Collider & Body' });
              o.addBlade({
                view: 'text',
                label: 'type',
                value: null !== (s = null === (i = e.get()) || void 0 === i ? void 0 : i.constructor.name) && void 0 !== s ? s : 'none',
                parse: (t) => String(t)
              }),
                n &&
                  (o
                    .addBlade({
                      view: 'list',
                      label: 'collisionType',
                      options: [
                        t.CollisionType.Active,
                        t.CollisionType.Fixed,
                        t.CollisionType.Passive,
                        t.CollisionType.PreventCollision
                      ].map((t) => ({ text: t, value: t })),
                      value: n.collisionType
                    })
                    .on('change', (t) => {
                      n.collisionType = t.value;
                    }),
                  o
                    .addBlade({
                      view: 'list',
                      label: 'collisionGroup',
                      options: [t.CollisionGroup.All, ...t.CollisionGroupManager.groups].map((t) => ({ text: t.name, value: t })),
                      value: n.group
                    })
                    .on('change', (t) => {
                      n.group = t.value;
                    }));
            }
          }
          _buildParticleEmitterUI(t) {
            const e = this.selectedEntityFolder.addFolder({ title: 'Particles' });
            e.addInput(t, 'isEmitting'),
              e.addInput(t, 'emitRate'),
              e.addInput(t, 'fadeFlag'),
              e.addInput(t, 'particleLife', { min: 100, max: 1e4, step: 100 }),
              e.addInput(t, 'width'),
              e.addInput(t, 'height'),
              e.addInput(t, 'minVel'),
              e.addInput(t, 'maxVel'),
              e.addInput(t, 'minAngle', { min: 0, max: 2 * Math.PI, step: 0.1 }),
              e.addInput(t, 'maxAngle', { min: 0, max: 2 * Math.PI, step: 0.1 }),
              e.addInput(t, 'minSize'),
              e.addInput(t, 'maxSize'),
              e.addInput(t, 'beginColor'),
              e.addInput(t, 'endColor'),
              e.addInput(t, 'opacity', { min: 0, max: 1, step: 0.01 }),
              e.addInput(t, 'randomRotation'),
              e.addInput(t, 'particleRotationalVelocity');
          }
          _buildGraphicsUI(t) {
            var e;
            if (t) {
              const n = this.selectedEntityFolder.addFolder({ title: 'Graphics' });
              n.addInput(t, 'anchor'), n.addInput(t, 'opacity', { min: 0, max: 1, step: 0.05 }), n.addInput(t, 'visible');
              const i = [],
                s = [],
                o = t.current.map((t) => t.graphic),
                r = [];
              let a = 0;
              for (let e in t.graphics) i.push({ text: e, value: a++ }), s.push(t.graphics[e]), r.push(t.graphics[e]);
              let l = 0;
              for (let t of o) -1 === r.indexOf(t) && (i.push({ text: 'anonymous' + l++, value: a }), s.push(t));
              n.addBlade({
                view: 'list',
                label: 'graphics',
                options: i,
                value: s.indexOf(null === (e = t.current[0]) || void 0 === e ? void 0 : e.graphic)
              }).on('change', (e) => {
                t.use(s[e.value]);
              });
            }
          }
          _buildMotionUI(t) {
            if (t) {
              const e = this.selectedEntityFolder.addFolder({ title: 'Motion' });
              e.addInput(t, 'vel'),
                e.addInput(t, 'acc'),
                e.addInput(t, 'angularVelocity', { step: 0.1 }),
                e.addInput(t, 'scaleFactor'),
                e.addInput(t, 'inertia');
            }
          }
          _buildTransformUI(e) {
            if (e) {
              const n = this.selectedEntityFolder.addFolder({ title: 'Transform' });
              n.addBlade({
                view: 'list',
                label: 'coord plane',
                options: [t.CoordPlane.World, t.CoordPlane.Screen].map((t) => ({ text: t, value: t })),
                value: e.coordPlane
              }).on('change', (t) => (e.coordPlane = t.value));
              const i = n.addInput(e, 'pos'),
                s = n.addInput(e, 'rotation', { min: 0, max: 2 * Math.PI }),
                o = n.addInput(e, 'scale');
              n.addSeparator();
              const r = n.addInput(e, 'globalPos', { label: 'global pos' }),
                a = n.addInput(e, 'globalRotation', { label: 'global rot', min: 0, max: 2 * Math.PI }),
                l = n.addInput(e, 'globalScale', { label: 'global pos' });
              r.on('change', () => i.refresh()),
                i.on('change', () => r.refresh()),
                a.on('change', () => s.refresh()),
                s.on('change', () => a.refresh()),
                l.on('change', () => o.refresh()),
                o.on('change', () => l.refresh()),
                n.addInput(e, 'z', { label: 'z-index' });
            }
          }
          _buildScreenTab() {
            (this.screenFolder = this.screenTab.addFolder({ title: 'Screen' })),
              (this.currentResolution = this.engine.screen.resolution),
              (this.currentViewport = this.engine.screen.viewport),
              (this.resolutionText = this.screenFolder.addBlade({
                view: 'text',
                label: 'resolution',
                value: `(${this.engine.screen.resolution.width}x${this.engine.screen.resolution.height})`,
                parse: (t) => String(t),
                index: 0
              })),
              (this.viewportText = this.screenFolder.addBlade({
                view: 'text',
                label: 'viewport',
                value: `(${this.engine.screen.viewport.width.toFixed(0)}x${this.engine.screen.viewport.height.toFixed(0)})`,
                parse: (t) => String(t),
                index: 1
              })),
              this.screenFolder.addButton({ title: 'Fullscreen' }).on('click', () => {
                this.engine.screen.goFullScreen();
              });
          }
          _buildCameraTab() {
            const t = this.cameraTab.addFolder({ title: 'Camera' });
            t.addInput(this.engine.currentScene.camera, 'zoom', { min: 0.01, max: 10, step: 0.5 }),
              t.addInput(this.engine.currentScene.camera, 'pos');
          }
          _buildClockTab() {
            const e = this.clockTab.addFolder({ title: 'Clock' });
            let n = this.engine.clock instanceof t.TestClock,
              i = 16;
            const s = e.addButton({ title: 'step', disabled: !n, index: 2 }).on('click', () => this.engine.clock.step(i));
            e.addBlade({ view: 'slider', label: 'step (ms)', min: 1, max: 100, step: 16, value: i }).on('change', (t) => (i = t.value)),
              e.addButton({ title: 'Use Test Clock', index: 0 }).on('click', () => {
                this.engine.debug.useTestClock(), (n = !0), (s.disabled = !1);
              }),
              e.addButton({ title: 'Use Standard Clock', index: 1 }).on('click', () => {
                this.engine.debug.useStandardClock(), (n = !1), (s.disabled = !0);
              }),
              this.pane.addSeparator();
            const o = e.addButton({ title: 'Stop', disabled: !1 }),
              r = e.addButton({ title: 'Start', disabled: !0 });
            o.on('click', () => {
              this.engine.clock.stop(), (r.disabled = !1), (o.disabled = !0);
            }),
              r.on('click', () => {
                this.engine.clock.start(), (o.disabled = !1), (r.disabled = !0);
              });
          }
          _buildTimersTab() {
            this.timerTab,
              this._timersFolder && this._timersFolder.dispose(),
              (this._timersFolder = this.timerTab.addFolder({ title: 'Timers' }));
            for (let t of this.engine.currentScene.timers) {
              let e =
                t.repeats && -1 === t.maxNumberOfRepeats
                  ? 'repeats'
                  : t._numberOfTicks + 1 + ' of ' + (-1 === t.maxNumberOfRepeats ? 1 : t.maxNumberOfRepeats);
              t.isRunning || (e = 'stopped'),
                t.complete && (e = 'complete'),
                this._timersFolder.addBlade({
                  view: 'text',
                  label: `timer(${t.id})`,
                  value: `${e} next(${t.timeToNextAction.toFixed(0)}ms)`,
                  parse: (t) => String(t)
                });
            }
          }
          _buildPhysicsTab() {
            const e = this.physicsTab,
              n = {};
            for (let e in t.Physics) n[e] = t.Physics[e];
            e.addInput(n, 'enabled').on('change', (e) => (t.Physics.enabled = e.value)), e.addInput(n, 'acc');
            const i = e.addInput(n, 'collisionResolutionStrategy');
            e.addButton({ title: 'Use Arcade' }).on('click', () => {
              t.Physics.useArcadePhysics(), (n.collisionResolutionStrategy = t.Physics.collisionResolutionStrategy), i.refresh();
            }),
              e.addButton({ title: 'Use Realistic' }).on('click', () => {
                t.Physics.useRealisticPhysics(), (n.collisionResolutionStrategy = t.Physics.collisionResolutionStrategy), i.refresh();
              }),
              e
                .addInput(n, 'positionIterations', { min: 1, max: 30, step: 1 })
                .on('change', (e) => (t.Physics.positionIterations = e.value)),
              e
                .addInput(n, 'velocityIterations', { min: 1, max: 30, step: 1 })
                .on('change', (e) => (t.Physics.velocityIterations = e.value)),
              e.addInput(n, 'checkForFastBodies').on('change', (e) => (t.Physics.checkForFastBodies = e.value));
          }
          _buildDebugSettingsTab() {
            const t = this.debugTab;
            for (let e of ['entity', 'transform', 'motion', 'body', 'collider', 'physics', 'graphics', 'camera']) {
              let n = t.addFolder({ title: e });
              if (this.engine.debug[e])
                for (let t in this.engine.debug[e])
                  if (t)
                    if (t.toLocaleLowerCase().includes('color')) n.addInput(this.engine.debug[e], t);
                    else {
                      if (Array.isArray(this.engine.debug[e][t])) continue;
                      n.addInput(this.engine.debug[e], t);
                    }
            }
          }
        }
      })(),
      s
    );
  })();
});
//# sourceMappingURL=dev-tools.js.map
