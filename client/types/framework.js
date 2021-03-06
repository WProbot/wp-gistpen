// @flow
import type { Observable } from 'kefir';

export type ComponentFactory<P, A> = (el: Element, props$: Observable<P>) => Observable<A>;

export type ViewDeltaConfig<P, A> = {
    root: ComponentFactory<P, A>,
    getElement: () => Observable<Element, Error>
};

export type Loopable<I, E> = {
    order: Array<I>,
    dict: {
        [key: I]: E
    }
};

export type ObservableProps<T> = {
    stream$: Observable<T>
};
