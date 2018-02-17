<template>
  <div class="mixer-track">
    <v-layout column align-center>
      <v-flex xs2 class="mixer-track-title">
        <span class="title">Title</span>
      </v-flex>
      <v-flex xs6 class="mixer-track-vu">
        vu
      </v-flex>
      <v-flex xs12 class="mixer-track-controls">
        <v-layout column align-center>
          <v-flex class="mixer-track-controls-panner">
            <div>Pan</div>
            <vue-slider 
              :dotSize="22"
              :tooltip="'hover'"
              :width="'auto'"
              :max="1"
              :min="-1"
              :interval="0.01"
            >
              <template slot="tooltip" slot-scope="tooltip">
                <span v-if="tooltip.value !== 0">{{ (tooltip.value > 0 ? 'R' : 'L') + Math.abs(Math.round(tooltip.value * 100)) }}</span>
                <span v-else>0</span>
              </template>
            </vue-slider>
          </v-flex>
          <v-flex class="mixer-track-controls-gain">
            <div>Gain</div>
            <vue-slider :direction="'vertical'"
              :height="300"
              :dotSize="22"
              :tooltip="'hover'"
              :width="5"
            />
          </v-flex>
          <v-flex class="mixer-track-controls-buttons">
            <v-btn>SOLO</v-btn><br>
            <v-btn>MUTE</v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import vueSlider from 'vue-slider-component'
export default {
  props: ['stream', 'id', 'context'],
  mounted () {
  },
  components: { vueSlider }
}
</script>

<style>

.mixer-track {
  position: relative;
  height: 100%;
  width: 250px;
  margin-left: 10px;
  margin-right: 10px;
  background-color: #4d4d4d;
}
.mixer-track-title, .mixer-track-controls, .mixer-track-vu {
  border: 1px solid black;
}

.mixer-track-controls-panner {
  width: 100%;
}
</style>
