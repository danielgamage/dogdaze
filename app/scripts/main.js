var React = require('react');
var ReactDOM = require('react-dom');
var Prismic = require('prismic.io');
import FlipMove from 'react-flip-move';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';


var prismicXHR = Prismic.api("https://dogdaze.prismic.io/api").then(function(api) {
    return api.query("");
});

var tag,
breed;

const breedEnterAnimation = {
    from: { transform: 'scale(0.9)', opacity: 0 },
    to:   { transform: '', opacity: '' }
}
const breedLeaveAnimation = {
    from: { transform: 'scale(1)', opacity: 1 },
    to:   { transform: 'scale(0.9)', opacity: 0 }
}

const App = React.createClass({
    getInitialState: function() {
        return {
            documents: ''
        }
    },
    componentWillMount: function() {
        var _this = this;

        prismicXHR.then(function(prismicDocuments) {
            _this.setState({
                documents: prismicDocuments
            });
        }, function(err) {
            console.log("Something went wrong: ", err);
        });
    },
    render: function() {
        if (this.state.documents != '') {
            const childrenWithProps = React.Children.map(this.props.children,
                (child) => React.cloneElement(child, {
                    documents: this.state.documents
                })
            );
            return (
                <div>
                    {childrenWithProps}
                </div>
            );
        } else {
            return (
                <div>
                    {this.props.children}
                </div>
            )
        }
    }
});

const Home = React.createClass({
    getInitialState: function() {
        return {
            filterSearch: '',
            filterGroup: '',
            documents: ''
        };
    },
    handleUserInput: function(filterSearch, filterGroup) {
        this.setState({
            filterSearch: filterSearch,
            filterGroup: filterGroup
        });
    },
    render: function() {
        var breedItems = [];
        var tagList    = [];

        // for each result
        if (this.props.documents) {
            for (let result of this.props.documents.results) {
                var breed = {};
                breed.name = result.data['breed.name'].value[0].text;
                breed.tag  = result.tags[0];

                // Add breed to breedItems if it passes filtering
                if (breed.name.toLowerCase().indexOf(this.state.filterSearch.toLowerCase()) !== -1 && breed.tag.indexOf(this.state.filterGroup) !== -1) {
                    breedItems.push(result);
                }

                // Add tag to tagList if it's not already in there
                if (tagList.indexOf(breed.tag) == -1) {
                    tagList.push(breed.tag);
                }
            }
        }

        return (
            <div>
                <Filters
                    tags={tagList}
                    filterGroup={this.state.filterGroup}
                    filterSearch={this.state.filterSearch}
                    onUserInput={this.handleUserInput}
                    />
                <FlipMove
                    enterAnimation={breedEnterAnimation}
                    leaveAnimation={breedLeaveAnimation}
                    typeName="ul"
                    className="list--breeds"
                    staggerDurationBy="30"
                    staggerDelayBy="10"
                    easing="ease"
                    duration="200"
                    >
                    {breedItems.map(breed => (
                        <li key={breed.slug}>
                            <img src={breed.data['breed.image'] ? breed.data['breed.image'].value.views.icon.url : null} />
                            <h1>
                                <Link to={'/breed/' + breed.slug}>{breed.data['breed.name'].value[0].text}</Link>
                            </h1>
                            <h3><label htmlFor={"group" + breed.tags[0]}>{breed.tags[0]}</label></h3>
                        </li>
                    ))}
                </FlipMove>
            </div>
        );
    }
});

const DogBreedItem = React.createClass({
    returnCurrent: function() {
        return document.slug === this.props.documents.slug
    },
    render: function() {
        console.log(this.props.documents);
        var breed = this.props.documents.results.find(this.returnCurrent);
        return (
            <article>
                <img src={breed.data['breed.image'] ? breed.data['breed.image'].value.views.icon.url : null} />
                <h1>
                    {breed.data['breed.name'].value[0].text}
                </h1>
                <h3><label htmlFor={"group" + breed.tags[0]}>{breed.tags[0]}</label></h3>
                <div>
                    {breed.data['breed.description'].value.map(paragraph => (
                        <p>{paragraph.text}</p>
                    ))}
                </div>
            </article>
        );
    }
});

const NoMatch = React.createClass({
    render: function() {
        return (
            <div>Ouch sorry 404</div>
        );
    }
});

const Filters = React.createClass({
    handleChange: function(e) {
        var stateGroup;
        if (e.currentTarget.name == "group") {
            if (e.currentTarget.checked) {
                // use input value if
                stateGroup = e.currentTarget.value;
            } else {
                stateGroup = '';
            }
        } else {
            // use app state as fallback
            stateGroup = this.props.filterGroup;
        }

        this.props.onUserInput(
            this.refs.filterSearchInput.value,
            stateGroup
        );
    },
    render: function() {
        // Prismic uses tags, but for users we'll call these "groups"
        var groups = [];
        for (let tag of this.props.tags) {
            groups.push(
                <span key={tag} className="filter--group">
                    <input
                        type="checkbox"
                        name="group"
                        id={"group" + tag}
                        ref="filterGroupInput"
                        checked={this.props.filterGroup === tag}
                        onChange={this.handleChange}
                        value={tag}
                        />
                    <label htmlFor={"group" + tag}>
                        {tag}
                    </label>
                </span>
            );
        }
        return (
            <form>
                <h3>Filter by Group</h3>
                {groups}
                <h3>Or Search for your Dog</h3>
                <input
                    className="filter--search"
                    type="text"
                    placeholder="Search..."
                    value={this.props.filterSearch}
                    ref="filterSearchInput"
                    onChange={this.handleChange}
                    />
            </form>
        );
    }
});

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Home}/>
            <Route path="/breed/:breedSlug" component={DogBreedItem}/>
            <Route path="*" component={NoMatch} />
        </Route>
    </Router>,
    document.querySelector('.container--app')
);
