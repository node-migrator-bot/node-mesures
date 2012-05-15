Metrics
=======

Exposing key/value as a JSON.

Write value on a socket, with `nc` or other low tech tool. Read it with curl.

Install
-------

    npm install -g metricsd

Try it
------

In a terminal

    metricsd

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

An init.d script is provided

    sudo useradd --system --user-group metricsd

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
