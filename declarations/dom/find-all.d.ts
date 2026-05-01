export default function findAll<K extends keyof (HTMLElementTagNameMap | SVGElementTagNameMap)>(selector: K): Array<HTMLElementTagNameMap[K] | SVGElementTagNameMap[K]>;
export default function findAll<K extends keyof HTMLElementTagNameMap>(selector: K): Array<HTMLElementTagNameMap[K]>;
export default function findAll<K extends keyof SVGElementTagNameMap>(selector: K): Array<SVGElementTagNameMap[K]>;
export default function findAll(selector: string): Element[];
//# sourceMappingURL=find-all.d.ts.map