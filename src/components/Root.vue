/* eslint-disable */
<template>
  <v-container fill-height fluid class="mixer">
    <v-layout row>
      <v-flex xs2 v-for="(stream, key) in audioStreams" v-bind:key="key">
        <mixer-track :context="audioCtx" :stream="stream" :id="key" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MixerTrack from '@/components/Root/MixerTrack'
import RTCMultiStream from '@/components/Root/RTCMultiStream'
/* import StreamVisualizer from '@/components/StreamVisualizer' */

export default {
  created () {

  },
  mounted () {
    this.audioCtx = new AudioContext()
    // this.client = new RTCMultiStream()
    // this.client.on('incoming-stream', this.addAudioStream)
    // this.client.on('remove-stream', this.removeAudioStream)
  },
  components: { MixerTrack },
  data () {
    return {
      lastId: 0,
      audioCtx: null,
      client: null,
      audioStreams: {
        'test': null
      }
    }
  },
  methods: {
    addAudioStream (data) {
      this.$set(this.audioStreams, data.id, data.stream)
    },
    removeAudioStream (id) {
      this.$set(this.audioStreams, id, null)
      delete this.audioStreams[id]
    }
  }
}
</script>

<style scoped>
.input {
  display: block;
}
.mixer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
}

</style>
