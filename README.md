# postcss-speech-bubble
postcss-speech-bubble creates speech bubbles in just a couple of lines of CSS.

## Installation
npm install postcss-speech-bubble

## Usage
postcss-speech-bubble offers three rules that can be used to build different kinds of speech bubbles.

bubble: <borderSize> <borderRadius> <type> <color>;
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

bubble-beaker: <beakerSize> <positionOfBeaker>;
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

## [Changelog] (./CHANGELOG.md "Changelog")
## [License](./LICENSE "License")
