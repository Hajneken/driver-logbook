# Notes 

change theme by changing stylesheet in `index.html`
```HTML
<link rel="stylesheet" href="../dist/theme/beige.css" id="theme" />
```

`#` creates top level slide with heading

`##` creates second level slide in a column with heading

`===` to create a new slide in a column without a title

`---` to end current column of slides

add behind text to make it fit the slide
```HTML
<!-- .element: class="r-fit-text" -->
```

add behind element to cover the remaining vertical space in a slide
```HTML
<!-- .element: class="r-stretch" -->
```

add behind element to put content in a frame

```HTML
<!-- .element: class="r-frame" -->

```

center and place multiple elements on top of each other using `r-stack`
```HTML 
<div class="r-stack">
  <img class="fragment" src="https://placekitten.com/450/300" width="450" height="300">
  <img class="fragment" src="https://placekitten.com/300/450" width="300" height="450">
  <img class="fragment" src="https://placekitten.com/400/400" width="400" height="400">
</div>
```