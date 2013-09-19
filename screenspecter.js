// VARS
var date = new Date();
var _directory = 'Screenshots '+(date.getMonth() + 1)+'-'+date.getDate()+'-'+date.getFullYear();

var _loginDone = 0;

// REQUIRES
var _fs = require('fs');
var _casper = require('casper');

var _urls = _fs.read('urls.txt').split(/[\r\n]/);

var _nbSteps = _urls.length;
var _currentStep = 0;

function isEnd() {
    _currentStep++;
    if (_currentStep >= _nbSteps) {
        console.log('You are all done, get the fuck out.')
        phantom.exit();
    }
}

function flushDir() {
    _fs.removeTree(_directory);
    _fs.makeDirectory(_directory);
}


function takeScreenshot(page) {
    page.capture(_directory + '/' + _currentStep+'.png', null, { format: 'png'});
}

function casperLogin() {
    var localCasper = _casper.create();
    localCasper.start(_urls[0], function() {
        this.fill('form', {
            'loginName': 'irvineTest',
            'password': 'irvineTest'
        }, true);
    });
    localCasper.run(function() {
        console.log("Login complete, proceeding...");
        _loginDone = 1;
    });
}

function waitLogin(context) {
    console.log(context.getCurrentUrl() + "----WAIT-----");

    context.wait(1000, function() {
        if (_loginDone == 0) {
            waitLogin(this);
        }
        else {
            console.log(this.getCurrentUrl() + "----FOUND-----");
            this.reload(function() {
                console.log(this.getCurrentUrl() + "----RELOAD-----");
                screenShotHelper(this)
            });
        }
    });
}

function screenShotHelper(context) {
    if (context.getCurrentUrl() == "http://user-guides/")
    {
        console.log("Screenshot for:"+context.getCurrentUrl());
        console.log("BEGIN TO WAIT");
        context.wait(4000, function() {
            console.log("Screenshot for:"+this.getCurrentUrl());
            takeScreenshot(this);
            isEnd();
        });
    }
    else
    {
        console.log("Screenshot for:"+context.getCurrentUrl());
        takeScreenshot(context);
        isEnd();
    }
}


function casperSequence(urls) {
    var localCasper = _casper.create({
        viewportSize: { width: 1680, height: 1050 }
    });

    localCasper.start();
    for(var i=0; i < _nbSteps; i++) {
        localCasper.thenOpen(urls[i], function() {

            console.log(this.getCurrentUrl() + "----BEGIN-----");


            if (this.getCurrentUrl() == "http://user-guides/login")
            {
                casperLogin();
                waitLogin(this);
            }
            else {
                screenShotHelper(this)
            }
            console.log(this.getCurrentUrl() + "----END-----");

        });

    };
    localCasper.run();
}


//LOGIC
flushDir();
casperSequence(_urls);
