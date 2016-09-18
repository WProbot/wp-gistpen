import R from 'ramda';
import { combineReducers } from 'redux';
import gist from './gist';
import prism from './prism';
import route from './route';

const defaultReducer = R.pipe(R.defaultTo({}), R.identity);

export default combineReducers({
    const: defaultReducer,
    route,
    prism,
    gist
});
