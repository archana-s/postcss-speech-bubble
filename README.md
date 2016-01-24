# postcss-speech-bubble
postcss-speech-bubble creates speech bubbles in just a couple of lines of CSS.

## Installation
npm install postcss-speech-bubble

## Usage
postcss-speech-bubble offers three rules that can be used to build different kinds of speech bubbles.

bubble: borderSize borderRadius type color;
* borderSize: border size in px
* borderRadius: border radius on the speech bubble
* type:
    solid or hollow
    Solid creates a speech bubble that uses the color provided here
    as background color.
    Hollow uses the color provided in this rule as the border color.
* color:
    Background color of the bubble and the beaker if it is solid
    border color on bubble and beaker if it is hollow

bubble-beaker: beakerSize positionOfBeaker;
* beakerSize: size of the speech beaker. Please provide this in px.
* positionOfBeaker: Where the beaker should be for the speech bubble. Below are possiblePosition's options:
  * top-right
  * top-left
  * top-center
  * bottom-right
  * bottom-left
  * bottom-center
  * left-top
  * left-bottom
  * left-middle
  * right-top
  * right-bottom
  * right-middle

bubble-background: color;
This is necessary if you need to provide a bubble with a border and a background color.
You can define these bubbles by making them hollow and providing the border color and providing a background color through this property.

## Examples

* Solid bubble (No border)

[!solid bubble](https://lh3.googleusercontent.com/-AeIItjhWS2c/VqRriS6DYoI/AAAAAAAAOzw/JSMxzDnBag4/s338-Ic42/Screen%252520Shot%2525202016-01-23%252520at%25252010.07.57%252520PM.png)

    .bubble {
      bubble-beaker: 12px top-right;
      bubble: 0 0 solid lightGrey;
      width: 140px;
      height: 80px;
    }

* Hollow bubble

[!hollow bubble](https://lh3.googleusercontent.com/-kvMLnldOwk4/VqRrhyoT5xI/AAAAAAAAOzs/nElrVn57kZE/s386-Ic42/Screen%252520Shot%2525202016-01-23%252520at%25252010.09.20%252520PM.png)

    .bubble {
      bubble: 1px 10px hollow black;
      bubble-beaker: 10px left-middle;
      width: 150px;
      height: 100px;
    }

* Hollow bubble with a background

[!hollow bubble with background](https://lh3.googleusercontent.com/-_WS8rmal0Vs/VqRrhbE9lJI/AAAAAAAAOzk/Z2eg19MSDzA/s282-Ic42/Screen%252520Shot%2525202016-01-23%252520at%25252010.12.48%252520PM.png)

    .bubble {
      bubble-beaker: 12px right-middle;
      bubble: 3px 0 hollow black;
      bubble-background: #E44146;
      width: 100px;
      height: 120px;
    }

## [Changelog] (./CHANGELOG.md "Changelog")
## [License](./LICENSE "License")
