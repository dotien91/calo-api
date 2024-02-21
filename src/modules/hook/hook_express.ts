/**
 * @file A WordPress-like hook system for JavaScript.
 *
 * This file demonstrates a simple hook system for JavaScript based on the hook
 * system in WordPress. The purpose of this is to make your code extensible and
 * allowing other developers to hook into your code with their own callbacks.
 *
 * There are other ways to do this, but this will feel right at home for
 * WordPress developers.
 *
 * @author mcjambi
 * @license GPL2 (https://www.gnu.org/licenses/gpl-2.0.html)
 *
 */

function isUTF8(_string: string) {
  if (_string === void 0) _string = "";
  return /[^\u0000-\u007f]/.test(_string);
}

/**
 * MD5, auto generate if no string
 * @param {*} s
 * @returns MD5
 */
function MD5(s: any): string {
  if (s === void 0) s = Math.random();
  // @ts-ignore
  function L(k, d) {
    return (k << d) | (k >>> (32 - d));
  }
  function K(G, k) {
    let I, d, F, H, x;
    F = G & 2147483648;
    H = k & 2147483648;
    I = G & 1073741824;
    d = k & 1073741824;
    x = (G & 1073741823) + (k & 1073741823);
    if (I & d) {
      return x ^ 2147483648 ^ F ^ H;
    }
    if (I | d) {
      if (x & 1073741824) {
        return x ^ 3221225472 ^ F ^ H;
      } else {
        return x ^ 1073741824 ^ F ^ H;
      }
    } else {
      return x ^ F ^ H;
    }
  }
  function r(d, F, k) {
    return (d & F) | (~d & k);
  }
  function q(d, F, k) {
    return (d & k) | (F & ~k);
  }
  function p(d, F, k) {
    return d ^ F ^ k;
  }
  function n(d, F, k) {
    return F ^ (d | ~k);
  }
  function u(G, F, aa, Z, k, H, I) {
    G = K(G, K(K(r(F, aa, Z), k), I));
    return K(L(G, H), F);
  }
  function f(G, F, aa, Z, k, H, I) {
    G = K(G, K(K(q(F, aa, Z), k), I));
    return K(L(G, H), F);
  }
  function D(G, F, aa, Z, k, H, I) {
    G = K(G, K(K(p(F, aa, Z), k), I));
    return K(L(G, H), F);
  }
  function t(G, F, aa, Z, k, H, I) {
    G = K(G, K(K(n(F, aa, Z), k), I));
    return K(L(G, H), F);
  }
  function e(G) {
    let Z;
    const F = G.length;
    const x = F + 8;
    const k = (x - (x % 64)) / 64;
    const I = (k + 1) * 16;
    const aa = Array(I - 1);
    let d = 0;
    let H = 0;
    while (H < F) {
      Z = (H - (H % 4)) / 4;
      d = (H % 4) * 8;
      aa[Z] = aa[Z] | (G.charCodeAt(H) << d);
      H++;
    }
    Z = (H - (H % 4)) / 4;
    d = (H % 4) * 8;
    aa[Z] = aa[Z] | (128 << d);
    aa[I - 2] = F << 3;
    aa[I - 1] = F >>> 29;
    return aa;
  }
  function B(x) {
    let k = "",
      F = "",
      G,
      d;
    for (d = 0; d <= 3; d++) {
      G = (x >>> (d * 8)) & 255;
      F = "0" + G.toString(16);
      k = k + F.substr(F.length - 2, 2);
    }
    return k;
  }
  function J(k) {
    k = k.replace(/rn/g, "n");
    let d = "";
    for (let F = 0; F < k.length; F++) {
      const x = k.charCodeAt(F);
      if (x < 128) {
        d += String.fromCharCode(x);
      } else {
        if (x > 127 && x < 2048) {
          d += String.fromCharCode((x >> 6) | 192);
          d += String.fromCharCode((x & 63) | 128);
        } else {
          d += String.fromCharCode((x >> 12) | 224);
          d += String.fromCharCode(((x >> 6) & 63) | 128);
          d += String.fromCharCode((x & 63) | 128);
        }
      }
    }
    return d;
  }
  let C = [];
  let P, h, E, v, g, Y, X, W, V;
  const S = 7,
    Q = 12,
    N = 17,
    M = 22;
  const A = 5,
    z = 9,
    y = 14,
    w = 20;
  const o = 4,
    m = 11,
    l = 16,
    j = 23;
  const U = 6,
    T = 10,
    R = 15,
    O = 21;
  s = J(s);
  C = e(s);
  Y = 1732584193;
  X = 4023233417;
  W = 2562383102;
  V = 271733878;
  for (P = 0; P < C.length; P += 16) {
    h = Y;
    E = X;
    v = W;
    g = V;
    Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
    V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
    W = u(W, V, Y, X, C[P + 2], N, 606105819);
    X = u(X, W, V, Y, C[P + 3], M, 3250441966);
    Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
    V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
    W = u(W, V, Y, X, C[P + 6], N, 2821735955);
    X = u(X, W, V, Y, C[P + 7], M, 4249261313);
    Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
    V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
    W = u(W, V, Y, X, C[P + 10], N, 4294925233);
    X = u(X, W, V, Y, C[P + 11], M, 2304563134);
    Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
    V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
    W = u(W, V, Y, X, C[P + 14], N, 2792965006);
    X = u(X, W, V, Y, C[P + 15], M, 1236535329);
    Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
    V = f(V, Y, X, W, C[P + 6], z, 3225465664);
    W = f(W, V, Y, X, C[P + 11], y, 643717713);
    X = f(X, W, V, Y, C[P + 0], w, 3921069994);
    Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
    V = f(V, Y, X, W, C[P + 10], z, 38016083);
    W = f(W, V, Y, X, C[P + 15], y, 3634488961);
    X = f(X, W, V, Y, C[P + 4], w, 3889429448);
    Y = f(Y, X, W, V, C[P + 9], A, 568446438);
    V = f(V, Y, X, W, C[P + 14], z, 3275163606);
    W = f(W, V, Y, X, C[P + 3], y, 4107603335);
    X = f(X, W, V, Y, C[P + 8], w, 1163531501);
    Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
    V = f(V, Y, X, W, C[P + 2], z, 4243563512);
    W = f(W, V, Y, X, C[P + 7], y, 1735328473);
    X = f(X, W, V, Y, C[P + 12], w, 2368359562);
    Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
    V = D(V, Y, X, W, C[P + 8], m, 2272392833);
    W = D(W, V, Y, X, C[P + 11], l, 1839030562);
    X = D(X, W, V, Y, C[P + 14], j, 4259657740);
    Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
    V = D(V, Y, X, W, C[P + 4], m, 1272893353);
    W = D(W, V, Y, X, C[P + 7], l, 4139469664);
    X = D(X, W, V, Y, C[P + 10], j, 3200236656);
    Y = D(Y, X, W, V, C[P + 13], o, 681279174);
    V = D(V, Y, X, W, C[P + 0], m, 3936430074);
    W = D(W, V, Y, X, C[P + 3], l, 3572445317);
    X = D(X, W, V, Y, C[P + 6], j, 76029189);
    Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
    V = D(V, Y, X, W, C[P + 12], m, 3873151461);
    W = D(W, V, Y, X, C[P + 15], l, 530742520);
    X = D(X, W, V, Y, C[P + 2], j, 3299628645);
    Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
    V = t(V, Y, X, W, C[P + 7], T, 1126891415);
    W = t(W, V, Y, X, C[P + 14], R, 2878612391);
    X = t(X, W, V, Y, C[P + 5], O, 4237533241);
    Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
    V = t(V, Y, X, W, C[P + 3], T, 2399980690);
    W = t(W, V, Y, X, C[P + 10], R, 4293915773);
    X = t(X, W, V, Y, C[P + 1], O, 2240044497);
    Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
    V = t(V, Y, X, W, C[P + 15], T, 4264355552);
    W = t(W, V, Y, X, C[P + 6], R, 2734768916);
    X = t(X, W, V, Y, C[P + 13], O, 1309151649);
    Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
    V = t(V, Y, X, W, C[P + 11], T, 3174756917);
    W = t(W, V, Y, X, C[P + 2], R, 718787259);
    X = t(X, W, V, Y, C[P + 9], O, 3951481745);
    Y = K(Y, h);
    X = K(X, E);
    W = K(W, v);
    V = K(V, g);
  }
  const i = B(Y) + B(X) + B(W) + B(V);
  return i.toLowerCase();
}

/**
 * Check if it is a dev site, show some useful information....
 */
function isDevsite(): boolean {
  return process.env.NODE_ENV !== "production";
}

const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const FgGreen = "\x1b[32m";
const BgGreen = "\x1b[42m";
const BgBlue = "\x1b[44m";
const BgMagenta = "\x1b[45m";

/**
 * Hooks object
 *
 * This object needs to be declared early so that it can be used in code.
 * Preferably at a global scope.
 */

class HookExpress {
  Hooks: any;
  HookFilters: any;
  callbackHash: string[];

  constructor() {
    this.Hooks = {
      actions: {},
      filters: {},
    };
    /**
     * Check if something call doublicated ...
     */
    this.callbackHash = [];
  }

  verify_tag(tag: string) {
    tag = String(tag).trim().toLowerCase();
    if (typeof tag !== "string" || String(tag).length < 1) {
      throw new Error("tag must be a string! And tag must be 1 character or more.");
    }
    if (isUTF8(tag)) {
      throw new Error("tag can not has any UTF8 charactors.");
    }
    return tag;
  }

  add_action(tag: string, callback: Promise<any> | Function, priority?: number) {
    if (typeof priority === "undefined") {
      priority = 10;
    }

    if (typeof callback !== "function") {
      throw new Error("callback in add_action must be a function.");
    }

    const _callbackHash: string = MD5("add_action" + callback.toString() + tag);
    if (this.callbackHash.indexOf(_callbackHash) > -1) {
      console.log(
        Bright + BgMagenta + " May be add_action runing wrong: callback function exist in this hook: %s " + Reset,
        tag
      );
      return;
    } else {
      this.callbackHash.push(_callbackHash);
    }

    tag = this.verify_tag(tag);

    // If the tag doesn't exist, create it.
    this.Hooks.actions[tag] = this.Hooks.actions[tag] || [];
    this.Hooks.actions[tag].push({ priority: priority, callback: callback });
  }

  /**
   * Add a new Filter callback to Hooks.filters
   *
   * @param tag The tag specified by apply_filters()
   * @param callback The callback function to call when apply_filters() is called
   * @param priority Priority of filter to apply. Default: 10 (like WordPress)
   * @priority bigger is last ...
   * @see https://developer.wordpress.org/plugins/hooks/actions/#priority
   */
  add_filter(tag: string, callback: (...args: any) => any, priority?: number) {
    if (typeof priority === "undefined") {
      priority = 10;
    }

    if (typeof callback !== "function") {
      throw new Error("callback in add_action must be a function.");
    }

    const _callbackHash: string = MD5("add_filter" + callback.toString() + tag);
    if (this.callbackHash.indexOf(_callbackHash) > -1) {
      console.log(
        Bright + BgBlue + " May be add_filter runing wrong: callback function exist in this hook: %s " + Reset,
        tag
      );
      return;
    } else {
      this.callbackHash.push(_callbackHash);
    }

    tag = this.verify_tag(tag);

    // If the tag doesn't exist, create it.
    this.Hooks.filters[tag] = this.Hooks.filters[tag] || [];
    this.Hooks.filters[tag].push({ priority: priority, callback: callback });
  }

  /**
  * Remove an Anction callback from Hooks.actions
  *
  * Must be the exact same callback signature.
  * Warning: Anonymous functions can not be removed.
  
  * @param tag The tag specified by do_action()
  * @param callback The callback function to remove
  */
  remove_action(tag: string, callback: any) {
    tag = this.verify_tag(tag);
    this.Hooks.actions[tag] = this.Hooks.actions[tag] || [];
    const self = this;
    this.Hooks.actions[tag].forEach(function (filter: any, i: any) {
      if (filter.callback === callback) {
        self.Hooks.actions[tag].splice(i, 1);
      }
    });
  }

  /**
  * Remove a Filter callback from Hooks.filters
  *
  * Must be the exact same callback signature.
  * Warning: Anonymous functions can not be removed.
  
  * @param tag The tag specified by apply_filters()
  * @param callback The callback function to remove
  */
  remove_filter(tag: string, callback: any) {
    tag = this.verify_tag(tag);
    this.Hooks.filters[tag] = this.Hooks.filters[tag] || [];
    const self = this;
    this.Hooks.filters[tag].forEach(function (filter: any, i: any) {
      if (filter.callback === callback) {
        self.Hooks.filters[tag].splice(i, 1);
      }
    });
  }

  /**
   * Calls actions that are stored in Hooks.actions for a specific tag or nothing
   * if there are no actions to call.
   *
   * @param tag A registered tag in Hook.actions
   * @options Optional JavaScript object to pass to the callbacks
   */
  do_action(tag: string, ...args: any) {
    tag = this.verify_tag(tag);

    const actions: any[] = [];

    if (isDevsite()) {
      console.info(`> DO ACTION: ${tag}`);
    }

    if (typeof this.Hooks.actions[tag] !== "undefined" && this.Hooks.actions[tag].length > 0) {
      this.Hooks.actions[tag].forEach(function (hook: any) {
        actions[hook.priority] = actions[hook.priority] || [];
        actions[hook.priority].push(hook.callback);
      });

      actions.forEach(function (hooks) {
        hooks.forEach(function (callback: any) {
          callback.apply(null, args);
        });
      });
    }

    /********
     * Jamviet.com added: Apply all action to one, make outgoing webhook work better ...
     */
    if (Array.isArray(this.Hooks.actions["apply_all_action"]))
      this.Hooks.actions["apply_all_action"].forEach(async (hook: any) => {
        await hook["callback"](tag, args);
      });
  }

  /**
   * Calls filters that are stored in Hooks.filters for a specific tag or return
   * original value if no filters exist.
   *
   * @param tag A registered tag in Hook.filters
   * @options Optional JavaScript object to pass to the callbacks
   */
  apply_filters(tag: string, value: any, ...args: any) {
    tag = this.verify_tag(tag);

    if (isDevsite()) {
      console.info(`> APPLY FILTER: ${tag}`);
    }

    const filters: any[] = [];

    if (typeof this.Hooks.filters[tag] !== "undefined" && this.Hooks.filters[tag].length > 0) {
      this.Hooks.filters[tag].forEach(function (hook: any) {
        filters[hook.priority] = filters[hook.priority] || [];
        filters[hook.priority].push(hook.callback);
      });

      filters.forEach(function (hooks) {
        hooks.forEach((callback: any) => {
          value = callback(value, ...args);
        });
      });
    }

    return value;
  }

  /**
   * Check if software has a specific action or not...
   * @param tag String
   * @returns Boolean
   */
  has_action(tag: string): boolean {
    tag = this.verify_tag(tag);
    if (isDevsite()) {
      console.info(`> ASK FOR ACTION: ${tag}`);
    }
    return this.Hooks.actions[tag] ? true : false;
  }

  /**
   * Check if software has a specific filter or not...
   * @param tag string
   * @returns boolean
   */
  has_filter(tag: string): boolean {
    tag = this.verify_tag(tag);
    if (isDevsite()) {
      console.info(`> ASK FOR FILTER: ${tag}`);
    }
    return this.Hooks.filters[tag] ? true : false;
  }

  /**
   * List all filters ....
   */
  list_filters() {
    return this.Hooks.filters;
  }

  /**
   * List  all actions ...
   * @returns Object
   */
  list_actions(): string[] {
    return this.Hooks.actions;
  }
}

export interface iHookExpress extends HookExpress {}
export default new HookExpress();
