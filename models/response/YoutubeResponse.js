"use strict";

import youtube from "../../apiClients/youtube.js";
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
   */
  constructor(videoTitle, urlPath, imageUrl, ownerName) {
    super();
    /**
     * @type {string}
     */
    this.videoTitle = videoTitle;

    /**
     * @type {string}
     */
    this.urlPath = urlPath;

    /**
     * @type {string}
     */
    this.imageUrl = imageUrl;

    /**
     * @type {string}
     */
    this.ownerName = ownerName;
  }

  toObject(youtubeDto) {
    this.videoTitle = youtubeDto.title;
    this.urlPath = youtubeDto.url;
    this.imageUrl = youtubeDto.image;
    this.ownerName = youtubeDto.owner;
    return this;
  }
}

export default YoutubeResponse;
