var React = require('react');
var ReactDOM = require('react-dom');
var Prismic = require('prismic.io');
import FlipMove from 'react-flip-move';

var tag,
breed;

var DogBreedItem = React.createClass({
	render: function() {
		var breed = this.props.breed;
		var breedImgSrc = (breed.data['breed.image'] ? breed.data['breed.image'].value.views.icon.url : null);
		return (<li>
			<img
				src={breedImgSrc}
			/>
			<h1>{breed.data['breed.name'].value[0].text}</h1>
			<h3>{breed.tags[0]}</h3>
		</li>);
	}
});

var Filters = React.createClass({
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

var FilterableDogApp = React.createClass({
	getInitialState: function() {
		return {
			filterSearch: '',
			filterGroup: ''
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
		for (let result of this.props.data.results) {
			var breed = {};
			breed.name = result.data['breed.name'].value[0].text;
			breed.tag  = result.tags[0];

			// Add breed to breedItems if it passes filtering
			if (breed.name.toLowerCase().indexOf(this.state.filterSearch.toLowerCase()) !== -1 && breed.tag.indexOf(this.state.filterGroup) !== -1) {
				breedItems.push(<DogBreedItem breed={result} key={breed.name}/>);
			}

			// Add tag to tagList if it's not already in there
			if (tagList.indexOf(breed.tag) == -1) {
				tagList.push(breed.tag);
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
					enterAnimation="elevator"
					leaveAnimation="elevator"
					typeName="ul"
					className="list--breeds"
					>
					{breedItems}
				</FlipMove>
			</div>
		);
	}
});

// Request content
Prismic.api("https://dogdaze.prismic.io/api").then(function(api) {
	return api.query(""); // An empty query will return all the documents
}).then(function(prismicDocuments) {
	console.log(prismicDocuments);
	// Render app
	ReactDOM.render(
		<FilterableDogApp data={prismicDocuments} />,
		document.querySelector('.container--app')
	);
}, function(err) {
	console.log("Something went wrong: ", err);
});
