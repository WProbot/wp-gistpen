// @flow
// @jsx h
/* global jQuery, tinymce */
import type { Emitter, Observable } from 'kefir';
import type { SearchProps } from '../components';
import type { TinyMCEState } from '../reducers';
import type { TinyMCEAction as Action, TinyMCEEditor as Editor, Blob } from '../types';
import R from 'ramda';
import Kefir from 'kefir';
import { ofType } from 'brookjs';
import { tinymceButtonClickAction, tinymcePopupInsertClickAction, tinymcePopupCloseClickAction,
    TINYMCE_BUTTON_CLICK, TINYMCE_POPUP_CLOSE_CLICK, TINYMCE_POPUP_INSERT_CLICK } from '../actions';
import { Search } from '../components';
import { h, RootJunction, view } from 'brookjs-silt';
import { render, unmountComponentAtNode } from 'react-dom';

const createTinyMCEPlugin = (): Observable<Editor> => Kefir.stream((emitter: Emitter<Editor, void>) => {
    tinymce.PluginManager.add('wp_gistpen', emitter.value);
});

const createTinyMCEButton = (actions$: Observable<Action>, state$: Observable<TinyMCEState>, editor: Editor): Observable<Action> =>Kefir.merge([
    Kefir.stream((emitter: Emitter<Action, void>) => {
        // Bind command to stream.
        editor.addCommand('wpgp_insert', () => void emitter.value(tinymceButtonClickAction()));

        // Add the Insert Gistpen button
        editor.addButton('wp_gistpen', {
            icon: 'icons dashicons-editor-code',
            tooltip: 'Insert Gistpen',
            cmd: 'wpgp_insert'
        });
    }),
    state$.sampledBy(actions$.thru(ofType(TINYMCE_POPUP_INSERT_CLICK)))
        .flatMap((state: TinyMCEState) => Kefir.stream((emitter: Emitter<Action, void>) => {
            if (state.search.selection != null) {
                editor.insertContent('[gistpen id="' + state.search.selection + '"]');
            }

            emitter.end();
        }))
]);

const emitTinyMCEWindow = R.curry((editor: Editor, emitter: Emitter<Action, Element>): Disposer => {
    const id = `wpgp-tinymce-popup-container`;
    const e = editor.windowManager.open({
        // Modal settings
        title: 'Insert Gistpen',
        width: 400,
        // minus head and foot of dialog box
        height: (300 - 36 - 50),
        inline: 1,
        id,
        buttons: [
            {
                text: 'Insert',
                id: 'wpgp-popup-insert',
                onclick: R.pipe(tinymcePopupInsertClickAction, emitter.value)
            },
            {
                text: 'Cancel',
                id: 'wpgp-popup-cancel',
                onclick: R.pipe(tinymcePopupCloseClickAction, emitter.value)
            }
        ]
    });

    const $el = jQuery('<div class="app"></div>');

    e.$el.find(`#${id}-body`).append($el);

    emitter.error($el[0]);

    // void the return value for tcomb
    return (): void => void e.close();
});

const createTinyMCEWindow = (actions$: Observable<Action>, state$: Observable<TinyMCEState>, editor: Editor): Observable<Action> => Kefir.stream(emitTinyMCEWindow(editor))
    // This is kind of abusive, b/c it's not an "error", but it's another channel to use...
    .flatMapErrors((el: Element) => Kefir.stream(emitter => {
        render(
            <RootJunction action$={action$ => action$.observe(emitter)}>
                <Search stream$={state$.thru(view((state: TinyMCEState): SearchProps => ({
                    loading: state.ajax.running,
                    term: state.search.term,
                    results: {
                        order: state.search.results.map((blob: Blob) => blob.ID),
                        dict: state.search.results.reduce((acc: { [key: number | string]: Blob }, blob: Blob) => ({
                            ...acc,
                            [blob.ID]: blob
                        }), {})
                    }
                })))}/>
            </RootJunction>,
            el
        );

        return () => unmountComponentAtNode(el);
    }))
    .takeUntilBy(actions$.thru(ofType(TINYMCE_POPUP_CLOSE_CLICK, TINYMCE_POPUP_INSERT_CLICK)));

const mergeTinyMCEButtonAndPopup = R.curry((actions$: Observable<Action>, state$: Observable<TinyMCEState>, editor: Editor): Observable<Action> => Kefir.merge([
    createTinyMCEButton(actions$, state$, editor),
    actions$.thru(ofType(TINYMCE_BUTTON_CLICK))
        .flatMapLatest((): Observable<Action> => createTinyMCEWindow(actions$, state$, editor))
]));

export default (actions$: Observable<Action>, state$: Observable<TinyMCEState>): Observable<Action> =>
    createTinyMCEPlugin().flatMapLatest(mergeTinyMCEButtonAndPopup(actions$, state$));
