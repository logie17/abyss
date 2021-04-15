<template>
  <div class="Home">
    <h1>Abyss</h1>
    <div class="container">
      <div class="row">
        <div class="col-sm col-lg-10">
          <canvas id="wave"> </canvas>
          <button
            @click="startRecording"
          >
            <span class="icon-mic"></span> Start recording
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-sm col-lg-10">
          <canvas id="recording"></canvas>
          <button onclick="playRecording()"><span class="icon-play"></span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { Recorder } from '@/lib/recorder';

export default {
  name: 'Home',

  mounted() {
    this.recorder = new Recorder();

    this.recorder.onrecordingAvailable(data => {
      console.log("Data", data);
    });
  },
  methods: {
    async startRecording() {
      const pcmProcessor = await this.recorder.begin();
      let points = [];

      const samples = 256;
      const canvas = document.getElementById('wave');
      let ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      const padding = 10;
      canvas.width = canvas.offsetWidth * dpr;

      canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
      //ctx.scale(dpr, dpr);
      ctx.translate(0, canvas.offsetHeight / 2 + padding);

      const drawWave = () => {
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, -height, width, height * 2);
        ctx.fillStyle = '#FF0000';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x < samples; x++) {
          //    console.log("points", points[x]);
          ctx.lineTo(x * 10, points[x]);
          ctx.stroke()
          //ctx.fillRect(x * 10, 100 + points[x], 5, 5);
          ctx.moveTo(x * 10, points[x]);
        }
      }

      drawWave();
      setInterval(() => {
        drawWave();
      }, 20);
      pcmProcessor.onDataAvailible(audioData => {
        if (points.length === samples) {
          points.shift();
        }

        points.push(audioData * 100);
      });
    },

    stopRecording() {
      this.recorder.stop();
    }
  }
}

</script>
<style scoped lang="scss">
  canvas {
    height: 100px;
    width: 100%;
    border: 1px solid red;
  }
</style>
