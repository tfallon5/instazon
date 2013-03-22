Results = new Meteor.Collection("results");

Session.setDefault('user_id', Math.round((Math.random()*(5000000))));

Deps.autorun(function() {
    Meteor.subscribe("results", Session.get('user_id'));
});

Template.results.results = function() {
    var id = Session.get('user_id');
    return Results.find({user_id: id});
};

Template.results.events({
    'keyup input#appendedInputButton' : function(){
        var id = Session.get('user_id');
        var res = Results.find({user_id: id});
        if(res){
          res.forEach(function (results) {
            res.remove(this._id);
          });
        }
        var keywords = document.getElementById("appendedInputButton").value;
        if(keywords!==""){
          Meteor.call('getResultsFromAPI', keywords, id, function(err, results) {
            if (err)
              console.log(err);
        
            Session.set('user_id', id);//Session.get(user_id));
          });
          //console.log("Back here");
          var results = Results.find({user_id: id});
          //console.log(results);
//           for (var key in results) { 
//     console.log(key + ": " + results[key]); 
// }
          console.log(results);
        }
    }
});

Template.item.events({
  '.display' : function () {
    Deps.flush();
  }
});
