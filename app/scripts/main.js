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
		var stateTag;
		if (e.currentTarget.name == "tag") {
			if (e.currentTarget.checked) {
				stateTag = e.currentTarget.value;
			} else {
				stateTag = '';
			}
		} else {
			stateTag = this.props.filterTag;
		}

		this.props.onUserInput(
			this.refs.filterTextInput.value,
			stateTag
		);
	},
	render: function() {
		var tags = [];
		for (let tag of this.props.tags) {
			tags.push(
				<span key={tag} >
					<input
						type="checkbox"
						name="tag"
						id={"tag" + tag}
						ref="filterTagInput"
						checked={this.props.filterTag === tag}
						onChange={this.handleChange}
						value={tag}
						/>
					<label htmlFor={"tag" + tag}>
						{tag}
					</label>
				</span>
			);
		}
		return (
			<form>
				<h3>Filter by Group</h3>
				{tags}
				<h3>Or Search for your Dog</h3>
				<input
					type="text"
					placeholder="Search..."
					value={this.props.filterText}
					ref="filterTextInput"
					onChange={this.handleChange}
					/>
			</form>
		);
	}
});

var FilterableDogApp = React.createClass({
	getInitialState: function() {
		return {
			filterText: '',
			filterTag: ''
		};
	},
	handleUserInput: function(filterText, filterTag) {
		this.setState({
			filterText: filterText,
			filterTag: filterTag
		});
	},
	render: function() {
		var breedArray = [];
		var tagArray   = [];

		for (let result of this.props.data.results) {
			var breed = {};
			breed.name = result.data['breed.name'].value[0].text;
			breed.tag  = result.tags[0];
			// breed.desc = result.data['breed.short_lede'].value[0].text;

			if (breed.name.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1 && breed.tag.indexOf(this.state.filterTag) !== -1) {
				breedArray.push(<DogBreedItem breed={breed} key={breed.name}/>);
			}

			// Add tag to tagArray if it's not already in there
			if (tagArray.indexOf(breed.tag) == -1) {
				tagArray.push(breed.tag);
			}
		}
		return (
			<div>
				<Filters
					tags={tagArray}
					filterTag={this.state.filterTag}
					filterText={this.state.filterText}
					onUserInput={this.handleUserInput}
					/>
				{breedArray}
			</div>
		);
	}
});

// Request content
Prismic.api("https://dogdaze.prismic.io/api").then(function(api) {
	return api.query(""); // An empty query will return all the documents
}).then(function(response) {
	ReactDOM.render(
		<FilterableDogApp data={response} />,
		document.querySelector('.list--breeds')
	);
}, function(err) {
	console.log("Something went wrong: ", err);
});
