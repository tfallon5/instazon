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
	  'ResponseGroup': 'Medium,ItemAttributes'
      }, function(error, results) {
	  if (error) { console.log('Error: ' + error + "\n") }
	  for(var i=0; i<5; i++){
	      var image = results.ItemSearchResponse.Items[0].Item[i].ImageSets[0].ImageSet[0].SmallImage[0].URL;
	      var title = results.ItemSearchResponse.Items[0].Item[i].ItemAttributes[0].Title;
	      var URL = results.ItemSearchResponse.Items[0].Item[i].DetailPageURL;
	      var cost = results.ItemSearchResponse.Items[0].Item[i].OfferSummary[0].LowestNewPrice[0].FormattedPrice;
	      Fiber(function(){
		  Results.insert({
		      id: user_id,
		      image: image,
		      price: cost,
		      name: title,
		      link: URL
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
