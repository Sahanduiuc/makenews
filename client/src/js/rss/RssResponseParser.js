"use strict";
import StringUtil from "../../../../common/src/util/StringUtil.js";
import DateTimeUtil from "../utils/DateTimeUtil.js";

const NEGATIVE_INDEX = -1;
export default class RssResponseParser {
    static parseFeeds(sourceId, feeds) {
        if(StringUtil.isEmptyString(sourceId) || (typeof feeds === "undefined" || feeds.length === 0)) {
            throw new Error("source id or feeds can not be empty");
        }

        let resultFeeds = [];
        feeds.forEach((feed)=> {
            resultFeeds.push(RssResponseParser.parseFeed(sourceId, feed));
        });
        return resultFeeds;
    }

    static parseFeed(sourceId, feed) {
        let feedObj = {
            "_id": feed.guid,
            "docType": "feed",
            "sourceId": sourceId,
            "type": "description",
            "title": feed.title,
            "link": feed.link,
            "feedType": "rss",
            "content": feed.description,
            "postedDate": feed.pubDate ? DateTimeUtil.getUTCDateAndTime(feed.pubDate) : null,
            "tags": [""]
        };
        if(feed.enclosures && feed.enclosures.length > 0) {
            if(feed.enclosures.length === 1) {
                feedObj.type = "imagecontent";
                if(feed.enclosures[0].type.indexOf("image") !== NEGATIVE_INDEX) {
                    feedObj.url = feed.enclosures[0].url;
                } else if(feed.enclosures[0].type.indexOf("video") !== NEGATIVE_INDEX) {
                    feedObj.url = feed.image.url;
                }
            } else {
                feedObj.type = "gallery";
                feedObj.images = [];
                feed.enclosures.forEach((item, index) => {
                    if(item.type.indexOf("image") !== NEGATIVE_INDEX) {
                        feedObj.images.push(feed.enclosures[index]);
                    } else if(item.type.indexOf("video") !== NEGATIVE_INDEX) {
                        feedObj.images.push({ "type": "video", "url": feed.image.url });
                    }
                });
            }
        }
        return feedObj;
    }
}
