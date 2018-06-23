// @flow
import type { Route } from '../types';
import R from 'ramda';

export const parseQueryString : ((query: string) => { [key: string]: string }) = R.pipe(
    R.tail,
    R.split('&'),
    R.map(R.split('=')),
    R.fromPairs
);

export const buildQueryString : ((obj: { [key: string]: string }) => string) = R.pipe(
    R.toPairs,
    R.map(R.join('=')),
    R.join('&'),
    R.concat('?')
);

export const getRoute = (search: string, param: string): string => {
    const query = R.defaultTo('', parseQueryString(search)[param]);

    return R.concat('/', query);
};

export const generateParam = (route: Route): string => {
    let param = route.name;

    if (route.name === 'jobs' && typeof route.parts.job === 'string') {
        param = typeof route.parts.run === 'string' ?
            `${param}/${route.parts.job}/${route.parts.run}` :
            `${param}/${route.parts.job}`;
    }

    return param;
};

export const getSearch = (param: string, route: Route): string => {
    return buildQueryString({
        ...parseQueryString(window.location.search),
        [param]: generateParam(route)
    });
};

export const getUrl = (param: string, route: Route) => window.location.pathname + getSearch(param, route);
