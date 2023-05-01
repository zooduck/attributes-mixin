# attributesMixin

## Description

This mixin is intended for use with Web Component (Custom Element) classes only. Its main purpose is to remove IDL Attribute boilerplate from your component class.

It will automatically add getter setters for your IDL Attributes to the prototype of your web component, generate the static observedAttributes getter for you and trigger the attributeChangedCallback lifecycle callback when a non-reflecting IDL attribute is changed.

Note: The web component should define its attributeChangedCallback lifecycle callback as normal.

### Usage

To use this mixin, your web component class must extend from the attributesMixin function and pass in either HTMLElement or a class definition that extends from or inherits HTMLElement.

Your web component class must define its attributes with an array of attribute config objects, assigned to a public static property called "attributes".

Each attribute config object must have at least an `idlName` or `contentName` property.

The majority of attributes in native elements are "reflecting" attributes. Setting the IDL Attribute updates the Content Attribute and vice versa. So in *most cases* you should provide a value for both `idlName` and `contentName`.

However, there are some attributes which have special behaviour, such as the `form` attribute of an input element, which has a readonly IDL Attribute (that returns an element) and a Content Attribute that is set to the id of the form the input is associated with.

In other words, the input element's `form` IDL Attribute is not even of the same type as its `form` Content Attribute. It functions as a readonly IDL Attrribute, which looks for a HTMLFormElement with an id matching the value of its `form` content attribute, and returns that element (or null).

To create a non-reflecting IDL Attribute, simply omit the `contentName` property.

To create a non-reflecting Content Attribute, simply omit the `idlName` property.

The available properties are listed below.

### Attribute Config

| property | type | description |
| -------- | ---- | ----------- |
| idlName | `string` | The IDL Attribute name. |
| contentName | `string` | The Content Attribute name. |
| defaultValue | `[any]` | The default or fallback value. |
| type | `[string]` | Possible values are `'boolean'`, `'number'` and `'string'` and determine the type of return value for the IDL Attribute.<br><br>If this property is ommitted, the return type will be the set value, the `defaultValue` or `null`. |
| readonly | `[boolean]` | This property requires either `defaultValue` or `[proxyTarget]` to be set.<br><br>It can only be used with an IDL Attribute that does not reflect to a Content Attribute (since there is no such thing as a readonly Content Attribute). |
| proxyTarget | `[string]` | Object to get and set the value from.<br><br>The value of this property must be a public property on your web component class. |

### Example

```javascript
class WebComponent extends attributesMixin(HTMLElement) {
  static attributes = [
    { idlName: 'nonReflectingAttribute' },
    { contentName: 'non-reflecting-attribute' },
    { idlName: 'reflectingAttribute', contentName: 'reflecting-attribute' },
    { idlName: 'readonlyAttribute', readonly: true, defaultValue: 'bananas' }
  ]
  constructor() {
    super()
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    console.log(attributeName, oldValue, newValue)
  }
}
customElements.define('web-component', WebComponent)

const webComponent = document.createElement('web-component')

webComponent.nonReflectingAttribute // null
webComponent.nonReflectingAttribute = 'bananas'
// console.log >> 'nonReflectingAttribute', null, 'bananas'
webComponent.nonReflectingAttribute // 'bananas'

webComponent.getAttribute('non-reflecting-attribute') // null
webComponent.setAttribute('non-reflecting-attribute', 'bananas')
// console.log >> 'non-reflecting-attribute', null, 'bananas'
webComponent.getAttribute('non-reflecting-attribute') // 'bananas'

webComponent.reflectingAttribute // ''
webComponent.getAttribute('reflecting-attribute') // null
webComponent.reflectingAttribute = 'bananas'
// console.log >> 'reflecting-attribute', null, 'bananas'
webComponent.getAttribute('reflecting-attribute') // 'bananas'
webComponent.setAttribute('reflecting-attribute', 'pyjamas')
// console.log >> 'reflecting-attribute', 'bananas', 'pyjamas'
webComponent.reflectingAttribute // 'pyjamas'

webComponent.readonlyAttribute // 'readonlyAttribute'
webComponent.readonlyAttribute = 'bananas'
webComponent.readonlyAttribute // 'readonlyAttribute'
```
