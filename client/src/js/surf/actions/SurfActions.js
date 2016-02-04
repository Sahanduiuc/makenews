/* eslint no-unused-vars:0, callback-return:0, max-nested-callbacks:0 */
"use strict";

import FeedApplicationQueries from "../../feeds/db/FeedApplicationQueries.js";
import PouchClient from "../../db/PouchClient.js";
import RefreshFeedsHandler from "../../surf/RefreshFeedsHandler.js";
import FilterFeedsHandler from "../FilterFeedsHandler.js";
import { parkFeedCounter } from "../../feeds/actions/FeedsActions.js";
export const DISPLAY_ALL_FEEDS = "DISPLAY_ALL_FEEDS";
export const DISPLAY_EXISTING_FEEDS = "DISPLAY_EXISTING_FEEDS";
export const PARK_FEED = "PARK_FEED";
export const STORE_FILTER_SOURCE_MAP = "STORE_FILTER_SOURCE_MAP";
export const FETCH_ALL_CATEGORIES = "FETCH_ALL_CATEGORIES";
export const FETCH_FEEDS_BY_PAGE = "FETCH_FEEDS_BY_PAGE";
export const PAGINATION_FEEDS = "PAGINATION_FEEDS";

let isRefreshing = false, totalPercentage = 100;

export function displayAllFeeds(feeds, refreshState = false, progressPercentage = 0, lastIndex = 0, hasMoreFeeds = true) {
    return { "type": DISPLAY_ALL_FEEDS, feeds, refreshState, progressPercentage, lastIndex, hasMoreFeeds };
}

export function removeParkItem(feed) {
    return { "type": PARK_FEED, feed };
}

export function displayExistingFeeds(feeds, refreshState, progressPercentage = 0) {
    return { "type": DISPLAY_EXISTING_FEEDS, feeds, refreshState, progressPercentage };
}
export function storeFilterSourceMap(surfFilter, sourceHashMap, sourceIds) {
    return { "type": STORE_FILTER_SOURCE_MAP, surfFilter, sourceHashMap, sourceIds };
}
export function fetchAllCatgories(categories) {
    return { "type": FETCH_ALL_CATEGORIES, categories };
}
export function paginationFeeds(feeds, refreshState = false, progressPercentage = 0, lastIndex = 0, hasMoreFeeds = true) {
    return { "type": PAGINATION_FEEDS, feeds, refreshState, progressPercentage, lastIndex, hasMoreFeeds };
}

export function parkFeed(feedDoc) {
    if(feedDoc && Object.keys(feedDoc).length !== 0) {
        return dispatch => {
            FeedApplicationQueries.updateFeed(feedDoc, "park").then(() => {
                dispatch(removeParkItem(feedDoc));
                dispatch(parkFeedCounter());
            });
        };
    }
}

export function displayAllFeedsAsync(callback, progressPercentage) {
    return dispatch => {
        FeedApplicationQueries.fetchAllFeedsWithCategoryName().then((feeds) => {
            if(progressPercentage === totalPercentage) {
                isRefreshing = false;
            }
            dispatch(displayAllFeeds(feeds, isRefreshing, progressPercentage));
            if(callback) {
                return callback(feeds);
            }
        }).catch(error => { //eslint-disable-line no-unused-vars
            if(progressPercentage === totalPercentage) {
                isRefreshing = false;
            }
            dispatch(displayAllFeeds([]));
            if(callback) {
                return callback([]);
            }
        });
    };
}

export function fetchAllCategories(callback) {
    return dispatch => {
        PouchClient.fetchDocuments("category/allCategories", { "include_docs": true }).then((categories) => {
            callback(categories);
            dispatch(fetchAllCatgories(categories));
        }).catch(error => { //eslint-disable-line no-unused-vars
            callback([]);
            dispatch(fetchAllCatgories([]));
        });
    };
}

export function updateLatestFeeds(completionPercentage) {
    return dispatch => {
        if (completionPercentage === totalPercentage) {
            isRefreshing = false;
            dispatch(displayAllFeeds([]));
            dispatch(fetchFeedsByPage(0));
        } else {
            dispatch(displayExistingFeeds([], isRefreshing, completionPercentage));
        }
    };
}

export function getLatestFeedsFromAllSources(callback = ()=> {}) {
    return dispatch => {
        isRefreshing = true;
        new RefreshFeedsHandler(dispatch, updateLatestFeeds, callback).handleBatchRequests();
    };
}
export function storeFilterAndSourceHashMap(callback) {
    return dispatch => {
        let currentStore = dispatch(storeFilterSourceMap());
        if(!currentStore.surfFilter || !currentStore.sourceHashMap) {
            let filterFeedsHandler = new FilterFeedsHandler();
            filterFeedsHandler.getFilterAndSourceHashMap().then((result)=> {
                callback(result);
                dispatch(storeFilterSourceMap(result.surfFilter, result.sourceHashMap, result.sourceIds));
            });
        } else {
            callback(currentStore);
            dispatch(storeFilterSourceMap(currentStore.surfFilter, currentStore.sourceHashMap, currentStore.sourceIds));
        }
    };
}

export function fetchFeedsByPage(lastIndex, callback = ()=> {}) {
    return dispatch => {
        let filterFeedsHandler = new FilterFeedsHandler();
        if(lastIndex === 0) {
            dispatch(displayAllFeeds([]));
            filterFeedsHandler.getFilterAndSourceHashMap().then(latestSourceMapAndFilter => {
                let filterObj = dispatch(storeFilterSourceMap(latestSourceMapAndFilter.surfFilter, latestSourceMapAndFilter.sourceHashMap, latestSourceMapAndFilter.sourceIds));
                fetchFeeds(lastIndex, filterObj, callback, dispatch);
            });
        } else {
            fetchFeeds(lastIndex, dispatch(storeFilterSourceMap()), callback, dispatch);
        }
    };
}

function fetchFeeds(lastIndex, filterObj, callback, dispatch) {
    if(filterObj.surfFilter) {
        let filterFeedsHandler = new FilterFeedsHandler();
        filterFeedsHandler.fetchFeedsByPageWithFilter(filterObj, lastIndex).then((result)=> {
            dispatch(paginationFeeds(result.feeds, false, 0, result.lastIndex, result.hasMoreFeeds));
            callback(result);
        }).catch(()=> {
            callback({ "lastIndex": lastIndex });
        });
    } else {
        callback({ "lastIndex": lastIndex });
    }
}

export function fetchFeedsByFilter(latestFilterDocument, callback = ()=> {}) {
    return dispatch => {
        let filterFeedsHandler = new FilterFeedsHandler();
        filterFeedsHandler.updateFilterDocument(latestFilterDocument).then(()=> {
            filterFeedsHandler.getFilterAndSourceHashMap().then((filterObj) => {
                dispatch(storeFilterSourceMap(filterObj.surfFilter, filterObj.sourceHashMap, filterObj.sourceIds));

                filterFeedsHandler.fetchFeedsByPageWithFilter(filterObj, 0).then((result)=> {
                    dispatch(displayAllFeeds(result.feeds, false, 0, result.lastIndex, result.hasMoreFeeds));
                    callback(result);
                });
            });
        });
    };
}
