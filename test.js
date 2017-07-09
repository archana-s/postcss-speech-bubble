import postcss from 'postcss';
import test    from 'ava';
import fs from 'fs';
import bubble from './';

require.extensions['.css'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

var inputCSS = require('./test/input.css');
var outputCSS = require('./test/output.css');

var inputBubbleNotCorrect = require('./test/input_bubbleIncorrect.css');
var inputBeakerNotSpecified = require('./test/input_bubbleBeakerNotSpecified.css');
var inputBeakerNotSpecifiedCorrectly = require('./test/input_beakerIncorrect.css');
var inputBeakerPositionDirectionIncorrect = require('./test/input_beakerPositionDirectionIncorrect.css');

function run(t, input, output, opts = { }) {
    return postcss([ bubble(opts) ]).process(input)
        .then( result => {
            if (opts.shouldThrowError) {
              t.fail();
            }
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, opts.error || 0);
        })
        .catch( () => {
          if (opts.shouldThrowError) {
            t.pass();
          }
        });
}

test('converts bubble values to CSS', t => {
    return run(t, inputCSS.toString(), outputCSS.toString(), { });
});

test('throws exception when bubble is not specified correctly', t => {
    return run(t, inputBubbleNotCorrect, '', { shouldThrowError: true });
});

test('throws exception when bubble-beaker is not specified', t => {
    return run(t, inputBeakerNotSpecified, '', { shouldThrowError: true });
});

test('throws exception when bubble-beaker is not specified correctly', t => {
    return run(t, inputBeakerNotSpecifiedCorrectly, '',
      { shouldThrowError: true });
});

test('throws exception when bubble-beaker position/direction is not specified correctly', t => {
    return run(t, inputBeakerPositionDirectionIncorrect, '',
      { shouldThrowError: true });
});
