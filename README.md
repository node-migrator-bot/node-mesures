Mesures
=======

Exposing key/value over HTTP as a JSON, even in real time.

Mesures, like metrics in French.

Write value on a socket, with `nc` or other low tech tool. Read it with curl.

Try it
------

In a terminal

    ./bin/mesures.js

You can specify a config file as first argument. Have a look at _conf.json_

In an other terminnal

    echo "answer 42" | nc localhost 8124

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

Modules
-------

Each modules can access to the _state_ object (in read/write mode) and register url patterns.

### input/tcp_socket

Set key over a socket, with a minimalistic syntax.
Answer _ok_ or _error_.

* **port**
* **host** host, 0.0.0.0 if you wont to listen every network interface|

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

Licence
-------
GPLv3. © Mathieu Lecarme.
