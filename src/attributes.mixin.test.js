import { attributesMixin } from './attributes.mixin.js';

const attributes = [
  { idlName: 'attributeX' },
  { contentName: 'content-attribute-a' },
  { idlName: 'attributeB', contentName: 'content-attribute-b' },
  { idlName: 'value', proxyTarget: 'proxyTargetA' },
  { idlName: 'placeholder', proxyTarget: 'proxyTargetA', readonly: true },
  { idlName: 'proxyTargetNumber', type: 'number', proxyTarget: 'proxyTargetB' },
  { idlName: 'proxyTargetBoolean', type: 'boolean', proxyTarget: 'proxyTargetB' },
  { idlName: 'readonlyString', readonly: true, defaultValue: 'abc' },
  { idlName: 'readonlyNumber', type: 'number', readonly: true, defaultValue: 123.456 },
  { idlName: 'readonlyBoolean', type: 'boolean', readonly: true, defaultValue: true },
  { idlName: 'label', proxyTarget: 'proxyTargetB' },
  { idlName: 'mabel', proxyTarget: 'proxyTargetB', readonly: true },
  { idlName: 'boolean', type: 'boolean' },
  { idlName: 'number', type: 'number' },
  { idlName: 'booleanThatReflects', contentName: 'boolean-that-reflects', type: 'boolean' },
  { idlName: 'numberThatReflects', contentName: 'number-that-reflects', type: 'number' }
];

class WebComponent extends attributesMixin(HTMLElement) {
  proxyTargetA = document.createElement('input');
  proxyTargetB = { label: '', mabel: '', proxyTargetNumber: null };
  static attributes = attributes;
  constructor() {
    super();
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    this.attributeChangedCallbackSpy(attributeName, oldValue, newValue);
  }
  attributeChangedCallbackSpy(_attributeName, _oldValue, _newValue) {}
}

customElements.define('web-component', WebComponent);

class WebComponentX extends attributesMixin(HTMLElement) {
  static attributes = [
    { idlName: 'attributeX' },
    { idlName: 'idlAttributeWebComponentX', contentName: 'content-attribute-web-component-x' },
  ];
  constructor() {
    super();
  }
}

customElements.define('web-component-x', WebComponentX);

describe('attributesMixin', () => {
  let webComponent;
  beforeEach(() => {
    webComponent = document.createElement('web-component');
  });

  it('should be work with more than one component sub class', () => {
    const webComponentX = document.createElement('web-component-x');

    expect(webComponentX.attributeX).toBeNull();
    expect(webComponent.attributeX).toBeNull();

    webComponentX.attributeX = 1;
    webComponent.attributeX = 2;

    expect(webComponentX.attributeX).toEqual(1);
    expect(webComponent.attributeX).toEqual(2);

    webComponentX.idlAttributeWebComponentX = 'abc';
    webComponent.idlAttributeWebComponentX = 'abc';

    expect(webComponentX.idlAttributeWebComponentX).toEqual('abc');
    expect(webComponentX.getAttribute('content-attribute-web-component-x')).toEqual('abc');
    expect(webComponent.idlAttributeWebComponentX).toEqual('abc');
    expect(webComponent.getAttribute('content-attribute-web-component-x')).toBeNull();

    webComponent.value = '123';

    expect(webComponentX.value).toBeUndefined();
    expect(webComponentX.proxyTargetA).toBeUndefined();
    expect(webComponent.value).toEqual('123');
    expect(webComponent.proxyTargetA.value).toEqual('123');
  });

  describe('errors', () => {
    describe('constructor', () => {
      it('should throw an error if the Base parameter is not HTMLElement or does not extend from or inherit HTMLElement', () => {
        class A extends Element {}
        class B extends Node {}
        class C {}

        expect(() => {
          // eslint-disable-next-line no-unused-vars
          class Test extends attributesMixin(A) {}
        }).toThrow('Base parameter must be HTMLElement or a class that extends from or inherits HTMLElement. Received A which is not an instance of HTMLElement.');

        expect(() => {
          // eslint-disable-next-line no-unused-vars
          class Test extends attributesMixin(B) {}
        }).toThrow('Base parameter must be HTMLElement or a class that extends from or inherits HTMLElement. Received B which is not an instance of HTMLElement.');

        expect(() => {
          // eslint-disable-next-line no-unused-vars
          class Test extends attributesMixin(C) {}
        }).toThrow('Base parameter must be HTMLElement or a class that extends from or inherits HTMLElement. Received C which is not an instance of HTMLElement.');
      });
    });

    // ===========================================================================================================================
    // This suite of tests cause the correct errors to be thrown, but jest does not catch them in the expect callbacks.
    // So if you run them, code coverage should be 100%, but there will be 3 "failing" tests, because uncaught errors are thrown.
    // ---------------------------------------------------------------------------------------------------------------------------
    // I have tried wrapping the document.createElement() in a try catch, but this does not catch the errors either =/
    // ===========================================================================================================================
    describe('instance', () => {
      xit('should throw an error if proxyTarget is set without idlName being set', () => {
        class WebComponentErrorA extends attributesMixin(HTMLElement) {
          static attributes =  [{ contentName: 'potato', proxyTarget: 'proxyTarget' }];
          constructor() {
            super();
          }
        }
        customElements.define('web-component-error-a', WebComponentErrorA);

        expect(() => {
          document.createElement('web-component-error-a');
        }).toThrow('You must provide a value for "idlName" when using a proxyTarget.');
      });

      xit('should throw an error if both contentName and proxyTarget are set', () => {
        class WebComponentErrorB extends attributesMixin(HTMLElement) {
          static attributes =  [{ idlName: 'potato', contentName: 'potato', proxyTarget: 'proxyTarget' }];
          constructor() {
            super();
          }
        }
        customElements.define('web-component-error-b', WebComponentErrorB);

        expect(() => {
          document.createElement('web-component-error-b');
        }).toThrow('The "contentName" and "proxyTarget" properties cannot be used together.');
      });

      xit('should throw an error if one of either proxyTarget or defaultValue is not set and readonly is set to `true`', () => {
        class WebComponentErrorC extends attributesMixin(HTMLElement) {
          static attributes =  [{ idlName: 'potato', readonly: true }];
          constructor() {
            super();
          }
        }
        customElements.define('web-component-error-c', WebComponentErrorC);

        expect(() => {
          document.createElement('web-component-error-c');
        }).toThrow('You must provide a proxyTarget or defaultValue for readonly attributes.');
      });
    });
  });

  describe('static get observedAttributes()', () => {
    it('should set the public static observedAttributes getter to contain all contentName values (content attribute names)', () => {
      expect(WebComponent.observedAttributes).toEqual([
        'content-attribute-a',
        'content-attribute-b',
        'boolean-that-reflects',
        'number-that-reflects'
      ]);
    });

    it('should call the attributeChangedCallback lifecycle callback when an observed attribute\'s value changes', () => {
      const lifecycleCallbackSpy = jest.spyOn(webComponent, 'attributeChangedCallbackSpy');

      expect(lifecycleCallbackSpy).not.toHaveBeenCalled();

      webComponent.setAttribute('test', 'abc');

      expect(lifecycleCallbackSpy).not.toHaveBeenCalled();

      webComponent.setAttribute('content-attribute-a', 'abc');
      webComponent.setAttribute('content-attribute-b', '123');

      expect(lifecycleCallbackSpy).toHaveBeenCalledTimes(2);
    });

    it('should call the attributeChangedCallback lifecycle callback when an observed non-reflecting IDL attribute\'s value changes', () => {
      const lifecycleCallbackSpy = jest.spyOn(webComponent, 'attributeChangedCallbackSpy');

      expect(lifecycleCallbackSpy).not.toHaveBeenCalled();

      webComponent.attributeX = 123;

      expect(lifecycleCallbackSpy).toHaveBeenCalledTimes(1);
      expect(webComponent.getAttribute('attributeX')).toBeNull();
      expect(webComponent.getAttribute('attribute-x')).toBeNull();
    });
  });

  describe('contentName', () => {
    it('should not create an IDL attribute getter setter if no idlName is provided', () => {
      expect(webComponent.attributeA).toBeUndefined();
      expect(webComponent.getAttribute('content-attribute-a')).toBeNull();

      webComponent.attributeA = 'abc';

      expect(webComponent.attributeA).toEqual('abc');
      expect(webComponent.getAttribute('content-attribute-a')).toBeNull();

      webComponent.setAttribute('content-attribute-a', '123');

      expect(webComponent.attributeA).toEqual('abc');
      expect(webComponent.getAttribute('content-attribute-a')).toEqual('123');
    });
  });

  describe('idlName', () => {
    it('should not reflect to a content attribute if no contentName is set', () => {
      expect(webComponent.attributeX).toBeNull();
      expect(webComponent.getAttribute('attribute-x')).toBeNull();

      webComponent.attributeX = 'abc';

      expect(webComponent.attributeX).toEqual('abc');
      expect(webComponent.getAttribute('attribute-x')).toBeNull();

      webComponent.setAttribute('attribute-x', '123');

      expect(webComponent.attributeX).toEqual('abc');
      expect(webComponent.getAttribute('attribute-x')).toEqual('123')
    });

    it('should call the attributeChangedCallback() lifecycle callback when an IDL attribute value changes', () => {
      const lifecycleCallbackSpy = jest.spyOn(webComponent, 'attributeChangedCallbackSpy');

      expect(lifecycleCallbackSpy).not.toHaveBeenCalled();

      webComponent.nonExistantAttribute = 'abc';

      expect(lifecycleCallbackSpy).not.toHaveBeenCalled();

      webComponent.attributeX = 'abc';
      webComponent.attributeX = '123';

      expect(lifecycleCallbackSpy).toHaveBeenCalledTimes(2);
    });

    describe('type', () => {
      it('should create an IDL attribute that always returns a boolean', () => {
        expect(webComponent.boolean).toEqual(false);

        webComponent.boolean = 123;

        expect(webComponent.boolean).toEqual(true);

        webComponent.boolean = '';

        expect(webComponent.boolean).toEqual(false);
      });

      it('should create a an IDL attribute that always returns a number or null', () => {
        expect(webComponent.number).toEqual(null);

        webComponent.number = 123;

        expect(webComponent.number).toEqual(123);

        webComponent.number = '123.456';

        expect(webComponent.number).toEqual(123.456);
      });
    });
  });

  describe('idlName + contentName', () => {
    it('should reflect IDL attributes to content attributes and vice versa', () => {
      expect(webComponent.attributeB).toEqual('');
      expect(webComponent.getAttribute('content-attribute-b')).toBeNull();

      webComponent.attributeB = 'abc';

      expect(webComponent.attributeB).toEqual('abc');
      expect(webComponent.getAttribute('content-attribute-b')).toEqual('abc');

      webComponent.setAttribute('content-attribute-b', '123');

      expect(webComponent.attributeB).toEqual('123');
      expect(webComponent.getAttribute('content-attribute-b')).toEqual('123');
    });

    describe('type', () => {
      it('should create an IDL attribute that always returns a boolean, and a content attribute that is removed when the IDL attribute is set to `false`', () => {
        expect(webComponent.booleanThatReflects).toEqual(false);
        expect(webComponent.hasAttribute('boolean-that-reflects')).toEqual(false);
        expect(webComponent.getAttribute('boolean-that-reflects')).toBeNull();

        webComponent.booleanThatReflects = true;

        expect(webComponent.booleanThatReflects).toEqual(true);
        expect(webComponent.hasAttribute('boolean-that-reflects')).toEqual(true);
        expect(webComponent.getAttribute('boolean-that-reflects')).toEqual('');

        webComponent.booleanThatReflects = '';

        expect(webComponent.booleanThatReflects).toEqual(false);
        expect(webComponent.hasAttribute('boolean-that-reflects')).toEqual(false);
        expect(webComponent.getAttribute('boolean-that-reflects')).toBeNull();
      });

      it('should create a an IDL attribute that always returns a number or null, and a content attribute that always returns a string if value is set', () => {
        expect(webComponent.numberThatReflects).toEqual(null);
        expect(webComponent.getAttribute('number-that-reflects')).toEqual(null);

        webComponent.numberThatReflects = 123;

        expect(webComponent.numberThatReflects).toEqual(123);
        expect(webComponent.getAttribute('number-that-reflects')).toEqual('123');

        webComponent.numberThatReflects = '123.456';

        expect(webComponent.numberThatReflects).toEqual(123.456);
        expect(webComponent.getAttribute('number-that-reflects')).toEqual('123.456');

        webComponent.setAttribute('number-that-reflects', '123456.789');

        expect(webComponent.numberThatReflects).toEqual(123456.789);
        expect(webComponent.getAttribute('number-that-reflects')).toEqual('123456.789');
      });
    });
  });

  describe('idlName + readonly', () => {
    it('should create a readonly IDL attribute that does not reflect to a content attribute', () => {
      expect(webComponent.readonlyString).toEqual('abc');
      expect(webComponent.getAttribute('readonly-string')).toBeNull();

      webComponent.readonlyString = 'abc';

      expect(webComponent.readonlyString).toEqual('abc');
      expect(webComponent.getAttribute('readonly-string')).toBeNull();

      webComponent.setAttribute('readonly-string', 'xyz');

      expect(webComponent.readonlyString).toEqual('abc');
      expect(webComponent.getAttribute('readonly-string')).toEqual('xyz');
    });

    describe('type', () => {
      describe('boolean', () => {
        it('should create a readonly IDL attribute that does not reflect to a content attribute', () => {
          expect(webComponent.readonlyBoolean).toEqual(true);
          expect(webComponent.getAttribute('readonly-boolean')).toBeNull();

          webComponent.readonlyBoolean = false;

          expect(webComponent.readonlyBoolean).toEqual(true);
          expect(webComponent.getAttribute('readonly-boolean')).toBeNull();

          webComponent.setAttribute('readonly-boolean', 'abc');

          expect(webComponent.readonlyBoolean).toEqual(true);
          expect(webComponent.getAttribute('readonly-boolean')).toEqual('abc');
        });
      });

      describe('number', () => {
        it('should create a readonly IDL attribute that does not reflect to a content attribute', () => {
          expect(webComponent.readonlyNumber).toEqual(123.456);
          expect(webComponent.getAttribute('readonly-number')).toBeNull();

          webComponent.readonlyNumber = 789;

          expect(webComponent.readonlyNumber).toEqual(123.456);
          expect(webComponent.getAttribute('readonly-number')).toBeNull();

          webComponent.setAttribute('readonly-number', '789.123');

          expect(webComponent.readonlyNumber).toEqual(123.456);
          expect(webComponent.getAttribute('readonly-number')).toEqual('789.123');
        });
      });
    });
  });

  describe('proxyTarget', () => {
    it('should use the proxyTarget to get and set the value', () => {
      // proxyTargetA: HTMLInputElement
      expect(webComponent.proxyTargetA.value).toEqual('');
      expect(webComponent.value).toEqual('');

      webComponent.proxyTargetA.value = 'abc';

      expect(webComponent.proxyTargetA.value).toEqual('abc');
      expect(webComponent.value).toEqual('abc');

      webComponent.value = '123';

      expect(webComponent.proxyTargetA.value).toEqual('123');
      expect(webComponent.value).toEqual('123');

      // proxyTargetB: { label: '', mabel: '', proxyTargetNumber: null }
      expect(webComponent.proxyTargetB.label).toEqual('');
      expect(webComponent.label).toEqual('');

      webComponent.proxyTargetB.label = 'abc';

      expect(webComponent.proxyTargetB.label).toEqual('abc');
      expect(webComponent.label).toEqual('abc');

      webComponent.label = '123';

      expect(webComponent.proxyTargetB.label).toEqual('123');
      expect(webComponent.label).toEqual('123');
    });
    describe('type', () => {
      describe('number', () => {
        it('should use the proxyTarget to get and set the value', () => {
          // proxyTargetB: { label: '', mabel: '', proxyTargetNumber: null }
          expect(webComponent.proxyTargetB.proxyTargetNumber).toEqual(null);
          expect(webComponent.proxyTargetNumber).toEqual(null);

          webComponent.proxyTargetB.proxyTargetNumber = 123;

          expect(webComponent.proxyTargetB.proxyTargetNumber).toEqual(123);
          expect(webComponent.proxyTargetNumber).toEqual(123);

          webComponent.proxyTargetNumber = '123.456';

          expect(webComponent.proxyTargetB.proxyTargetNumber).toEqual('123.456');
          expect(webComponent.proxyTargetNumber).toEqual(123.456);
        });
      });

      describe('boolean', () => {
        it('should use the proxyTarget to get and set the value', () => {
          // proxyTargetB: { label: '', mabel: '', proxyTargetNumber: null }
          expect(webComponent.proxyTargetB.proxyTargetBoolean).toBeUndefined();
          expect(webComponent.proxyTargetBoolean).toEqual(false);

          webComponent.proxyTargetB.proxyTargetBoolean = true;

          expect(webComponent.proxyTargetB.proxyTargetBoolean).toEqual(true);
          expect(webComponent.proxyTargetBoolean).toEqual(true);

          webComponent.proxyTargetBoolean = false;

          expect(webComponent.proxyTargetB.proxyTargetBoolean).toEqual(false);
          expect(webComponent.proxyTargetBoolean).toEqual(false);
        });
      });
    })
  });

  describe('proxyTarget + readonly', () => {
    it('should use the proxyTarget to get the IDL attribute value from only, when readonly is set to `true`', () => {
      // proxyTargetA: HTMLInputElement
      expect(webComponent.proxyTargetA.placeholder).toEqual('');
      expect(webComponent.placeholder).toEqual('');

      webComponent.placeholder = 'abc';

      expect(webComponent.proxyTargetA.placeholder).toEqual('');
      expect(webComponent.placeholder).toEqual('');

      webComponent.proxyTargetA.placeholder = 'abc';

      expect(webComponent.proxyTargetA.placeholder).toEqual('abc');
      expect(webComponent.placeholder).toEqual('abc');

      // proxyTargetB: { label: '', mabel: '', proxyTargetNumber: null }
      expect(webComponent.proxyTargetB.mabel).toEqual('');
      expect(webComponent.mabel).toEqual('');

      webComponent.mabel = 'abc';

      expect(webComponent.proxyTargetB.mabel).toEqual('');
      expect(webComponent.mabel).toEqual('');

      webComponent.proxyTargetB.mabel = 'abc';

      expect(webComponent.proxyTargetB.mabel).toEqual('abc');
      expect(webComponent.mabel).toEqual('abc');
    });
  });
});
