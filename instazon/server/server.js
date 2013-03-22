//gets path to node.js api
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
      //uses node.js api to get results
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
	  var root = results.ItemSearchResponse.Items[0];
	  for(var i=0; i<5; i++){
	      var image = root.Item[i].ImageSets[0].ImageSet[0].SmallImage[0].URL;
	      var title = root.Item[i].ItemAttributes[0].Title;
	      var URL = root.Item[i].DetailPageURL;
	      var cost = "N/A";
	      if(root.Item[i].hasOwnProperty('OfferSummary')&&root.Item[i].OfferSummary[0].hasOwnProperty('LowestNewPrice'))
		  cost = root.Item[i].OfferSummary[0].LowestNewPrice[0].FormattedPrice;
	      Fiber(function(){
		  //inserts the top five results
		  Results.insert({
		      user_id: user_id,
		      image: image,
		      price: cost,
		      name: title,
		      link: URL
		  });
	      }).run();
	  }
      });
  },
    
  removeResults: function(id){
      Results.remove({user_id: id});
  }
});

Meteor.publish("results", function(user_id) {
        return Results.find({user_id: user_id});
});
