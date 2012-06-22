var state = require('../lib/state');
require('should');

describe('State', function() {
    it('should get and set value', function() {
        var s = new state.State();
        s.set('popo', 42);
        s.get('popo').should.equal(42);
    });
    it('should set a value after some time', function(done) {
        var s = new state.State();
        s.on('set', function(key, value) {
            s.get('popo').should.equal(3);
            done();
        });
        s.incr('popo', 1, 10);
        s.incr('popo', 2);
    });
});
