const postcss = require('postcss');

const getBeakerDeclarationValues = (rule) => {
  let bubbleBeakerValues = [];
  let position = null;
  let bubbleBackColor = null;

  for (let node of rule.nodes) {
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
  return {
    bubbleBeakerValues,
    position,
    bubbleBackColor
  };
};

const extractBubbleAndBeakerSpecs = (bubbleValues, beakerValues) => {
  let bubble = {};
  let beaker = {};

  if (bubbleValues && bubbleValues.length !== 4) {
    throw `Bubble is not correctly specified. Please check the docs
    and provide the right values.`;
  }

  if (beakerValues && beakerValues.length !== 2) {
    throw `Bubble beaker is not specified correctly. Please check the docs and
    provide the right values.`;
  }

  [bubble.borderSize, bubble.borderRadius, bubble.type, bubble.color] = bubbleValues;

  if (beakerValues[1].indexOf('-') >= 0) {
    beaker.direction = beakerValues ? (beakerValues[1].split('-'))[0] : null;
    beaker.position = beakerValues ? (beakerValues[1].split('-'))[1] : null;
  } else {
    throw `Beaker is not provided correctly. Please check the docs and
    provide the right values.`;
  }

  let possibleDirections = ['top', 'bottom', 'left', 'right'];
  let possiblePositions = ['top', 'bottom', 'left', 'right', 'center', 'middle'];

  if (possibleDirections.indexOf(beaker.direction) < 0 ||
    possiblePositions.indexOf(beaker.position) < 0) {
    throw `Beaker is not provided correctly. Please specify bubble-beaker:
      <beaker size> <beaker position>. Beaker position should be top-left,
      top-right, bottom-center, left-middle, etc.`;
  }

  beaker.size = beakerValues ? beakerValues[0] : null;

  if (beaker.size.indexOf('px') < 0) {
    throw 'Expecting a px value for beaker size. Please do not provide other units';
  }

  return {
    bubble,
    beaker
  };
};

const addBubble = (bubble, beaker, position, rule) => {
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

const addBeaker = (bubble, beaker, rule) => {
  // Add the beaker now
  let beforeRule = postcss.rule({selector: rule.selector + ':before'});
  let afterRule = null;

  if (bubble.type === 'hollow') {
    // We need to add another beaker the same background color as the bubble
    // to create a caret look instead of triangle.
    afterRule = postcss.rule({selector: rule.selector + ':after'});
  }

  var commonRules = [
    'content: \'\'',
    'position: absolute'
  ];

  const afterColor = bubble.backColor ? bubble.backColor : 'white';
  const transparentTriangle = beaker.size + ' solid transparent';
  const solidTriangle = beaker.size + ' solid ' + bubble.color;
  let border = parseInt(bubble.borderSize.split('px')[0], 10) || 1;
  border = border > 1 ? border + 1 : 1;


  // First add solid colored beaker
  switch(beaker.direction.toLowerCase()) {
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
      throw `Provide correct position for bubble-beaker. Some examples
        are top-right, top-center, left-middle, left-top`;
  }

  const beakerPos = parseInt(beaker.size.split('px')[0], 10) * 1.5 + 'px';
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

  for (let rule of commonRules) {
    beforeRule.append(rule);
    if(afterRule) afterRule.append(rule);
  }

  rule.parent.nodes.push(beforeRule);
  if (afterRule) rule.parent.nodes.push(afterRule);
};

module.exports = postcss.plugin('postcss-bubble', function (opts) {
    opts = opts || {};

    return function (css) {
      css.walkDecls(function (decl, i) {
        let rule = decl.parent;
        let value = decl.prop;

        if (decl.prop === 'bubble') {
          // Get bubble beaker if specified
          let bubble = {};
          let beaker = {};

          const obj = getBeakerDeclarationValues(rule);
          const bubbleBeakerValues = obj.bubbleBeakerValues;
          const position = obj.position;
          const bubbleBackColor = obj.bubbleBackColor;

          // Consolidate all the values to construct
          const bubbleValues = decl.value.split(' ');

          const specs = extractBubbleAndBeakerSpecs(bubbleValues, bubbleBeakerValues);
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
