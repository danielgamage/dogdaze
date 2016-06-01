var tag,
breed;

var DogBreedItem = React.createClass({
	render: function() {
		return (<li>
			<h1>{this.props.breed.name}</h1>
			<h3>{this.props.breed.tag}</h3>
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
				<span key={tag} >
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
			// breed.desc = result.data['breed.short_lede'].value[0].text;

			// Add breed to breedItems if it passes filtering
			if (breed.name.toLowerCase().indexOf(this.state.filterSearch.toLowerCase()) !== -1 && breed.tag.indexOf(this.state.filterGroup) !== -1) {
				breedItems.push(<DogBreedItem breed={breed} key={breed.name}/>);
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
				{breedItems}
			</div>
		);
	}
});

// Request content
Prismic.api("https://dogdaze.prismic.io/api").then(function(api) {
	return api.query(""); // An empty query will return all the documents
}).then(function(prismicDocuments) {
	// Render app
	ReactDOM.render(
		<FilterableDogApp data={prismicDocuments} />,
		document.querySelector('.list--breeds')
	);
}, function(err) {
	console.log("Something went wrong: ", err);
});
