import BaseResponse from "./BaseResponse.js";

/**
 * @class UdemyResponse
 * @extends BaseResponse
 * @classdesc Represents a response for a Udemy video.
 */
class UdemyResponse extends BaseResponse {
  /**
   * Creates an instance of UdemyResponse.
   * @param {string} videoTitle - The title of the video.
   * @param {string} urlPath - The URL path to the video.
   * @param {string} imageUrl - The URL of the video's thumbnail image.
   * @param {string} ownerName - The name of the video's owner.
   * @param {number} price - The price of the video.
   */
  constructor(videoTitle, urlPath, imageUrl, ownerName, price) {
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

    /**
     * @type {number}
     */
    this.price = price;
  }

  toObject(udemyDtoResponse){
    this.imageUrl = udemyDtoResponse.url;
    this.price = udemyDtoResponse.price;
    this.ownerName = udemyDtoResponse.owner;
    this.imageUrl = udemyDtoResponse.image;
    this.videoTitle = udemyDtoResponse.title;
    return this;
  }
}

export default UdemyResponse;
