var cube = require('../lib/output/cube');
require('should');

var mockState = { on: function(evt, cb) {}};

describe('Cube', function() {
    it('should accept value', function(done) {
        var c = new cube.Cube(mockState, {});
        c.set('popo', 42, function() {
            setTimeout(function() {
                c.set('popo', 37, function() {
                    done();
                });
            }, 1500);
        });
    });
});
