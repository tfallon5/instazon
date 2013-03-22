var require = __meteor_bootstrap__.require;
var path = require("path");
var fs = require('fs');
var APAC;
var apacPath = 'node_modules/apac';

var base = path.resolve('.');
if (base == '/'){
  base = path.dirname(global.require.main.filename);   
}

var publicPath = path.resolve(base+'/public/'+apacPath);
var staticPath = path.resolve(base+'/static/'+apacPath);

if (path.existsSync(publicPath)){
  APAC = require(publicPath);
}
else if (path.existsSync(staticPath)){
  APAC = require(staticPath);
}
else{
  console.log('node_modules not found');
}

Results = new Meteor.Collection("results");

Meteor.methods({
  getResultsFromAPI:function (keywords, user_id){
      var util = require('util'),
      OperationHelper = APAC.OperationHelper;
      
      var opHelper = new OperationHelper({
	  awsId:     'AKIAJJEDNXWQXJW7XBQA',
	  awsSecret: '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',
	  assocId:   'wwwinstazonco-20', 
      });
	
      opHelper.execute('ItemSearch', {
	  'SearchIndex': 'All',
	  'Keywords': keywords,
	  'ResponseGroup': 'ItemAttributes'
      }, function(error, results) {
	  if (error) { console.log('Error: ' + error + "\n") }
	  console.log("Results:\n" + util.inspect(results) + "\n");
	  for(var i=0; i<5; i++){
	      var image = results.ItemSearchResponse.Items[0].Item[i].SmallImage;//["URL"];
	      var ItemAttr = results.ItemSearchResponse.Items[0].Item[i].ItemAttributes;
	      var ItemLinks = results.ItemSearchResponse.Items[0].Item[i].ItemLinks;
	      Fiber(function(){
		  Results.insert({
		      id: user_id,
		      image: image,
		      price: ItemAttr["ListPrice"["FormattedPrice"]],
		      name: ItemAttr["Title"],
		      link: ItemLinks.ItemLink//["URL"]
		  });
	      }).run();
	  }
	  return results;
      });
  }
});

Meteor.publish("results", function(user_id) {
        return Results.find({user_id: user_id});
});
