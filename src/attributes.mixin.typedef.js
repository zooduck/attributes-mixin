/**
 * @typedef {Object} AttributeConfig
 * @property {string} idlName - The name of the IDL Attribute (also known as DOM Property) i.e. readOnly.
 * @property {string} contentName - The name of the Content Attribute i.e readonly.
 * @property {string} [proxyTarget] - Optional proxyTarget to use instead of the element's content attribute interface. Requires idlName to be set. Must be a property that exists on the element sub class.
 * @property {boolean|number} [attributeType] - Instructs the IDL Attribute getter to parse the value as a boolean or number.
 * @property {*} [defaultValue] - The default or fallback value to use when the attribute has not been set. If the attribute reflects to a content attribute that is not of type boolean or number, this is also the value that will be returned if the attribute is set to an empty string.
 * @property {boolean} [readonly] - If this property is set to true, you must provide either a proxyTarget or defaultValue.
 */
