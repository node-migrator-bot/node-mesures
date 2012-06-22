Mesures
=======

Exposing key/value over HTTP as a JSON, even in real time.

Mesures, like metrics in French.

Write value on a socket, with `nc` or other low tech tool. Read it with curl.

Test it
-------

Mesure uses [Mocha](http://visionmedia.github.com/mocha/) tests.

    npm install
    npm test

Try it
------

In a terminal

    ./bin/mesures.js

You can specify a config file as first argument. Have a look at _conf.json_

In an other terminnal

    echo "SET answer 42" | nc localhost 8124

In a browser

    http://localhost:1337

[Event source](http://dev.w3.org/html5/eventsource/) :

First event a dump, followings are new values.

    http://localhost:1337/events

First event is a complete dump, following by a simple key/value for each modifications.

Install as a service
--------------------

There is a script to install _mesures_ on a debian like Linux

    sudo ./install_debian.sh

The scripts create a new user _mesures:mesures_, copy the default conf
and install the init.d boot scipt.

Put a nice Nginx in front, it will handle the port 80 for you.

Configuration
-------------

Configuration is done with a json file. It's the first argument for the
_mesures_ script.

### Internal website

* **host**
* **port**
* **homepage** _true_: default website. _false_ : 404 not found. _A path_: default root folder?

Modules
-------

Each modules can access to the _state_ object (in read/write mode) and register
url patterns.

### input/tcp_socket

Send command to the server.
It uses the redis old syntax.
Words are space separated, first word is the action.
Action is case insensitive.
Answer start with a + if it works, a - for an error.

* **port**
* **host** host, 0.0.0.0 if you wont to listen every network interface|

#### Commands

* _SET key value_
* _DELETE key_
* _INCR_ key value [interval (ms)]_

### input/eventsource

Chain different _mesures_ servers listeing each other via eventsource.

* **url** eventsource url
* **prefix** add this prefix to the key

### input/self

rss and V8 head size and usage.

### proc/stats

Fetch metrics from /proc folder.

### output/vapor

Remember old values with a capped list.


Todo
----

 * √ expose stack as JSON over HTTP
 * √ set value over a socket
 * √ expose values as Server Sent Event
 * √ homepage with some javascripts.
 * √ registerable modules
 * √ config file
 * √ chain _mesures_
 * √ self monitoring
 * _ backup JSON file for crash proof
 * _ not only GAUGE, add COUNTER type
 * _ handling [collectd HTTP PUT](http://collectd.org/wiki/index.php/Plugin:Write_HTTP)
 * _ logging
 * _ display timestamp in the graph
 * _ handling statsd UDP protocol

Licence
-------
GPLv3. © Mathieu Lecarme.
