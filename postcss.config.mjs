import postcssImport from 'postcss-import';
import postcssNesting from 'tailwindcss/nesting/index.js';
import tailwindcss from 'tailwindcss';
import postcssStylus from 'postcss-stylus';

export default {
    plugins: {
        'postcss-import': postcssImport,          // to combine multiple css files
        'tailwindcss/nesting': postcssNesting,
        tailwindcss: tailwindcss,
        'postcss-stylus': postcssStylus,
    }
};
