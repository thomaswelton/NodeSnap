/*
 * GET home page.
 */

//Facebook
var FacebookClient = require("facebook-client").FacebookClient;
var SignedRequest = require('facebook-signed-request');
var fb_secret = '565b1ee857ca2ea9c88d7323c0cb4b06';

SignedRequest.secret = fb_secret;


var facebook_client = new FacebookClient(
    "yourappid", // configure like your fb app page states
    "yourappsecret" // configure like your fb app page states
);

exports.index = function(req, res){
	
	if(typeof(req.body.signed_request) !== 'undefined'){
	
	var signedRequest = new SignedRequest( req.body.signed_request );

	signedRequest.parse(function(errors, request){
	  	if(request.isValid()){
	  		console.log(request.data);
			facebook_client.getSessionByAccessToken(request.data.oauth_token)(function(facebook_session) {
				if(typeof(facebook_session) !== 'undefined'){
			    	res.render('index', { title: 'Node Snap!' })
				}else{
					res.render('login', { title: 'Node Snap!' })
				}
			});
		}else{
			res.render('login', { title: 'Node Snap!' });
		}
	});
	}else{
		facebook_client.getSessionByRequestHeaders(req.headers)(function(facebook_session) {
			if(typeof(facebook_session) !== 'undefined'){
		    	res.render('index', { title: 'Node Snap!' })
			}else{
				res.render('index', { title: 'Node Snap!' })
			}
		});
	}
	
  
};