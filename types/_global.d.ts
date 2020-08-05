declare const d: Document;
declare const messageId: string;

declare function $<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  root?: ParentNode,
): HTMLElementTagNameMap[K] | null;
declare function $<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  root?: ParentNode,
): SVGElementTagNameMap[K] | null;
declare function $<E extends Element = Element>(
  selectors: string,
  root?: ParentNode,
): E | null;

declare function $$<K extends keyof HTMLElementTagNameMap>(
  selectors: K,
  root?: ParentNode,
): NodeListOf<HTMLElementTagNameMap[K]>;
declare function $$<K extends keyof SVGElementTagNameMap>(
  selectors: K,
  root?: ParentNode,
): NodeListOf<SVGElementTagNameMap[K]>;
declare function $$<E extends Element = Element>(
  selectors: string,
  root?: ParentNode,
): NodeListOf<E>;

declare function on(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): void;

declare function off(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): void;

declare module "*.css.inc" {
  const value: string;
  export default value;
}
