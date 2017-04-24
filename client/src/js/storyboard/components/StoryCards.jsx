/* eslint no-magic-numbers:0*/
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as StoryBoardActions from "../actions/StoryBoardActions";
import ConfirmPopup from "../../utils/components/ConfirmPopup/ConfirmPopup";
import { Link } from "react-router";
import Locale from "../../utils/Locale";

export class StoryCards extends Component {

    constructor() {
        super();
        this.state = { "showDeleteConfirm": false, "currentId": 0 };
    }
    componentDidMount() {
        this.props.dispatch(StoryBoardActions.getStories());
    }

    componentWillReceiveProps(nextProps) {
        this.props.dispatch(StoryBoardActions.addDefaultTitle(this._untitledNumber(nextProps.stories)));
    }

    componentWillUnmount() {
        this.props.dispatch(StoryBoardActions.clearStories);
    }

    _untitledNumber(stories) {
        let untitled = [];
        let storyTitles = stories.map((value) => value.title);
        untitled = Array(storyTitles.length + 1).fill().map((value, index) => { //eslint-disable-line consistent-return
            let untitledNo = "Untitled" + (index + 1);
            if(storyTitles.indexOf(untitledNo) === -1) {
                return untitledNo;
            }
        });
        return untitled.sort()[0];
    }

    deleteStory(id, event) {
        event.stopPropagation();
        event.preventDefault();
        this.setState({ "showDeleteConfirm": true, "currentId": id });
    }

    _renderStoriesList() {
        let storiesArray = [];
        storiesArray.push(<li className="add-card" key="0">
            <Link ref="newStoryCard" className="navigation-link" to="/story-board/story">
                <div className="card">
                <i className="fa fa-plus-circle icon" aria-hidden="true"/>
                { "Create New Story" }
                </div>
            </Link>
        </li>);
        this.props.stories.map((story, index) =>
            storiesArray.push(
                <li key={index + 1} className="added-card">
                    <i className="fa fa-remove icon delete-icon" onClick={(event) => this.deleteStory(story._id, event)}/>
                    <Link ref={`story${story._id}`} to={`/story-board/story/edit/${story._id}`} className="navigation-link">
                        <div className="card">
                            <i ref={`title${story.title}`}>{story.title}</i>
                        </div>
                    </Link>
                </li>
            )
        );
        return storiesArray;
    }

    render() {
        return (
            <div>
                <div className="create-story-tab">
                    <Link ref="newStoryBar" className="create-story-icon" to="/story-board/story">
                        <i className="fa fa-folder icon" aria-hidden="true"/>
                        { "Create New Story" }
                    </Link>
                </div>
                <div className="story-board-container">
                    <ul className="story-cards">
                        {this._renderStoriesList()}
                    </ul>
                    {this.state.showDeleteConfirm
                        ? <ConfirmPopup
                            description={Locale.applicationStrings().messages.storyBoard.confirmDelete}
                            callback={(isConfirmed) => {
                                if(isConfirmed) {
                                    this.props.dispatch(StoryBoardActions.deleteStory(this.state.currentId));
                                }
                                this.setState({ "showDeleteConfirm": false });
                            }
                            }
                          /> : null
                    }

                </div>
            </div>
        );
    }
}

StoryCards.propTypes = {
    "dispatch": PropTypes.func.isRequired,
    "stories": PropTypes.array.isRequired
};


function mapToStore(store) {
    return {
        "stories": store.stories
    };
}
export default connect(mapToStore)(StoryCards);

