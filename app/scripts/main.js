// var Prismic = require('prismic.io'); // bower-required

Prismic.api("https://dogdaze.prismic.io/api").then(function(api) {
  return api.query(""); // An empty query will return all the documents
}).then(function(response) {
  console.log("Documents: ", response.results);
}, function(err) {
  console.log("Something went wrong: ", err);
});
