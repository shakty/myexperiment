/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2019 Stefano <info@nodegame.org>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

var ngc = require('nodegame-client');
var J = ngc.JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var channel =  gameRoom.channel;

    // Must implement the stages here.

    stager.setOnInit(function() {
        // Initialize the client.
    });

    stager.extendStep('grouping', {
        cb: function() {
            // Let us assume a 4 player game, and we want 2 groups of two.

            // Returns an array of ids.
            var ids = node.game.playerList.id.getAllKeys();
            // Make two random groups.
            var groups = J.getNGroups(2);
            // Loop through the groups and assign partners.
            for (var i = 0; i < groups.length; i++) {
                // Get array of group members.
                var members = groups[i];
                // Tell each group member about his or her partner.
                node.say('yourpartner', members[0], members[1]);
                node.say('yourpartner', members[1], members[0]);
            }

        }
    });

    stager.extendStep('game', {
        matcher: {
            roles: [ 'DICTATOR', 'OBSERVER' ],
            match: 'round_robin',
            cycle: 'mirror_invert',
            // sayPartner: false
            // skipBye: false,

        },
        cb: function() {
            // This code is no longer relevant for Hands On 3.
            // node.once.data('done', function(msg) {
            //     return;
            //     var offer, observer;
            //     offer = msg.data.offer;
            //
            //     // Validate incoming offer.
            //     if (false === J.isInt(offer, 0, 100)) {
            //         console.log('Invalid offer received from ' + msg.from);
            //         // If dictator is cheating re-set his/her offer.
            //         msg.data.offer = settings.defaultOffer;
            //         // Mark the item as manipulated.
            //         msg.data.originalOffer = offer;
            //     }
            //
            //     observer = node.game.matcher.getMatchFor(msg.from);
            //     // Send the decision to the other player.
            //     node.say('decision', observer, msg.data.offer);
            // });

            console.log('Game round: ' + node.player.stage.round);
        }
    });

    stager.extendStep('end', {
        cb: function() {
            node.game.memory.save('data.json');
        }
    });

    stager.setOnGameOver(function() {
        // Something to do.
    });
};
