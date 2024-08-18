"use strict";

import BaseResponse from "./BaseResponse.js";

/**
 * @class YoutubeResponse
 * @extends BaseResponse
 * @classdesc Represents a response for a YouTube video.
 */
class YoutubeResponse extends BaseResponse {
  /**
   * Creates an instance of YoutubeResponse.
   * @param {string} videoTitle - The title of the video.
   * @param {string} urlPath - The URL path to the video.
   * @param {string} imageUrl - The URL of the video's thumbnail image.
   * @param {string} ownerName - The name of the video's owner.
   * @param {number} likeCount - The number of likes on the video.
   * @param {number} commentCount - The number of comments on the video.
   * @param {string} description - The description of the video.
   * @param {Object} rating - The content rating of the video.
   */
  constructor(videoTitle, urlPath, imageUrl, ownerName, likeCount, commentCount, description, rating) {
    super();
    this.videoTitle = videoTitle;
    this.urlPath = urlPath;
    this.imageUrl = imageUrl;
    this.ownerName = ownerName;
    this.likeCount = likeCount;
    this.commentCount = commentCount;
    this.description = description;
    this.rating = rating;
  }

  toObject(youtubeDto) {
    this.videoTitle = youtubeDto.title;
    this.urlPath = youtubeDto.url;
    this.imageUrl = youtubeDto.image;
    this.ownerName = youtubeDto.owner;
    this.likeCount = youtubeDto.likeCount;
    this.commentCount = youtubeDto.commentCount;
    this.description = youtubeDto.description;
    this.rating = youtubeDto.rating;
    return this;
  }
}

export default YoutubeResponse;
