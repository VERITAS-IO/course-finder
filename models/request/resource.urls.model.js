import { createUrl } from "../../utils.js";

class ResoureUrls {
  constructor(resourceUrlModel) {
    this.youtubeUrl = resourceUrlModel.isYoutubeActive ? createUrl() : null;
    this.udemyUrl = resourceUrlModel.isUdemyActive ? createUrl() : null;
    this.courseraUrl = resourceUrlModel.isCourseraActive ? createUrl() : null;
    this.mediumUrl = resourceUrlModel.isMediumActive ? createUrl() : null;
  }
}
