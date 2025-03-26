import { type Target } from './-target.ts';
import { type IDOMElementDescriptor } from 'dom-element-descriptors';
declare function getElement<K extends keyof (HTMLElementTagNameMap | SVGElementTagNameMap)>(target: K): (HTMLElementTagNameMap[K] | SVGElementTagNameMap[K]) | null;
declare function getElement<K extends keyof HTMLElementTagNameMap>(target: K): HTMLElementTagNameMap[K] | null;
declare function getElement<K extends keyof SVGElementTagNameMap>(target: K): SVGElementTagNameMap[K] | null;
declare function getElement(target: string): Element | null;
declare function getElement(target: Element): Element;
declare function getElement(target: IDOMElementDescriptor): Element | null;
declare function getElement(target: Document): Document;
declare function getElement(target: Window): Document;
declare function getElement(target: string | IDOMElementDescriptor): Element | null;
declare function getElement(target: Target): Element | Document | null;
export default getElement;
//# sourceMappingURL=-get-element.d.ts.map