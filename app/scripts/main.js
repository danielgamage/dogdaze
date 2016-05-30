var tagArray   = [],
	tag,
	breed;

var DogBreedItem = React.createClass({
	render: function() {
		return (<li>
					<h1>{this.props.breed.name}</h1>
					<h3>{this.props.breed.tag}</h3>
				</li>);
	}
});

var DogBreedTag = React.createClass({
	render: function() {
		return (
			<label htmlFor={this.props.tag} >
				<input type="radio" name="tag" id={this.props.tag} />
				{this.props.tag}
			</label>
		);
	}
});

var SearchBar = React.createClass({
  handleChange: function() {
    this.props.onUserInput(
      this.refs.filterTextInput.value
    );
  },
  render: function() {
    return (
	    <input
	      type="text"
	      placeholder="Search..."
	      value={this.props.filterText}
	      ref="filterTextInput"
	      onChange={this.handleChange}
	    />
    );
  }
});

var FilterableDogApp = React.createClass({
  getInitialState: function() {
    return {
      filterText: ''
    };
  },
  handleUserInput: function(filterText) {
    this.setState({
      filterText: filterText
    });
  },
  render: function() {
	  var breedArray = [];
	  for (let result of this.props.data.results) {
		  var breed = {};
		  breed.name = result.data['breed.name'].value[0].text;
		  breed.tag  = result.tags[0];
		  // breed.desc = result.data['breed.short_lede'].value[0].text;

		  if (breed.name.indexOf(this.state.filterText) !== -1) {
			  breedArray.push(<DogBreedItem breed={breed} key={breed.name}/>);
		  }
		  console.log(breedArray);

		  // Add tag to tagArray if it's not already in there
		  if (tagArray.indexOf(breed.tag) == -1) {
			  tagArray.push(<DogBreedTag tag={breed.tag} key={breed.tag}/>);
		  }
	  }
    return (
      <div>
		<form>
			<h3>Filter by Group</h3>
			{tagArray}
			<h3>Or Search for your Dog</h3>
	        <SearchBar
	          filterText={this.state.filterText}
	          onUserInput={this.handleUserInput}
	        />
		</form>
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
