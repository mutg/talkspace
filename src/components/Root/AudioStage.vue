/* eslint-disable */

<template>
  <div class="container">
    <div class="source-element" v-for="(source, index) in audioSources" :key="index">
    </div>
  </div>
</template>

<script>
import interact from 'interactjs'

export default {
  props: ['audioSources'],
  data () {
    return {
    }
  },
  methods: {

  },
  mounted () {
    interact('.source-element')
.draggable({
    // enable inertial throwing
    inertia: false,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: dragMoveListener,
    // call this function on every dragend event
    onend: function (event) {
      var textEl = event.target.querySelector('p');

      textEl && (textEl.textContent =
        'moved a distance of '
        + (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
                     Math.pow(event.pageY - event.y0, 2) | 0))
            .toFixed(2) + 'px');
    }
  });

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

    // this is used later in the resizing and gesture demos
    //window.dragMoveListener = dragMoveListener;
  },
  watch: {

  }
}
</script>

<style>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.source-element {
  border: 2px solid green;
  width: 20px;
  height: 20px;
  position: absolute;
}
</style>
