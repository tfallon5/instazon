Results = new Meteor.Collection("results");

Session.set("user_id", "results");

var lastSearch = "";

Meteor.autosubscribe(function() {
    Meteor.subscribe("results", Session.get('user_id'));
});

Template.results.results = function() {
 return Results.find({user_id: Session.get('user_id')});
};

Template.results.events({
    'keyup input#appendedInputButton' : function(){
        var keywords = document.getElementById("appendedInputButton").value;
        // experimenting with delay so I don't search every time
        // while(keywords !== document.getElementById("appendedInputButton").value)
        //   keywords = document.getElementById("#appendedInputButton").value;
        var id = Session.get('user_id');
        var res = Results.find({user_id: id});
        if(res){
          //remove previous results
          Meteor.call('removeResults', id, function(err, results){
            if(err)
              console.log(err);
            Session.set({user_id: ""});
          });
        }
        //only search if there are keys and they are different than before
        if(keywords!=="" && keywords!==lastSearch){
          lastSearch = keywords;
          Meteor.call('getResultsFromAPI', keywords, id, function(err, results) {
            if (err)
              console.log(err);
            Session.set('user_id', "results");
          });
        }
    }
});

//adds in these html elements to the handlebar
Handlebars.registerHelper('helper', function(){
  return new Handlebars.SafeString(
    "<td><img src=\""+this.image+"\" class=\"img\" alt=\"Product\"></td><td><div class=\"name\">"+this.name+"</div></td><td><div class=\"price\">"+this.price+"</div></td><td><a href=\""+this.link+"\" class=\"btn\">Buy Now!</a></td>"
  );
});
