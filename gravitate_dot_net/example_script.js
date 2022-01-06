var url = "https://raw.githubusercontent.com/gravitate-energy/postman-pre-request-scripts/"
var scriptPath = `${url}master/gravitate_dot_net/old_authorize_script.js`


pm.sendRequest(scriptPath, function (err, res) {
    if (err) {
        console.log(err);
    } else {
        var response = res.text();
        eval(response)
    }
});
