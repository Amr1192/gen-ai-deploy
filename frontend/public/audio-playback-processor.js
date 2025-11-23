// /**
//  * Diagnostic Audio Playback Processor
//  * Detailed logging to identify audio cutting issues
//  */
// class AudioPlaybackProcessor extends AudioWorkletProcessor {
//   constructor() {
//     super();
//     this.buffer = [];
//     this.isPlaying = false;
//     this.frameCounter = 0;
//     this.chunkCounter = 0;
//     this.totalSamplesReceived = 0;
//     this.totalSamplesPlayed = 0;
    
//     // Very low threshold - start playing immediately
//     this.startThreshold = 480; // 20ms

//     this.port.onmessage = (event) => {
//       if (event.data.type === 'audio') {
//         const samples = new Float32Array(event.data.samples);
//         this.chunkCounter++;
//         this.totalSamplesReceived += samples.length;
        
//         console.log(`[WORKLET] Chunk #${this.chunkCounter}: Received ${samples.length} samples (${Math.round(samples.length / 24)}ms). Buffer before: ${this.buffer.length}`);
        
//         // Add to buffer
//         this.buffer.push(...samples);
        
//         console.log(`[WORKLET] Buffer after: ${this.buffer.length} samples (${Math.round(this.buffer.length / 24)}ms)`);
        
//         // Start playing if threshold met
//         if (!this.isPlaying && this.buffer.length >= this.startThreshold) {
//           this.isPlaying = true;
//           console.log(`[WORKLET] ▶️ STARTED PLAYBACK (buffer: ${this.buffer.length})`);
//         }
        
//       } else if (event.data.type === 'clear') {
//         console.log(`[WORKLET] 🧹 CLEARING BUFFER (had ${this.buffer.length} samples)`);
//         this.buffer = [];
//         this.isPlaying = false;
//         this.chunkCounter = 0;
//         this.totalSamplesReceived = 0;
//         this.totalSamplesPlayed = 0;
//       }
//     };
//   }

//   process(inputs, outputs, parameters) {
//     const output = outputs[0];
//     if (!output || output.length === 0) return true;
    
//     const channelData = output[0];
//     const frameCount = channelData.length;

//     if (this.isPlaying) {
//       let samplesThisFrame = 0;
      
//       for (let i = 0; i < frameCount; i++) {
//         if (this.buffer.length > 0) {
//           channelData[i] = this.buffer.shift();
//           samplesThisFrame++;
//           this.totalSamplesPlayed++;
//         } else {
//           // Buffer empty - output silence
//           channelData[i] = 0;
          
//           if (i === 0) {
//             console.warn(`[WORKLET] ⚠️ BUFFER UNDERRUN at frame ${this.frameCounter} (played ${this.totalSamplesPlayed}/${this.totalSamplesReceived})`);
//             this.isPlaying = false;
//           }
//         }
//       }
      
//       // Log every 50 frames
//       if (this.frameCounter % 50 === 0 && samplesThisFrame > 0) {
//         console.log(`[WORKLET] Playing... buffer: ${this.buffer.length} samples (${Math.round(this.buffer.length / 24)}ms)`);
//       }
      
//     } else {
//       // Not playing - silence
//       channelData.fill(0);
//     }

//     // Report status
//     this.frameCounter++;
//     if (this.frameCounter % 100 === 0) {
//       this.port.postMessage({
//         type: 'buffer_status',
//         length: this.buffer.length,
//         duration_ms: Math.round((this.buffer.length / 24000) * 1000),
//         isPlaying: this.isPlaying,
//         totalReceived: this.totalSamplesReceived,
//         totalPlayed: this.totalSamplesPlayed
//       });
//     }

//     return true;
//   }
// }

// registerProcessor('audio-playback-processor', AudioPlaybackProcessor);