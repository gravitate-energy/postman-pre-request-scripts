EvaluateGithubScript(
    "https://raw.githubusercontent.com/gravitate-energy/postman-pre-request-scripts/master/gravitate_dot_net",
    "old_authorize_script.js",
    true
)

function EvaluateGithubScript(baseUrl, scriptName, logResponse){
    var uuid = require('uuid');
    // adding token and a random string causes github raw to return the latest result and bypass its cache
    var cacheBuster = `token=${uuid.v4()}` 
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
