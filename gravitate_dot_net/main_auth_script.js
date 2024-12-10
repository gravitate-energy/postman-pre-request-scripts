

ExecuteAuthorizationPreRequest()

function ExecuteAuthorizationPreRequest(){
    var authorizeEndpointScript = "authenticate_via_authorize_endpoint.js";
    var tokenEndpointScript = "authenticate_via_token_endpoint.js"
    var newAuthUrl = FillFromEnvironmentOrCollection("{{baseUrl}}/api/token/authorize")

    var tokenRequest = { 
       url: newAuthUrl, 
        method: 'POST',
        header: 'Content-Type:application/json',
        body: { mode: 'application/json', raw: JSON.stringify({})}
    };
    pm.sendRequest(tokenRequest, function (err, response) {
        if (err) {
            throw err;
        }
        // if we cant find the new endpoint use the old one
        var script = response.code == 404 ? authorizeEndpointScript : tokenEndpointScript;
        if(response.code == 404){
            console.log("Using legacy endpoint for authorization")
        }else {
            console.log("Using new token endpoint for authorization")
        }
        EvaluateGithubScript(
            "https://raw.githubusercontent.com/gravitate-energy/postman-pre-request-scripts/master/gravitate_dot_net",
            script,
            false
        )
    }); 
}

function EvaluateGithubScript(baseUrl, scriptName, logResponse){
    var uuid = require('uuid');
    // adding token and a random string causes github raw to return the latest result and bypass its cache
    var cacheBuster = `v=${uuid.v4()}` 
    var requestUrl = `${baseUrl}/${scriptName}?${cacheBuster}`
    console.log(`Script URL: ${requestUrl}`)
    pm.sendRequest(requestUrl, function (err, res) {
    if (err) {
        console.log(err);
    } else {
        var response = res.text();
        if(logResponse){
            console.log(response)
        }
        eval(response)
    }
});
}


// given a string, attempt to fill in any {{var}} values from the environment or collection variables
function FillFromEnvironmentOrCollection(inputString){
    var result = pm.environment.replaceIn(inputString); // attempts to fill any {{var}} values from the environment
    result = pm.collectionVariables.replaceIn(result); // attempts to fill any {{var}} values from the collection variables
    return result;
}
