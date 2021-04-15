export class PcmProcessor {
  constructor(stream) {
    this._stream = stream;
  }

  async init() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(this._stream);

    try {
      await audioCtx.audioWorklet.addModule('/pcm-processor.js');
    } catch(e) {
      throw new Error(`init: Unable to load pcm-processor worklet:${e}`);
    }

    const pcmProcessor = new AudioWorkletNode(audioCtx, 'pcm-processor');

    source.connect(pcmProcessor);

    pcmProcessor.port.onmessage = (e) => {
      if (e.data.eventType === 'data') {
        const audioData = e.data.audioBuffer;
        if (this._ondataAvailible) {
          this._ondataAvailible(audioData);
        }
      }

      if (e.data.eventType === 'stop') {
        // recording has stopped
      }
    };

    pcmProcessor.connect(audioCtx.destination);

    this._pcmProcessor = pcmProcessor;

  }

  start() {
    if (this._pcmProcessor) {
      this._pcmProcessor.parameters.get('isRecording').setValueAtTime(1, 0);
    }
  }

  onDataAvailible(cb) {
    this._ondataAvailible = cb;
  }
}
