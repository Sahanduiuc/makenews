"use strict";
import moment from "moment";

export default class DateTimeUtil {

    static getCreatedTime() {
        return moment().utc().valueOf();
    }
    static getLocalTimeFromUTC(dateString) {
        return moment.utc(dateString).local().format("llll");
    }
    static getUTCDateAndTime(dateString) {
        return moment(dateString).utc().format();
    }
    static getTimestamp(dateString) {
        return new Date(DateTimeUtil.getUTCDateAndTime(dateString)).getTime();
    }
    static getSortedUTCDates(dates) {
        return dates.sort((prev, next) => {
            return DateTimeUtil.getTimestamp(next) - DateTimeUtil.getTimestamp(prev);
        }).map(sortedDate => {
            return DateTimeUtil.getUTCDateAndTime(sortedDate);
        });
    }
}
