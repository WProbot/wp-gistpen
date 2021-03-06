// @flow
// @jsx h
import type { EditorPageProps } from '../types';
import type { Observable } from 'kefir';
import Kefir from 'kefir';
import { compose } from 'redux';
import { toJunction, h, loop, view } from 'brookjs-silt';
import injectSheet from 'react-jss';
import classNames from 'classnames';
import jss from 'jss';
import nested from 'jss-nested';
import { commitClick } from '../actions';
import { i18n, link } from '../helpers';
import Blob from './Blob';

jss.use(nested());

const styles = {
    container: {},
    header: {
        'margin-bottom': '10px',
    },
    app: {
        'display': 'flex',
        'flex-direction': 'row'
    },
    list: {
        'flex-grow': 25
    },
    preview: {
        'flex-grow': 75
    },
    item: {
        'background-color': 'white',
        'padding': '2px 10px',
        'margin': '10px',
        'box-shadow': '0 1px 1px 0 rgba(0, 0, 0, 0.1)',
        'cursor': 'pointer',
        'display': 'flex',
        'flex-direction': 'row',
        'align-items': 'center',

        '& p': {
            'margin': '0 2px'
        },

        '& img': {
            'flex-basis': '48px',
            'margin-right': '5px',
            'padding': '2px 0'
        }
    },
    selected: {
        'box-shadow': 'inset 0 1px 1px 0 rgba(0, 0, 0, 0.5)'
    }
};

type ClassMap = {
    [key: $Keys<typeof styles>]: string
};

const Commits = ({ classes, stream$, onCommitClick }: { classes: ClassMap, stream$: Observable<EditorPageProps>}) => (
    <div className={classes.container}>
        <div className={classes.header}>
            <a href={link('wpgp_route', 'editor')} type="button">
                {i18n('editor.return')}
            </a>
        </div>
        <div className={classes.app}>
            <div className={classes.list}>
                {stream$.thru(loop(({ commits }) => commits, (commit$, key) => (
                    <div key={key} className={commit$.thru(view(commit => classNames({
                        [classes.item]: true,
                        [classes.selected]: commit.selected
                    })))}
                    onClick={() => onCommitClick(key)}>
                        {commit$.thru(view(commit => commit.author))
                            .map(author => author ? <img src={author.avatar} alt={author.name} /> : null)}
                        <p><strong>{commit$.thru(view(commit => commit.description))}</strong></p>
                        <p>{commit$.thru(view(commit => commit.committed_at))}</p>
                    </div>
                )))}
            </div>
            <div className={classes.preview}>
                {stream$.thru(view(({ selectedCommit, prism }) => ({ selectedCommit, prism }))).map(({ selectedCommit, prism }) => (
                    selectedCommit ? (
                        <span>
                            <h3>{selectedCommit.description}</h3>
                            {selectedCommit.states.order.map(id => (
                                <Blob key={id}
                                    stream$={Kefir.constant({
                                        prism,
                                        blob: { ...selectedCommit.states.dict[id], language: selectedCommit.states.dict[id].language }
                                    })} />
                            ))}
                        </span>
                    ) : null
                ))}
            </div>
        </div>
    </div>
);

export default compose(
    toJunction({
        events: {
            onCommitClick: evt$ => evt$.map(key => commitClick(key))
        }
    }),
    injectSheet(styles)
)(Commits);
