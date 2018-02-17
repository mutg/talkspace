<template>
  <div class="source">
    <div class="source-title">
      {{id}}
    </div>
    <canvas ref="canvas" class="source-meter" />
    <div class="source-controls">
      <label>Panning</label>
      <br>
      <input v-model="stereoPanner.pan.value" type="range" min="-1" max="1" step="0.01" value="0" />
      <label>Volume</label>
      <br>
      <input v-model="gain.gain.value" type="range" orient="vertical" min="0" max="1" value="1" step="0.01" />
    </div>
  </div>
</template>

<script>
import VolumeMeter from '@/components/Root/VolumeMeter'

export default {
  props: ['stream', 'id', 'context'],
  data () {
    return {
      audio: null,
      source: null,
      gain: null,
      stereoPanner: null,
      canvasCtx: null,
      meter: null
    }
  },
  created () {
    // so i guess i need to assign the stream to an audio element for it to actually get transferred to the other peer(?)
    this.audio = new Audio()
    this.audio.srcObject = this.stream
    this.audio.play()
    this.audio.volume = 0.0

    // create the elements
    this.source = this.context.createMediaStreamSource(this.stream)
    this.gain = this.context.createGain()
    this.stereoPanner = this.context.createStereoPanner()

    // connect
    this.source.connect(this.gain)
    this.gain.connect(this.stereoPanner)
    this.stereoPanner.connect(this.context.destination)
  },
  mounted () {
    this.canvasCtx = this.$refs.canvas.getContext('2d')
    this.meter = VolumeMeter(this.context)
    this.source.connect(this.meter)
    this.drawLoop()
  },
  methods: {
    drawLoop () {
      let WIDTH = 150
      let HEIGHT = 150
      // clear the background
      this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

      // check if we're currently clipping
      if (this.meter.checkClipping()) {
        this.canvasCtx.fillStyle = 'red'
      } else {
        this.canvasCtx.fillStyle = 'green'
      }

      // draw a bar based on the current volume
      this.canvasCtx.fillRect(0, HEIGHT, WIDTH,  this.meter.volume * HEIGHT *-1)

      // set up the next visual callback
      window.requestAnimationFrame(this.drawLoop)
    }
  }
}
</script>

<style>
.source {
  display: inline-block;
  width: 150px;
  height: 100%;
  border: 3px solid saddlebrown;
}
canvas {
  height: 150px;
  width: 150px;
}
input[type=range][orient=vertical]
{
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */
    width: 8px;
    height: 175px;
    padding: 0 5px;
}
</style>
