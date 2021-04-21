<template>
  <div class="Home">
    <h1>Abyss</h1>
    <div class="container">
      <div class="row">
        <div class="col-sm col-lg-10">
          <div id="wave-container">
            <canvas id="wave"> </canvas>
            <div class="right" id="right"></div>
          </div>
          <button
            @click="startRecording"
          >
            <span class="icon-mic"></span> Start recording
          </button>
          <button
            @click="stopRecording"
          >
            <span class="icon-mic"></span> Stop recording
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
      const analyser = await this.recorder.begin();

      const canvas = document.getElementById('wave');
      let ctx = canvas.getContext('2d');

      canvas.width = canvas.offsetWidth;
      ctx.translate(0, canvas.offsetHeight / 2);

      let position = 0;

      const drawWave = async (data) => {
        const max = Math.max(...data.map(d => Number(d * 100/2) << 0))
        const min = Math.min(...data.map(d => Number(d * 100/2) << 0))

        if (position >= canvas.width) {
          position = 1;
          var dataURL = canvas.toDataURL();
          const container = document.getElementById('wave-container');
          const right = document.getElementById('right');
          let img = document.createElement('img');

          await new Promise(resolve => {
            img.src = dataURL;
            img.onload = () => {
              resolve(true);
            };
            img.style.width = '500px';
            img.style.minWidth = '500px';
            img.style.height = '100px';
            img.style.zIndex = 1;
            container.insertBefore(img, right);

            ctx.clearRect(0, -canvas.height, canvas.width, canvas.height * 2);

            let left = canvas.offsetLeft + 500;
            canvas.style.left = left + 'px';
            canvas.style.height = '100px';

            position = 0;
            container.scrollLeft += 500;
          });
        }

        ctx.fillRect(position, min, 2, max - min);
        position = position + 3;
      }


      this._drawWaveIn = setInterval(async() => {
        const audioData = analyser.getData();
        await drawWave(audioData);
      }, 30);

    },

    stopRecording() {
      clearInterval(this._drawWaveIn);
      this.recorder.stop();
    }
  }
}

</script>
<style scoped lang="scss">
  #wave-container {
    display: flex;
    overflow-x: scroll;
    position: relative;

    img {
      width: 500px;
      min-width: 500px;
      background-color: red;
    }

    div {
      /* width: 20%; */
      height: 100px;
    }

    canvas {
      background-color: transparent;
      height: 100px;
      width: 500px;
      z-index: 200;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      /*right: 20%;*/
    }
  }
</style>
