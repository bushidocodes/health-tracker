// Shared styles composed into each component's `static styles`.
//
// Lit adopts these CSSResults as constructable stylesheets, so they are shared
// (not duplicated) across shadow roots. Design tokens (--ht-*) are defined on
// :root in css/style.css and pierce shadow boundaries.

import { css } from './vendor/lit-core.min.js';

export const card = css`
  :host {
    display: block;
    margin-bottom: 1.5rem;
  }
  .card {
    background: var(--ht-card-bg);
    border: 1px solid var(--ht-border);
    border-radius: var(--ht-radius);
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  h2 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-weight: 500;
  }
`;

export const form = css`
  .field {
    margin-bottom: 1rem;
    border: 0;
    padding: 0;
  }
  label {
    display: block;
    margin-bottom: 0.35rem;
    font-weight: 500;
  }
  input[type='text'],
  select {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--ht-text);
    background: #fff;
    border: 1px solid var(--ht-border);
    border-radius: var(--ht-radius);
  }
  input[type='text']:focus,
  select:focus {
    outline: none;
    border-color: var(--ht-primary);
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const button = css`
  .btn {
    display: inline-block;
    font-size: 1rem;
    line-height: 1.5;
    padding: 0.5rem 0.9rem;
    border: 1px solid transparent;
    border-radius: var(--ht-radius);
    cursor: pointer;
    user-select: none;
  }
  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  .btn-primary {
    color: #fff;
    background: var(--ht-primary);
    border-color: var(--ht-primary);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--ht-primary-dark);
    border-color: var(--ht-primary-dark);
  }
  .btn-outline {
    color: var(--ht-text);
    background: transparent;
    border-color: var(--ht-border);
  }
  .btn-outline:hover {
    background: #f1f3f5;
  }
`;

export const table = css`
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }
  th,
  td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-top: 1px solid var(--ht-border);
    vertical-align: middle;
  }
  thead th {
    border-top: 0;
    border-bottom: 2px solid var(--ht-border);
  }
  th:nth-of-type(1) { width: 70%; }
  th:nth-of-type(2),
  th:nth-of-type(3),
  th:nth-of-type(4) { width: 10%; }
`;

// Visually-hidden helper (mirrors Bootstrap's .sr-only).
export const srOnly = css`
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
