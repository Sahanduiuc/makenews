import {
    gotWebSourceResults,
    WEB_GOT_SOURCE_RESULTS,
    fetchWebSources
} from "./../../src/js/config/actions/WebConfigureActions";
import { assert } from "chai";
import sinon from "sinon";
import AjaxClient from "./../../src/js/utils/AjaxClient";
import mockStore from "../helper/ActionHelper";
import {
    HAS_MORE_SOURCE_RESULTS,
    NO_MORE_SOURCE_RESULTS,
    FETCHING_SOURCE_RESULTS,
    FETCHING_SOURCE_RESULTS_FAILED
} from "./../../src/js/sourceConfig/actions/SourceConfigurationActions";

describe("WebConfigureActions", () => {

    describe("gotWebSourceResults", () => {
        it("should return source and type object", () => {
            let sources = {
                "docs": [{
                    "name": "The Hindu - International",
                    "url": "http://www.thehindu.com/news/international/?service=rss"
                }, {
                    "name": "The Hindu - Sport",
                    "url": "http://www.thehindu.com/sport/?service=rss"
                }],
                "paging": {
                    "offset": "25"
                }
            };
            let result = gotWebSourceResults(sources);
            assert.strictEqual(result.sources.data, sources.docs);
            assert.strictEqual(result.sources.paging, sources.paging);
            assert.equal(result.type, WEB_GOT_SOURCE_RESULTS);
        });
    });

    describe("fetchSources", () => {
        let sandbox = null, keyword = "the";
        let ajaxClient = null, ajaxGetMock = null;

        beforeEach("fetchSources", () => {
            sandbox = sinon.sandbox.create();
            ajaxClient = new AjaxClient("/web-sources");
            sandbox.mock(AjaxClient).expects("instance").returns(ajaxClient);
            ajaxGetMock = sandbox.mock(ajaxClient).expects("get").withArgs({ keyword });
        });

        afterEach("fetchSources", () => {
            sandbox.restore();
        });

        it(`should dispatch ${WEB_GOT_SOURCE_RESULTS}, ${HAS_MORE_SOURCE_RESULTS} after getting sources`, (done) => {
            let result = {
                "docs": [{
                    "name": "The Hindu - International",
                    "url": "http://www.thehindu.com/news/international/?service=rss"
                }, {
                    "name": "The Hindu - Sport",
                    "url": "http://www.thehindu.com/sport/?service=rss"
                }],
                "paging": {
                    "offset": "25"
                }
            };
            ajaxGetMock.returns(Promise.resolve(result));

            let gotWebSourcesActionObj = {
                "type": WEB_GOT_SOURCE_RESULTS,
                "sources": { "data": result.docs, "paging": result.paging, "keyword": keyword }
            };

            let actions = [
                { "type": FETCHING_SOURCE_RESULTS },
                gotWebSourcesActionObj,
                { "type": HAS_MORE_SOURCE_RESULTS }
            ];

            let store = mockStore({ "configuredSources": { "web": [] } }, actions, done);
            store.dispatch(fetchWebSources(keyword));
            ajaxGetMock.verify();
        });

        it(`should dispatch ${WEB_GOT_SOURCE_RESULTS}, ${HAS_MORE_SOURCE_RESULTS} after getting sources with added=true property`, (done) => {
            let result = {
                "docs": [{
                    "name": "The Hindu - International",
                    "url": "http://www.thehindu.com/news/international/?service=rss"
                }, {
                    "name": "The Hindu - Sport",
                    "url": "http://www.thehindu.com/sport/?service=rss"
                }],
                "paging": {
                    "offset": "25"
                }
            };
            ajaxGetMock.returns(Promise.resolve(result));

            let gotWebSourcesActionObj = {
                "type": WEB_GOT_SOURCE_RESULTS,
                "sources": {
                    "data": [{
                        "name": "The Hindu - International",
                        "url": "http://www.thehindu.com/news/international/?service=rss"
                    }, {
                        "name": "The Hindu - Sport",
                        "url": "http://www.thehindu.com/sport/?service=rss",
                        "added": true
                    }],
                    "paging": result.paging,
                    "keyword": keyword
                }
            };

            const getStore = { "configuredSources": {
                "web": [{
                    "name": "The Hindu - Sport",
                    "url": "http://www.thehindu.com/sport/?service=rss",
                    "_id": "http://www.thehindu.com/sport/?service=rss"
                }]
            } };

            let actions = [
                { "type": FETCHING_SOURCE_RESULTS },
                gotWebSourcesActionObj,
                { "type": HAS_MORE_SOURCE_RESULTS }
            ];

            let store = mockStore(getStore, actions, done);
            store.dispatch(fetchWebSources(keyword));
            ajaxGetMock.verify();
        });

        it(`should dispatch ${NO_MORE_SOURCE_RESULTS} if sources are empty`, (done) => {
            let result = { "docs": [], "paging": { "offset": "25" } };
            ajaxGetMock.returns(Promise.resolve(result));

            let actions = [
                { "type": FETCHING_SOURCE_RESULTS },
                { "type": NO_MORE_SOURCE_RESULTS },
                { "type": FETCHING_SOURCE_RESULTS_FAILED, keyword }
            ];

            let store = mockStore({}, actions, done);
            store.dispatch(fetchWebSources(keyword));
        });
    });
});
