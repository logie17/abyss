export class AudioAnalyser {
  constructor(stream) {
    this._stream = stream;
  }

  async init() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = this.audioCtx.createAnalyser();

    const microphone = this.audioCtx.createMediaStreamSource(this._stream);

    microphone.connect(analyser);

    this.analyser = analyser;

  }

  getData() {
    const { analyser } = this;
    if ( analyser ) {
      analyser.fftSize = 2048;
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      let data = [];
      for(var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        data.push(v);
      }

      return data;
    }
  }

  stop() {
    const tracks = this._stream.getTracks();
    if (tracks) {
      tracks.forEach(t => t.stop());
    }
  }

}
