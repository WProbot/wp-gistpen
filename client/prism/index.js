import Prism from 'prismjs/components/prism-core';
import 'prismjs/plugins/autoloader/prism-autoloader';

// Prism highlights automatically by default.
document.removeEventListener('DOMContentLoaded', Prism.highlightAll);

// eslint-disable-next-line camelcase
Prism.plugins.autoloader.languages_path = __webpack_public_path__;

Prism.languages.none = {};

let currentTheme;

const plugins = {};

const extension = {
    setAutoloaderPath: path => Prism.plugins.autoloader.languages_path = path,
    setTheme: theme => import(
        `./themes/${theme}.js`
    )
        .then(({ theme }) =>
            new Promise(resolve => requestAnimationFrame(() => {
                if (currentTheme !== theme) {
                    if (currentTheme) {
                        currentTheme.unuse();
                    }

                    theme.use();

                    currentTheme = theme;
                }

                resolve(currentTheme);
            }))
        ),
    togglePlugin: (pluginKey, toggle) => import(
        `./plugins/${pluginKey}.js`
    )
        .then(({ plugin }) =>
            new Promise(resolve => requestAnimationFrame(() => {
                if (toggle && !plugins[pluginKey]) {
                    plugin.use();
                    plugins[pluginKey] = true;
                }

                if (!toggle && plugins[pluginKey]) {
                    plugin.unuse();
                    plugins[pluginKey] = false;
                }

                resolve(plugin);
            }))
        )
};

export default Object.assign({}, Prism, extension);
