// Type declarations for the vendored Lit bundle.
// These keep tsc happy without processing the minified source.

export declare abstract class LitElement extends HTMLElement {
  static properties: Record<string, any>;
  static styles: any | any[];
  addController(c: { hostConnected?(): void; hostDisconnected?(): void }): void;
  requestUpdate(): Promise<boolean>;
  connectedCallback(): void;
  disconnectedCallback(): void;
  render?(): unknown;
  readonly renderRoot: ShadowRoot | Element;
}

export declare function html(strings: TemplateStringsArray, ...values: unknown[]): unknown;
export declare function css(strings: TemplateStringsArray, ...values: unknown[]): unknown;
export declare const nothing: unique symbol;
