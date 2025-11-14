export default function find<K extends keyof (HTMLElementTagNameMap | SVGElementTagNameMap)>(selector: K): HTMLElementTagNameMap[K] | SVGElementTagNameMap[K] | null;
export default function find<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
export default function find<K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
export default function find(selector: string): Element | null;
//# sourceMappingURL=find.d.ts.map