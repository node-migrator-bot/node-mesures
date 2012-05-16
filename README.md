Metrics
=======

Exposing key/value over HTTP as a JSON, even in real time.

Write value on a socket, with `nc` or other low tech tool. Read it with curl.

Try it
------

In a terminal

    ./bin/metricsd.js

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

Install the application globaly :

    npm install -g metricsd

An init.d script is provided

    sudo useradd --system --user-group metricsd

Put a nice Nginx in front, it will handle the port 80 for you.

Modules
-------

Each modules can access to the _state_ object (in read/write mode) and register url patterns.

### input/tcp_socket

Set key over a socket, with a minimalistic syntax.

### output/vapor

Remember old values with a capped list.

### proc/stats

Fetch metrics from /proc folder.

Todo
----

 * √ expose stack as JSON over HTTP
 * √ set value over a socket
 * √ expose values as Server Sent Event
 * √ homepage with some javascripts.
 * √ registerable modules
 * √ config file
 * _ backup JSON file for crash proof
 * _ not only GAUGE, add COUNTER type

Licence
-------
GPLv3. © Mathieu Lecarme.
