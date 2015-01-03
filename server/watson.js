var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var https = require('https');
var url = require('url');
var querystring = require('querystring');
var extend = require('util')._extend;
var flatten = require('../app/util/flatten');

var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");

// defaults for dev outside bluemix
var service_url = "https://gateway.watsonplatform.net/systemu/service/";
var service_username = "12312a68-fdff-4064-9928-eb088a960815";
var service_password = "KUwy0neR5kpV";

// Object to be sent to the client 
var flatTraitsArray = {USdata: null, stateData: null};

if (process.env.VCAP_SERVICES) {
  console.log('Parsing VCAP_SERVICES');
  var services = JSON.parse(process.env.VCAP_SERVICES);
  //service name, check the VCAP_SERVICES in bluemix to get the name of the services you have
  var service_name = 'user_modeling';
  
  if (services[service_name]) {
    var svc = services[service_name][0].credentials;
    service_url = svc.url;
    service_username = svc.username;
    service_password = svc.password;
  } else {
    console.log('The service '+service_name+' is not in the VCAP_SERVICES, did you forget to bind it?');
  }

} else {
  console.log('No VCAP_SERVICES found in ENV, using defaults for local development');
}

console.log('service_url = ' + service_url);
console.log('service_username = ' + service_username);
console.log('service_password = ' + new Array(service_password.length).join("X"));

var auth = 'Basic ' + new Buffer(service_username + ':' + service_password).toString('base64');



module.exports.watson =  function(data, res, called) {

  var parts = url.parse(service_url.replace(/\/$/,''));
  var profile_options = { host: parts.hostname,
    port: parts.port,
    path: parts.pathname + "/api/v2/profile",
    method: 'POST',
    headers: {
      'Content-Type'  :'application/json',
      'Authorization' :  auth }
    };

  create_profile_request(profile_options, data, res)(function(error,profile_string) {
    console.log('dataFromTwitterUS', data);
    if (error) console.log(error);
    else {
      // parse the profile and format it
      var profile_json = JSON.parse(profile_string);
      var flat_traits = flatten.flat(profile_json.tree);

      // Extend the profile options and change the request path to get the visualization
      // Path to visualization is /api/v2/visualize, add w and h to get 900x900 chart
      var viz_options = extend(profile_options, { path :  parts.pathname + "/api/v2/visualize?w=900&h=900&imgurl=%2Fimages%2Fapp.png"})

      // create a visualization request with the profile data
      create_viz_request(viz_options,profile_string)(function(error,viz) {
        if (error) res.render('index',{'error': error.message});
        else {
          //Here we get the results from Watson and send it back to the client
          //console.log(flat_traits);
          if (called) {
            flatTraitsArray.USdata = flat_traits;
          } else {
            flatTraitsArray.stateData = flat_traits;
            res.send(flatTraitsArray);
          }
        }
      });
    }
  });
};
//======== end Watson analysis =============================== 

// creates a request function using the https options and the text in content
// the function that return receives a callback
var create_profile_request = function(options,content, res) {
  return function (/*function*/ callback) {
    // create the post data to send to the User Modeling service
    var post_data = {
      'contentItems' : [{ 
        'userid' : 'dummy',
        'id' : 'dummyUuid',
        'sourceid' : 'freetext',
        'contenttype' : 'text/plain',
        'language' : 'en',
        'content': content
      }]
    };
    // Create a request to POST to the User Modeling service
    var profile_req = https.request(options, function(result) {
      result.setEncoding('utf-8');
      var response_string = '';

      result.on('data', function(chunk) {
        response_string += chunk;
      });
      
      result.on('end', function() {

        if (result.statusCode != 200) {
          var error = JSON.parse(response_string);
          // render error if the results are less than 100 words
          res.send({"error" : "Watson: Oh, dear. It looks like there aren't enough tweets to conduct an analysis. Kindly send me another search query."});
          callback({'message': error.user_message}, null);
        } else
          callback(null,response_string);
      });
    });
  
    profile_req.on('error', function(e) {
      callback(e,null);
    });

    profile_req.write(JSON.stringify(post_data));
    profile_req.end();
  }
};
// creates a request function using the https options and the profile 
// the function that return receives a callback
var create_viz_request = function(options,profile) {
  return function (/*function*/ callback) {
    // Create a request to POST to the User Modeling service
    var viz_req = https.request(options, function(result) {
      result.setEncoding('utf-8');
      var response_string = '';

      result.on('data', function(chunk) {
        response_string += chunk;
      });
      
      result.on('end', function() {
        if (result.statusCode != 200) {
          var error = JSON.parse(response_string);
          callback({'message': error.user_message}, null);
        } else
          callback(null,response_string);      });
    });
  
    viz_req.on('error', function(e) {
      callback(e,null);
    });
    viz_req.write(profile);
    viz_req.end();
  }
};
