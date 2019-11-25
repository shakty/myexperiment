/**
* # Bot type implementation of the game stages
* Copyright(c) 2019 Stefano <info@nodegame.org>
* MIT Licensed
*
* http://www.nodegame.org
* ---
*/

var ngc = require('nodegame-client');
var J = ngc.JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    // Must implement the stages here.

    stager.setDefaultCallback(function() {
        this.node.timer.randomDone();
    });

    stager.extendStep('game', {
        roles: {
            DICTATOR: {
                cb: function() {
                    // var node = this.node;
                    // // Did we receive an offer already?
                    // if ('undefined' === typeof node.game.offer) {
                    //     node.done({ offer: 50 });
                    // }
                    // else {
                    //     node.done({ offer: node.game.offer });
                    // }
                    // // Code below return is for Hands On 3: Observer's Reply.
                    //
                    // return;

                    // Comment the code above to run this part.

                    var node = this.node;
                    var offer;
                    // Did we receive an offer already?
                    if ('undefined' === typeof node.game.offer) {
                        offer = 50;
                    }
                    else {
                        offer = node.game.offer;
                    }
                    node.say("decision", node.game.partner, offer);

                }
            },
            OBSERVER: {
                cb: function() {
                    var node = this.node;
                    node.on.data('decision', function(msg) {

                        // Store previous offer.
                        node.game.offer = msg.data;

                        // Code for Hands On 3: Observer's Reply.
                        node.say("reply", msg.from, "I am a bot I don't care");
                        // End code for Hands On 3.

                        setTimeout(function() {
                            node.done();
                        }, 5000);
                    });
                }
            }
        }
    });

};
