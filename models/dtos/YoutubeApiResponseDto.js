"use strict";

class YoutubeApiResponseDto {
  constructor() {
    this.title = '';
    this.url = '';
    this.owner = '';
    this.image = '';
    this.likeCount = 0;
    this.commentCount = 0;
    this.description = '';
    this.rating = null; // Assuming rating is an object; adapt as necessary
  }

  toDto(item) {
    this.title = item?.snippet?.title || '';
    this.url = `https://www.youtube.com/watch?v=${item?.id}` || ''; // Updated to be a full URL
    this.owner = item?.snippet?.channelTitle || '';
    this.image = item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.medium?.url || '';
    this.likeCount = item?.statistics?.likeCount || 0;
    this.commentCount = item?.statistics?.commentCount || 0;
    this.description = item?.snippet?.description || '';
    this.rating = item?.contentDetails?.contentRating || {}; // Assuming rating is an object, modify if needed

    return this;
  }
}

export default YoutubeApiResponseDto;
