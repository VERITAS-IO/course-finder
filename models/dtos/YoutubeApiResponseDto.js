"use strict";

class YoutubeApiResponseDto {
  constructor() {
    this.title;
    this.url;
    this.owner;
    this.image;
  }
  toDto(item) {
    this.title = item?.snippet?.title || '';
    this.url = item?.id || '';
    this.owner = item?.snippet?.channelTitle || '';
    this.image = item?.thumbnails?.high?.url['480x360'] || item?.thumbnails?.medium?.url['320x180'] || '';
    return this;
  }
}

export default YoutubeApiResponseDto;