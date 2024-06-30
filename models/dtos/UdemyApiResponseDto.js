/**
 * @class UdemyApiResponseDto
 * @classdesc Represents a Data Transfer Object (DTO) for Udemy API responses.
 */
class UdemyApiResponseDto {
    /**
     * Creates an instance of UdemyApiResponseDto.
     */
    constructor() {
      /**
       * @type {string}
       */
      this.title;
  
      /**
       * @type {string}
       */
      this.url;
  
      /**
       * @type {string}
       */
      this.owner;
  
      /**
       * @type {string}
       */
      this.image;

         /**
       * @type {number}
       */
       this.price;
    }
  
    toDto(item) {
        this.title=item?.title || '';
        this.url=item?.url || '';
        this.price=item?.price || '';
        this.owner=item?.visible_instructors?.title || '';
        this.image=item['image_480x270'] || item['image_240x135'] || ''
        return this;
      }
  }
  
  export default UdemyApiResponseDto;
  