import { describe, expect, it } from "vitest";

import { mediaKindForLabel, mediaUrl, prettyLabel, youtubeEmbedUrl } from "@/lib/media";

describe("mediaKindForLabel", () => {
  it("detects image/youtube/audio columns regardless of prefix", () => {
    expect(mediaKindForLabel("obra_image")).toBe("image");
    expect(mediaKindForLabel("image")).toBe("image");
    expect(mediaKindForLabel("compositor_youtube")).toBe("youtube");
    expect(mediaKindForLabel("track_audio")).toBe("audio");
  });

  it("treats everything else as plain text", () => {
    expect(mediaKindForLabel("english")).toBe("text");
    expect(mediaKindForLabel("obra")).toBe("text");
  });
});

describe("prettyLabel", () => {
  it("strips the media suffix but leaves text labels untouched", () => {
    expect(prettyLabel("obra_image")).toBe("obra");
    expect(prettyLabel("english")).toBe("english");
  });

  it("falls back to the original label if stripping would leave nothing", () => {
    expect(prettyLabel("image")).toBe("image");
  });
});

describe("mediaUrl", () => {
  it("passes external URLs through unchanged", () => {
    expect(mediaUrl("https://example.com/dog.jpg")).toBe("https://example.com/dog.jpg");
  });

  it("resolves a bare filename against the base-relative media folder", () => {
    expect(mediaUrl("dog.jpg")).toBe("/media/dog.jpg");
  });
});

describe("youtubeEmbedUrl", () => {
  it("extracts the video id from a watch URL", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("extracts the video id from a youtu.be short link", () => {
    expect(youtubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("accepts a bare video id", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
});
