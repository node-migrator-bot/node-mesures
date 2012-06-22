var state = require('../lib/state');
require('should');

describe('State', function() {
    it('should get and set value', function() {
        var s = new state.State();
        s.set('popo', 42);
        s.get('popo').should.equal(42);
    });
});
