/**
* # Player type implementation of the game stages
* Copyright(c) 2019 Stefano <info@nodegame.org>
* MIT Licensed
*
* Each client type must extend / implement the stages defined in `game.stages`.
* Upon connection each client is assigned a client type and it is automatically
* setup with it.
*
* http://www.nodegame.org
* ---
*/

"use strict";

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    stager.setOnInit(function() {

        // Initialize the client.

        var header, frame;

        // Setup page: header + frame.
        header = W.generateHeader();
        frame = W.generateFrame();

        // Add widgets.
        // this = node.game.
        this.visualRound = node.widgets.append('VisualRound', header);
        this.visualTimer = node.widgets.append('VisualTimer', header);
        this.doneButton = node.widgets.append('DoneButton', header);

        // Bid is valid if it is a number between 0 and 100.
        this.isValidBid = function(n) {
            return node.JSUS.isInt(n, -1, 101);
        };

        // Additional debug information while developing the game.
        // this.debugInfo = node.widgets.append('DebugInfo', header)
    });

    stager.extendStep('instructions', {
        frame: 'instructions.htm',
        cb: function() {
            node.on.data('yourpartner', function(msg) {
                node.game.mypartner = msg.data;
                console.log(msg.data);
            });
        }
    });

    stager.extendStep('quiz', {
        widget: {
            name: 'ChoiceManager',
            root: 'container',
            options: {
                className: 'centered',
                mainText: 'A small quiz',
                forms: [
                    {
                        name: 'ChoiceTable',
                        id: 'understand_roles',
                        mainText: 'What are the roles in this game?',
                        hint: 'I know you know it!',
                        choices: [
                            'Observer and Dictator',
                            'Sancho and Pancho',
                            'Batman and Robin',
                            "I don't know",
                            'I wish I\'d know it'
                        ],
                        correctChoice: 0,
                        shuffleChoices: true,
                        orientation: 'V' // vertical
                    },

                    {
                        name: 'ChoiceTable',
                        id: 'understand_money',
                        mainText: 'How many coins will you split?',
                        choices: [
                            0, 1, 10, 100, 'I do not know'
                        ],
                        correctChoice: 3,
                        shuffleChoices: true
                    }

                ]
            }
        },
        cb: function() {
            // W.cssRule adds a quick style to the page.
            // Here, we left-align all the TD inside the element with ID
            // understand_roles.
            W.cssRule('#understand_roles td { text-align: left; }');
        }
    });

    // Optional step for custom grouping.
    // Note! This step is skipped in game.stages, and these groups are not
    // actually used in the game step. Do you know how to adjust it?
    stager.extendStep('grouping', {
        widget: {
            name: 'ContentBox',
            options: {
                mainText: 'Please wait while groups are being formed'
            }
        },
        cb: function() {
            node.on.data('yourpartner', function(msg) {
                node.game.mypartner = msg.data;
                console.log("My partner is: " + msg.data);
                node.timer.randomDone();
            });
        }
    });

    stager.extendStep('game', {
        donebutton: false,
        frame: 'game.htm',
        roles: {
            DICTATOR: {
                timer: settings.bidTime,
                cb: function() {
                    var button, offer, div;

                    // Make the dictator display visible.
                    div = W.getElementById('dictator').style.display = '';
                    // W.gid is a shorthand for W.getElementById.
                    button = W.gid('submitOffer');
                    offer =  W.gid('offer');

                    // Listen on click event.
                    button.onclick = function() {
                        var decision;

                        // Validate offer.
                        decision = node.game.isValidBid(offer.value);
                        if ('number' !== typeof decision) {
                            W.writeln('Please enter a number between ' +
                            '0 and 100.', 'dictator');
                            return;
                        }
                        button.disabled = true;

                        // Mark the end of the round, and
                        // store the decision in the server.
                        node.say("decision", node.game.partner, offer);
                    };

                    // Code for Hands On: 3 Observer's Reply.
                    // We wait for the reply, we display it, and
                    // we call node.done (with a random timer).
                    node.on.data("reply", function(msg) {
                        W.writeln("Your partner thinks of your offer: " +
                        (msg.data || "nothing"));
                        node.timer.randomDone();
                    });


                },
                timeup: function() {
                    var n;
                    // Code for Hands On 2:  Timeup!
                    if ('undefined' === typeof node.game.decision) {
                        n = J.randomInt(-1,100);
                    }
                    n = node.game.decision;
                    W.getElementById('offer').value = n;
                    W.getElementById('submitOffer').click();
                }
            },
            OBSERVER: {
                cb: function() {
                    var span, div, dotsObj;

                    // Make the observer display visible.
                    div = W.getElementById('observer').style.display = '';
                    span = W.getElementById('dots');
                    dotsObj = W.addLoadingDots(span);

                    node.on.data('decision', function(msg) {

                        dotsObj.stop();
                        W.setInnerHTML('waitingFor', 'Decision arrived: ');
                        W.setInnerHTML('decision',
                        'The dictator offered: ' + msg.data + ' ECU.');

                        node.timer.randomDone();
                        return;
                        // Uncomment the two lines immediately above
                        // to run Hands On 3.

                        // Show hidden part.
                        W.show("reply");
                        // Add listener that sends the text back to dictator.
                        W.gid("submit_reply").onclick = function() {
                            // Say message directly to dictator.
                            node.say("reply", "dictator_id",
                            W.gid("observer_reply").value);
                            // End step.
                            node.done();
                        };

                    });
                }
            }
        }
    });

    stager.extendStep('feedback', {
        widget: {
            name: 'Feedback',
            root: 'container',
            options: {
                className: 'centered',
                mainText: 'Please leave your comments here',
                minChars: 100,
                minWords: 5,
                requiredChoice: true,
                showSubmit: false,
                // For every widget.
                panel: false,
                title: false
            }
        }
    });

    stager.extendStep('end', {
        donebutton: false,
        frame: 'end.htm',
        cb: function() {
            node.game.visualTimer.setToZero();
        }
    });
};
