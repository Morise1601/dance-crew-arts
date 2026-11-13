export type VideoPlaybackResult = "playing" | "muted" | "blocked" | "cancelled";

type VideoPlaybackTarget = Pick<HTMLVideoElement, "play" | "pause" | "muted">;

/** Call directly from the opening click so audible playback keeps user activation. */
export async function playVideoWithFallback(video: VideoPlaybackTarget, signal?: AbortSignal): Promise<VideoPlaybackResult> {
  if (signal?.aborted) return "cancelled";

  try {
    await video.play();
  } catch {
    if (signal?.aborted) return "cancelled";
    video.muted = true;
    try {
      await video.play();
    } catch {
      return signal?.aborted ? "cancelled" : "blocked";
    }
  }

  if (signal?.aborted) {
    video.pause();
    return "cancelled";
  }

  return video.muted ? "muted" : "playing";
}
