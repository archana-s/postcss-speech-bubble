import postcss from 'postcss';
import test    from 'ava';
import fs from 'fs';
import bubble from './';

require.extensions['.css'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

var inputCSS = require('./test/input.css');
var outputCSS = require('./test/output.css');

function run(t, input, output, opts = { }) {
    return postcss([ bubble(opts) ]).process(input)
        .then( result => {
            t.same(result.css, output);
            t.same(result.warnings().length, 0);
        });
}

test('converts bubble values to CSS', t => {
    return run(t, inputCSS.toString(), outputCSS.toString(), { });
});
