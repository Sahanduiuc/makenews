/* eslint brace-style:0 */
import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import DisplayWebArticle from "./DisplayWebArticle";
import DateTimeUtil from "../../utils/DateTimeUtil";
import { bookmarkArticle, addArticleToCollection } from "./../actions/DisplayArticleActions";
import { displayArticle } from "./../actions/DisplayFeedActions";
import { newsBoardTabSwitch } from "./../actions/DisplayFeedActions";
import { newsBoardSourceTypes } from "./../../utils/Constants";
import Toast from "./../../utils/custom_templates/Toast";

export class DisplayArticle extends Component {

    renderBody() {
        return (<main className="article">
                    <h1 className="article__title">
                        { this.props.article.title }
                    </h1>

                    <div className="article__details">
                        <i className={`fa fa-${this.props.article.sourceType}`} />
                        <span>{` | ${DateTimeUtil.getLocalTime(this.props.article.pubDate)}`}</span>
                        {
                            this.props.article.tags &&
                            this.props.article.tags.map((tag, index) => <span key={index}>{` | ${tag}`}</span>)
                        }
                    </div>

                    <div className="article__images">
                        { this.props.article.images && this.props.article.images.map((image, index) => <img key={index} src={image.url} />) }
                    </div>

                    {this.props.article.sourceType === "web"
                        ? <DisplayWebArticle />
                        : <div className="article__desc">
                            { this.props.article.description }
                          </div>
                    }

                    <div className="article__original-source">
                        <a href={this.props.article.link} target="_blank" rel="nofollow noopener noreferrer">Read the Original Article</a>
                    </div>
                </main>);
    }

    renderHeader() {
        return(this.props.newsBoardCurrentSourceTab === newsBoardSourceTypes.collection
            ? <header className="display-article__header back">
                <button className="back__button" onClick={() => { this.props.collection.style.display = "block"; this.props.dispatch(displayArticle()); }}>
                <i className="icon fa fa-arrow-left" aria-hidden="true"/>{this.props.collectionName}</button>
                </header>
            : this.renderArticleHeader()
        );

    }

    renderArticleHeader() {
        return(
            this.props.isStoryBoard
                ? <header className={`${this.articleClass}__header back`}>
                    <button className="back__button" onClick={() => { this.props.articleOpen(); }}><i className="icon fa fa-arrow-left" aria-hidden="true"/>back</button>
                  </header>

                : <header className={`${this.articleClass}__header`}>
                    <div className="collection" onClick={() => { this.props.dispatch(newsBoardTabSwitch(newsBoardSourceTypes.collection));
                        this.props.dispatch(addArticleToCollection(this.props.article._id, this.props.newsBoardCurrentSourceTab, this.props.article.sourceId));
                    }}
                    >
                        <i className="icon fa fa-folder-o"/> Add to collection
                    </div>

                    {
                        this.props.article.bookmark
                        ? <div className="bookmark active" onClick={() => { this.props.dispatch(bookmarkArticle(this.props.article)); }}>
                            <i className="icon fa fa-bookmark"/> Bookmarked
                          </div>
                        : <div className="bookmark" onClick={() => { this.props.dispatch(bookmarkArticle(this.props.article)); }}>
                            <i className="icon fa fa-bookmark"/> Bookmark
                          </div>
                    }
                  </header>);
    }

    render() {
        this.articleClass = this.props.isStoryBoard ? "story-display-article display-article" : "display-article";
        if(this.props.article && this.props.article._id) {
            if(this.props.collection) {
                this.props.collection.style.display = "none";
            }
            return (
                <article className={this.articleClass}>
                    { this.renderHeader() }
                    { this.renderBody() }
                    { this.props.addToCollectionStatus.message && (<div className="add-to-collection-message">{Toast.show(this.props.addToCollectionStatus.message)}</div>)}
                </article>
            );
        }
        return null;
    }
}

DisplayArticle.propTypes = {
    "article": PropTypes.object,
    "dispatch": PropTypes.func.isRequired,
    "newsBoardCurrentSourceTab": PropTypes.string.isRequired,
    "addToCollectionStatus": PropTypes.object.isRequired,
    "collection": PropTypes.object,
    "collectionName": PropTypes.string,
    "articleOpen": PropTypes.func,
    "isStoryBoard": PropTypes.bool
};

function mapToStore(store) {
    return {
        "article": store.selectedArticle,
        "newsBoardCurrentSourceTab": store.newsBoardCurrentSourceTab,
        "addToCollectionStatus": store.addToCollectionStatus
    };
}

export default connect(mapToStore)(DisplayArticle);
