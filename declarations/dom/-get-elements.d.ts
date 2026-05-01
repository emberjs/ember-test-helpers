import { type IDOMElementDescriptor } from 'dom-element-descriptors';
declare function getElements(target: string): NodeListOf<Element>;
declare function getElements(target: IDOMElementDescriptor): Iterable<Element>;
declare function getElements(target: string | IDOMElementDescriptor): Iterable<Element>;
export default getElements;
//# sourceMappingURL=-get-elements.d.ts.map