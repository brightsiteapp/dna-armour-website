# DNA Armour Homepage Design Guidelines

## Direction

Clean product-led design with Apple-like system typography, concise copy and a real WebGL bottle. The hero uses the blue sampled from the supplied DNA Label.pdf.

## Colour

- Ink: `#092d38` for headings and high-contrast text
- Cyan: `#3fc5e9`, sampled from the rendered DNA Label.pdf
- Mist: `#f5f7f8` for spacious content areas
- White: `#ffffff` for light and separation

## Typography

- All typography: native Apple system font on Apple devices, Helvetica/Arial fallbacks elsewhere
- Headlines use close tracking, large scale and short lines
- Supporting copy remains concise with generous line height

## Layout

- Desktop hero splits the bottle and editorial copy asymmetrically
- Mobile hero stacks a sticky bottle above the changing text, directly on the cyan background
- Content sections use generous vertical space and clear visual pauses
- Nutrition data is always presented as real HTML, not only as text inside an image

## Motion

- One revolved 3D bottle rotates around its vertical axis, with the PDF artwork wrapped around its cylindrical label
- Three scroll stops show the front, brand message and nutritional information
- The bottle descends 26 pixels per desktop stage and 9 pixels per phone stage
- Geometry includes rounded shoulders, base, neck, cap and 144 individual cap ribs
- Model proportions are estimated from the supplied bottle images; physical measurements were not supplied
- Three.js is served locally; there is no runtime CDN dependency
- The still fallback and lower-page image are rendered from the same 3D bottle
- Entrance animations use opacity and transforms only
- Reduced-motion preferences disable meaningful animation

## Accessibility

- Semantic headings, navigation, table roles and link states
- Dark ink on the cyan background
- Explicit keyboard focus styles and keyboard-operable view buttons
- Inactive story panels are inert and hidden from assistive technology
- The complete label remains available as a PDF link
