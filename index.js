var postcss = require('postcss');

var getBeakerDeclarationValues = function(rule) {
  var bubbleBeakerValues = [];
  var positionSpecified = null;
  var bubbleBackColor = null;

  for (var i=0; i < rule.nodes.length; i++) {
    switch (rule.nodes[i].prop.trim().toLowerCase()) {
      case 'bubble-beaker':
        bubbleBeakerValues = rule.nodes[i].value.split(' ');
        rule.removeChild(rule.nodes[i]);
        break;
      case 'position':
        positionSpecified = rule.nodes[i].value;
        break;
      case 'bubble-background':
        bubbleBackColor = rule.nodes[i].value;
        rule.removeChild(rule.nodes[i]);
        break;
    }
  }
  return {
    bubbleBeakerValues: bubbleBeakerValues,
    position: positionSpecified,
    bubbleBackColor: bubbleBackColor
  };
};

var extractBubbleAndBeakerSpecs = function(bubbleValues, beakerValues) {
  var bubble = {};
  var beaker = {};

  if (bubbleValues && bubbleValues.length !== 4) {
    throw 'Bubble is not correctly specified. Please check the docs and provide the right values.';
  }

  if (beakerValues && beakerValues.length !== 2) {
    throw 'Bubble beaker is not specified correctly. Please check the docs and provide the right values.';
  }

  bubble.borderSize  = bubbleValues[0];
  bubble.borderRadius = bubbleValues[1];
  bubble.type = bubbleValues[2];
  bubble.color = bubbleValues[3];

  if (beakerValues[1].indexOf('-') >= 0) {
    beaker.direction = beakerValues ? (beakerValues[1].split('-'))[0] : null;
    beaker.position = beakerValues ? (beakerValues[1].split('-'))[1] : null;
  } else {
    throw 'Beaker is not provided correctly. Please check the docs and provide the right values.';
  }

  if ((beaker.direction !== 'top' && beaker.direction !== 'bottom' && beaker.direction !== 'left' && beaker.direction !== 'right') ||
    (beaker.position !== 'top' && beaker.position !== 'right' && beaker.position !== 'left' && beaker.position !== 'bottom' &&
    beaker.position !== 'center' && beaker.position !== 'middle')) {
    throw 'Beaker is not provided correctly. Please specify bubble-beaker: <beaker size> <beaker position>. Beaker position should be top-left, top-right, bottom-center, left-middle, etc.';
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

var addBubble = function(bubble, beaker, position, rule) {
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
  if (beaker.size && beaker.direction
    && parseInt(beaker.size, 10) > 0) {
    rule.append('margin-' + beaker.direction + ':' + beaker.size);
  }

  // Add position relative to container so the beaker will appear correctly.
  if (!position) {
    rule.append('position: relative');
  } else if (position !== 'absolute' || position !== 'relative') {
    throw 'Position for the bubble should either be absolute or relative.';
  }
};

var addBeaker = function(bubble, beaker, rule) {
  // Add the beaker now
  var beforeRule = postcss.rule({selector: rule.selector + ':before'});
  var afterRule = null;

  if (bubble.type === 'hollow') {
    // We need to add another beaker the same background color as the bubble
    // to create a caret look instead of triangle.
    afterRule = postcss.rule({selector: rule.selector + ':after'});
  }

  var commonRules = [
    'content: \'\'',
    'position: absolute'
  ];

  var afterColor = bubble.backColor ? bubble.backColor : 'white';
  var transparentTriangle = beaker.size + ' solid transparent';
  var solidTriangle = beaker.size + ' solid ' + bubble.color;

  // First add solid colored beaker
  switch(beaker.direction.toLowerCase()) {
    case 'top':
      beforeRule.append('top: -' + beaker.size);
      commonRules.push('border-left: ' + transparentTriangle);
      commonRules.push('border-right: ' + transparentTriangle);
      beforeRule.append('border-bottom: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('top: -' + (parseInt(beaker.size.split('px')[0], 10) - 1) + 'px');
        afterRule.append('border-bottom: ' + beaker.size + ' solid ' + bubble.backColor);
      }
      break;
    case 'bottom':
      beforeRule.append('bottom: -' + beaker.size);
      commonRules.push('border-left: ' + transparentTriangle);
      commonRules.push('border-right: ' + transparentTriangle);
      beforeRule.append('border-top: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('bottom: -' + (parseInt(beaker.size.split('px')[0], 10) - 1) + 'px');
        afterRule.append('border-top: ' + beaker.size + ' solid ' + bubble.backColor);
      }
      break;
    case 'left':
      beforeRule.append('left: -' + beaker.size);
      commonRules.push('border-top: ' + transparentTriangle);
      commonRules.push('border-bottom: ' + transparentTriangle);
      beforeRule.append('border-right: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('left: -' + (parseInt(beaker.size.split('px')[0], 10) - 1) + 'px');
        afterRule.append('border-right: ' + beaker.size + ' solid ' + bubble.backColor);
      }
      break;
    case 'right':
      beforeRule.append('right: -' + beaker.size);
      commonRules.push('border-top: ' + transparentTriangle);
      commonRules.push('border-bottom: ' + transparentTriangle);
      beforeRule.append('border-left: ' + solidTriangle);
      if (afterRule) {
        afterRule.append('right: -' + (parseInt(beaker.size.split('px')[0], 10) - 1) + 'px');
        afterRule.append('border-left: ' + beaker.size + ' solid ' + bubble.backColor);
      }
      break;
    default:
      console.log('Provide correct position for bubble-beaker. Some examples are top-right, top-center, left-middle, left-top');
  }

  var beakerPos = parseInt(beaker.size.split('px')[0], 10) * 1.5 + 'px';
  switch(beaker.position.toLowerCase()) {
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

  for (var i=0; i<commonRules.length; i++) {
    beforeRule.append(commonRules[i]);
    if(afterRule) afterRule.append(commonRules[i]);
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
