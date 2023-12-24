export const closeStream = (stream: MediaStream) => {
  const tracks = stream.getTracks();
  tracks.forEach(track=>{
    track.stop()
  })
};
