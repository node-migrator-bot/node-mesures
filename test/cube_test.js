var cube = require('../lib/output/cube');
require('should');

var mockState = { on: function(evt, cb) {}};
var mockRouter = { route: function(path, cb) {}};

describe('Cube', function() {
    it('should accept value', function(done) {
        var c = new cube.Cube(mockState, mockRouter);
        c.set('popo', 42, function() {
            setTimeout(function() {
                c.set('popo', 37, function() {
                    done();
                });
            }, 1500);
        });
    });
    it('should find paths', function() {
        var c = new cube.Cube(mockState, mockRouter);
        c.keys['pim.pam.poum'] = true;
        c.keys['pim.captain.poum'] = true;
        c.keys['apple.potatoe.banana'] = true;

        var r = c.findKey('pim.*.poum');
        r.should.have.lengthOf(2);
        r.should.eql(['pim.pam.poum', 'pim.captain.poum']);
    });
});
