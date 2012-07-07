var cube = require('../lib/output/cube'),
    hoard = require('hoard'),
    path = require('path'),
    fs = require('fs');
require('should');

var mockState = { on: function(evt, cb) {}};
var mockRouter = { route: function(path, cb) {}};

//[FIXME] clean hoard tables before test
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
    it('should get some values', function(done) {
        var DB = '/tmp/get_test';
        var c = new cube.Cube(mockState, mockRouter);
        feed(DB, 1000, function() {
            var now = Math.floor(Date.now() / 1000);
            var chrono = Date.now();
            function mean(cb) {
                c.get('get_test MEAN', now - 50 , now, 5, function(err, values) {
                    if (err) throw err;
                    console.log('mean', values);
                    cb();
                });
            }
            function min(cb) {
                c.get('get_test MIN', now - 50 , now, 5, function(err, values) {
                    if (err) throw err;
                    console.log('min', values);
                    cb();
                });
            }
            function max(cb) {
                c.get('get_test MAX', now - 50 , now, 5, function(err, values) {
                    if (err) throw err;
                    console.log('max', values);
                    cb();
                });
            }
            function median(cb) {
                c.get('get_test MEDIAN', now - 50 , now, 5, function(err, values) {
                    if (err) throw err;
                    console.log('median', values);
                    cb();
                });
            }
            mean(function(cb) {
                min(function(cb) {
                    max(function(cb) {
                        median(function(cb) {
                            console.log("Chrono", Date.now() - chrono);
                            done();
                        });
                    });
                });
            });



        });
    });
});

/*
 * Create a random hoard db.
 */
function feed(db, size, cb) {
    if (fs.existsSync(db)) {
        fs.unlinkSync(db);
    }
    hoard.create(db, [[1, 100], [10, 6000]], 0.5, function(err) {
        if (err) throw err;
        var now = Math.floor(Date.now() / 1000);
        var cpt = size;
        //[FIXME] use hoard multiple assignement.
        var update = function() {
            cpt--;
            if (cpt == 0) {
                cb.call();
            } else {
                hoard.update(db, Math.floor(100 * Math.random()), now - cpt,
                    update);
            }
        }
        update();
    });

}
