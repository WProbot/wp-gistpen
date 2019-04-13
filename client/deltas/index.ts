import { applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { observeDelta } from 'brookjs';

export * from './authorDelta';
export * from './commitsDelta';
export * from './jobsDelta';
export * from './repoDelta';

export const applyDelta = (...args: Array<any>) =>
  composeWithDevTools(applyMiddleware(observeDelta(...args)));