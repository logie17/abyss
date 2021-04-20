import { Track } from './track';
import { AudioAnalyser } from './audioanalyser';
export class Recorder {
  constructor() {

  }

  async _handleDataAvailable(e) {
    if (e.data.size > 0) {
      this._recordedChunks.push(e.data);
    } else {
      throw new Error(`_handleDataAvailable: No data received`);
    }
  }

  _filterData(audioBuffer) {
    const rawData = audioBuffer.getChannelData(0);
    const samples = 256;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }
    return filteredData;
  }

  _normalizeData(filteredData)  {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
  }

  async _handleOnStop() {
    var audio = new Blob(this._recordedChunks, {
      type: 'audio/ogg; codecs=opus'
    });

    const audioBuf = await audio.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(audioBuf);

    const data = this._filterData(audioBuffer);
    this._normalizedData = this._normalizeData(data);

    this._onrecordingAvailible(this._normalizeData);
  }

  async _recordFromMic() {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch(err) {
      this._err = err;
      throw new Error(`_recordFromMic: Unable to get access to media device: ${err}`);
    }

    // this._mediaRecorder = new MediaRecorder(stream);

    // this._mediaRecorder.ondataavailable = this._handleDataAvailable;
    // this._mediaRecorder.onstop = this._handleOnStop;
    // this._mediaRecorder.start();

    return stream;
  }

  async begin() {
    const track = new Track();
    console.log("BEGINNING", track);

    const stream = await this._recordFromMic();

    this._analyser = new AudioAnalyser(stream);
    await this._analyser.init();
    return this._analyser;
  }

  async stop() {
    if (this._mediaRecorder) {
      this._mediaRecorder.stop();
    }
    if (this._analyser) {
      this._analyser.stop();
    }
  }

  onrecordingAvailable(cb) {
    this._onrecordingAvailible = cb;
  }

}
