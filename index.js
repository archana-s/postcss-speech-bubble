'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var postcss = require('postcss');

var getBeakerDeclarationValues = function getBeakerDeclarationValues(rule) {
  var bubbleBeakerValues = [];
  var position = null;
  var bubbleBackColor = null;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = rule.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var node = _step.value;

      switch (node.prop.trim().toLowerCase()) {
        case 'bubble-beaker':
          bubbleBeakerValues = node.value.split(' ');
          rule.removeChild(node);
          break;
        case 'position':
          position = node.value;
          break;
        case 'bubble-background':
          bubbleBackColor = node.value;
          rule.removeChild(node);
          break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return {
    bubbleBeakerValues: bubbleBeakerValues,
    position: position,
    bubbleBackColor: bubbleBackColor
  };
};

var extractBubbleAndBeakerSpecs = function extractBubbleAndBeakerSpecs(bubbleValues, beakerValues) {
  var bubble = {};
  var beaker = {};

  if (bubbleValues && bubbleValues.length !== 4) {
    throw 'Bubble is not correctly specified. Please check the docs\n    and provide the right values.';
  }

  if (beakerValues && beakerValues.length !== 2) {
    throw 'Bubble beaker is not specified correctly. Please check the docs and\n    provide the right values.';
  }

  var _bubbleValues = _slicedToArray(bubbleValues, 4);

  bubble.borderSize = _bubbleValues[0];
  bubble.borderRadius = _bubbleValues[1];
  bubble.type = _bubbleValues[2];
  bubble.color = _bubbleValues[3];

  if (beakerValues[1].indexOf('-') >= 0) {
    beaker.direction = beakerValues ? beakerValues[1].split('-')[0] : null;
    beaker.position = beakerValues ? beakerValues[1].split('-')[1] : null;
  } else {
    throw 'Beaker is not provided correctly. Please check the docs and\n    provide the right values.';
  }

  var possibleDirections = ['top', 'bottom', 'left', 'right'];
  var possiblePositions = ['top', 'bottom', 'left', 'right', 'center', 'middle'];

  if (possibleDirections.indexOf(beaker.direction) < 0 || possiblePositions.indexOf(beaker.position) < 0) {
    throw 'Beaker is not provided correctly. Please specify bubble-beaker:\n      <beaker size> <beaker position>. Beaker position should be top-left,\n      top-right, bottom-center, left-middle, etc.';
  }

  beaker.size = beakerValues ? beakerValues[0] : null;

  if (beaker.size.indexOf('px') < 0) {
    throw 'Expecting a px value for beaker size. Please do not provide other units';
  }

  return {
    bubble: bubble,
    beaker: beaker
  };
};

var addBubble = function addBubble(bubble, beaker, position, rule) {
  // Add border size for the bubble
  if (parseInt(bubble.borderSize, 10) > 0) {
    rule.append('border: ' + bubble.borderSize + ' solid ' + bubble.color);
  }

  if (bubble.type.toLowerCase() === 'solid') {
    rule.append('background-color: ' + bubble.color);
  }

  if (bubble.backColor) {
    rule.append('background-color: ' + bubble.backColor);
  }

  // Add border radius if any
  if (parseInt(bubble.borderRadius, 10) > 0) {
    rule.append('border-radius: ' + bubble.borderRadius);
  }

  // Adjust the positioning of the bubble based on beaker
  if (beaker.size && beaker.direction && parseInt(beaker.size, 10) > 0) {
    rule.append('margin-' + beaker.direction + ':' + beaker.size);
  }

  // Add position relative to container so the beaker will appear correctly.
  if (!position) {
    rule.append('position: relative');
  } else if (position !== 'absolute' || position !== 'relative') {
    throw 'Position for the bubble should either be absolute or relative.';
  }
};

var addBeaker = function addBeaker(bubble, beaker, rule) {
  // Add the beaker now
  var beforeRule = postcss.rule({ selector: rule.selector + ':before' });
  var afterRule = null;

  if (bubble.type === 'hollow') {
    // We need to add another beaker the same background color as the bubble
    // to create a caret look instead of triangle.
    afterRule = postcss.rule({ selector: rule.selector + ':after' });
  }

  var commonRules = ['content: \'\'', 'position: absolute'];

  var afterColor = bubble.backColor ? bubble.backColor : 'white';
  var transparentTriangle = beaker.size + ' solid transparent';
  var solidTriangle = beaker.size + ' solid ' + bubble.color;
  var border = parseInt(bubble.borderSize.split('px')[0], 10) || 1;
  border = border > 1 ? border + 1 : 1;

  // First add solid colored beaker
  switch (beaker.direction.toLowerCase()) {
    case 'top':
      beforeRule.append('top: -' + beaker.size);
      commonRules.push('border-left: ' + transparentTriangle);
      commonRules.push('border-right: ' + transparentTriangle);
      beforeRule.append('border-bottom: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('top: -' + (parseInt(beaker.size.split('px')[0], 10) - border) + 'px');
        afterRule.append('border-bottom: ' + beaker.size + ' solid ' + afterColor);
      }
      break;
    case 'bottom':
      beforeRule.append('bottom: -' + beaker.size);
      commonRules.push('border-left: ' + transparentTriangle);
      commonRules.push('border-right: ' + transparentTriangle);
      beforeRule.append('border-top: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('bottom: -' + (parseInt(beaker.size.split('px')[0], 10) - border) + 'px');
        afterRule.append('border-top: ' + beaker.size + ' solid ' + afterColor);
      }
      break;
    case 'left':
      beforeRule.append('left: -' + beaker.size);
      commonRules.push('border-top: ' + transparentTriangle);
      commonRules.push('border-bottom: ' + transparentTriangle);
      beforeRule.append('border-right: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('left: -' + (parseInt(beaker.size.split('px')[0], 10) - border) + 'px');
        afterRule.append('border-right: ' + beaker.size + ' solid ' + afterColor);
      }
      break;
    case 'right':
      beforeRule.append('right: -' + beaker.size);
      commonRules.push('border-top: ' + transparentTriangle);
      commonRules.push('border-bottom: ' + transparentTriangle);
      beforeRule.append('border-left: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('right: -' + (parseInt(beaker.size.split('px')[0], 10) - border) + 'px');
        afterRule.append('border-left: ' + beaker.size + ' solid ' + afterColor);
      }
      break;
    default:
      throw 'Provide correct position for bubble-beaker. Some examples\n        are top-right, top-center, left-middle, left-top';
  }

  var beakerPos = parseInt(beaker.size.split('px')[0], 10) * 1.5 + 'px';
  switch (beaker.position.toLowerCase()) {
    case 'left':
      commonRules.push('left: ' + beakerPos);
      break;
    case 'right':
      commonRules.push('right: ' + beakerPos);
      break;
    case 'center':
      commonRules.push('left: calc(50% - ' + beaker.size + ')');
      commonRules.push('transformX: -50%');
      break;
    case 'middle':
      commonRules.push('top: calc(50% - ' + beaker.size + ')');
      commonRules.push('transformY: -50%');
      break;
    case 'top':
      commonRules.push('top: ' + beakerPos);
      break;
    case 'bottom':
      commonRules.push('bottom: ' + beakerPos);
      break;
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = commonRules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _rule = _step2.value;

      beforeRule.append(_rule);
      if (afterRule) afterRule.append(_rule);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  rule.parent.nodes.push(beforeRule);
  if (afterRule) rule.parent.nodes.push(afterRule);
};

module.exports = postcss.plugin('postcss-bubble', function (opts) {
  opts = opts || {};

  return function (css) {
    css.walkDecls(function (decl, i) {
      var rule = decl.parent;
      var value = decl.prop;

      if (decl.prop === 'bubble') {
        // Get bubble beaker if specified
        var bubble = {};
        var beaker = {};

        var obj = getBeakerDeclarationValues(rule);
        var bubbleBeakerValues = obj.bubbleBeakerValues;
        var position = obj.position;
        var bubbleBackColor = obj.bubbleBackColor;

        // Consolidate all the values to construct
        var bubbleValues = decl.value.split(' ');

        var specs = extractBubbleAndBeakerSpecs(bubbleValues, bubbleBeakerValues);
        bubble = specs.bubble;
        bubble.backColor = bubbleBackColor;
        beaker = specs.beaker;

        addBubble(bubble, beaker, position, rule);
        addBeaker(bubble, beaker, rule);

        rule.removeChild(decl);
      }
    });
  };
});
