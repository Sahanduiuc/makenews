import React, { Component } from "react";
import PropTypes from "prop-types";
import HeaderTab from "./HeaderTab";
import ConfigureTab from "./ConfigureTab";
import UserProfileTab from "./UserProfileTab";

export default class Header extends Component {
    render() {
        const renderedDOM = this.props.currentHeaderTab === "Configure"
            ? null
            : (<div>
                <HeaderTab url="/newsBoard" name={this.props.mainHeaderStrings.newsBoard.Name}
                    currentHeaderTab={this.props.currentHeaderTab}
                />
                <HeaderTab url="/story-board/stories" name={this.props.mainHeaderStrings.storyBoard.Name}
                    currentHeaderTab={this.props.currentHeaderTab}
                />
                <div className="header-tabs-right">
                    <ConfigureTab url="/configure/web" name={this.props.mainHeaderStrings.configure.Name}
                        currentHeaderTab={this.props.currentHeaderTab}
                    />
                    <UserProfileTab/>
                </div>
            </div>);
        return renderedDOM;
    }
}

Header.propTypes = {
    "mainHeaderStrings": PropTypes.object.isRequired,
    "currentHeaderTab": PropTypes.string.isRequired
};
