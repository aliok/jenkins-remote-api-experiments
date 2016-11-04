var blessed = require('blessed');

var screen = blessed.screen(),
    body = blessed.box({
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        tags: true
    });

screen.append(body);

screen.key(['C-c'], function(ch, key) {
    return process.exit(0);
});

function status(text) {
    body.setLine(0, '{blue-bg}' + text + '{/blue-bg}');
    screen.render();
}
function log(text) {
    body.insertLine(1, text);
    screen.render();
}

var c = 1;
setInterval(function() {
    status((new Date()).toISOString());
    log('This is line #' + (c++));
}, 100);