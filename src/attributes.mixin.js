/**
 * @typedef {import('./attributes.mixin.typedef.js')}
 */
/**
 * Attributes Mixin intended for use with Web Component (Custom Element) classes only.
 *
 * Provides getter setters for IDL Attributes by adding them to the prototype of the sub class.
 *
 * Defines the public static readonly observedAttributes getter on behalf of the sub class.
 *
 * The sub class must define its optional attributeChangedCallback lifecycle callback as normal.
 *
 * Changes to non-reflecting IDL Attributes will also trigger the attributeChangedCallback lifecycle callback.
 *
 * @example
 * ```
 * class WebComponent extends Attributes(HTMLElement) {
 *   static attributes = [
 *     { idlName: 'nonReflectingAttribute' },
 *     { contentName: 'non-reflecting-attribute' }
 *     { idlName: 'reflectingAttribute', contentName: 'reflecting-attribute' }
 *   ]
 *   constructor() {
 *     super()
 *   }
 *   attributeChangedCallback(attributeName, oldValue, newValue) {}
 * }
 * customElements.define('web-component', WebComponent);
 *
 * const webComponent = document.createElement('web-component');
 *
 * webComponent.nonReflectingAttribute = 'abc'; // attributeChangedCallback() is called
 * webComponent.setAttribute('non-reflecting-attribute', 'abc'); // attributeChangedCallback() is called
 * webComponent.reflectingAttribute = 'abc'; // The Content Attribute "reflecting-attribute" is set and attributeChangedCallback() is called
 * ```
 * @mixin
 * @param {typeof HTMLElement} Base - This must be either HTMLElement or an instance of HTMLElement.
 * @throws Will throw an error if Base is not HTMLElement or an instance of HTMLElement.
 */
const attributesMixin = (Base) => {
  if (Base !== HTMLElement && Base.prototype instanceof HTMLElement === false) {
    throw new Error(`Base parameter must be HTMLElement or a class that extends from or inherits HTMLElement. Received ${Base.name} which is not an instance of HTMLElement.`);
  }

  return class Mixin extends Base {
    /**
     * @private
     * @static
     * @type {boolean}
     */
    static #attributesReady = false; // Static, but re-initialised per sub class, because we return a new class definition of Mixin for every sub class that extends it.
    /**
     * @static
     * @type {AttributeConfig[]}
     */
    static attributes = []; // In case "attributes" is not defined by the sub class.
    /**
     * @private
     * @type {Map.<string, *>}
     */
    #idlAttributes;
    /**
     * Mix IDL Attribute getter setters into the prototype of the sub class.
     *
     * Define a private idlAttributes Map for each instance of the sub class for storing and retrieving values of non-reflecting IDL Attributes.
     *
     * Define a static readonly observedAttributes getter with an array of content attribute names, derived from the static attributes property of the sub class.
     */
    constructor() {
      super();
      this.#idlAttributes = new Map(); // For IDL Attributes that do not reflect to Content Attributes.
      if (Mixin.#attributesReady) {
        return;
      }
      this.#setupAttributes(this.constructor.attributes);
      Mixin.#attributesReady = true;
    }
    /**
     * Returns an array of content attributes that will invoke the attributeChangedCallback lifecycle callback.
     *
     * @static
     * @type {string[]}
     */
    static get observedAttributes() {
      // Inside static methods, "this" refers to the constructor.
      return this.attributes.filter(({ contentName }) => {
        return contentName;
      }).map(({ contentName }) => {
        return contentName;
      });
    }
    attributeChangedCallback(_attributeName, _oldValue, _newValue) {} // In case "attributeChangedCallback" is not defined by the sub class.
    /**
     * Mix IDL Attribute getter setters into the prototype of the sub class.
     *
     * In this way, we only define the getter setters once, instead
     * of defining them on each instance of the sub class (web component).
     *
     * @private
     * @method
     * @param {AttributeConfig}
     * @throws Will throw an error if proxyTarget is set without idlName being set.
     * @throws Will throw an error if both contentName and proxyTarget are set.
     * @throws Will throw an error if one of either proxyTarget or defaultValue is not set and readonly is set to `true`.
     * @returns {void}
     */
    #setupAttribute({
      idlName: idlAttributeName,
      contentName: contentAttributeName,
      proxyTarget,
      type: attributeType,
      defaultValue,
      readonly
    }) {
      if (proxyTarget && !idlAttributeName) {
        throw new Error('You must provide a value for "idlName" when using a proxyTarget.');
      }

      if (proxyTarget && contentAttributeName) {
        throw new Error('The "contentName" and "proxyTarget" properties cannot be used together.')
      }

      if (readonly && !proxyTarget && defaultValue === undefined) {
        throw new Error('You must provide a proxyTarget or defaultValue for readonly attributes.');
      }

      const reflectToContentAttribute = Boolean(contentAttributeName);

      switch (attributeType) {
        case 'boolean':
          Object.defineProperty(this.constructor.prototype, idlAttributeName, {
            get() {
              if (proxyTarget) {
                const value = this[proxyTarget][idlAttributeName];

                return value !== undefined ? Boolean(value) : Boolean(defaultValue);
              }

              if (!reflectToContentAttribute) {
                const value = this.#idlAttributes.get(idlAttributeName);

                return value !== undefined ? Boolean(value) : Boolean(defaultValue);
              }

              return this.hasAttribute(contentAttributeName);
            },
            set(value) {
              if (readonly) {
                return;
              }
              if (proxyTarget) {
                this[proxyTarget][idlAttributeName] = value;
              }
              if (!reflectToContentAttribute) {
                const oldValue = this.#idlAttributes.get(idlAttributeName);
                this.#idlAttributes.set(idlAttributeName, value);
                this.attributeChangedCallback(idlAttributeName, oldValue, value);

                return;
              }
              if (value) {
                this.setAttribute(contentAttributeName, '');
              } else {
                this.removeAttribute(contentAttributeName);
              }
            }
          });
          break;
        case 'number':
          Object.defineProperty(this.constructor.prototype, idlAttributeName, {
            get() {
              if (proxyTarget) {
                return parseFloat(this[proxyTarget][idlAttributeName], 10) || null;
              }
              if (!reflectToContentAttribute) {
                return parseFloat(this.#idlAttributes.get(idlAttributeName), 10) || parseFloat(defaultValue, 10) || null;
              }

              return parseFloat(this.getAttribute(contentAttributeName), 10) || parseFloat(defaultValue, 10) || null;
            },
            set(value) {
              if (readonly) {
                return;
              }
              if (proxyTarget) {
                this[proxyTarget][idlAttributeName] = value;
              }
              if (!reflectToContentAttribute) {
                const oldValue = this.#idlAttributes.get(idlAttributeName);
                this.#idlAttributes.set(idlAttributeName, value);
                this.attributeChangedCallback(idlAttributeName, oldValue, value);

                return;
              }
              this.setAttribute(contentAttributeName, value);
            }
          });
          break;
        default:
          Object.defineProperty(this.constructor.prototype, idlAttributeName, {
            get() {
              if (proxyTarget) {
                return this[proxyTarget][idlAttributeName];
              }

              if (!reflectToContentAttribute) {
                return this.#idlAttributes.get(idlAttributeName) || defaultValue || (attributeType === 'string' ? '' : null);
              }

              return this.getAttribute(contentAttributeName) || defaultValue || '';
            },
            set(value) {
              if (readonly) {
                return;
              }
              if (proxyTarget) {
                this[proxyTarget][idlAttributeName] = value;
              }
              if (!reflectToContentAttribute) {
                const oldValue = this.#idlAttributes.get(idlAttributeName);
                this.#idlAttributes.set(idlAttributeName, value);
                this.attributeChangedCallback(idlAttributeName, oldValue, value);

                return;
              }
              this.setAttribute(contentAttributeName, value);
            }
          });
          break;
      }
    }
    /**
     * @private
     * @method
     * @param {AttributeConfig[]}
     * @returns {void}
     */
    #setupAttributes(attributeConfigs) {
      attributeConfigs.forEach((attributeConfig) => {
        this.#setupAttribute(attributeConfig);
      });
    }
  }
};

export { attributesMixin };
