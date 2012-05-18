#!/bin/bash

# Node install
npm install -g .

# Users
useradd --system --user-group mesures

# Conf
if [ ! -f /etc/mesures.json ]
then
    cp conf.json /etc/mesures.json
fi

cp init.d/mesures /etc/init.d/mesures
update-rc.d mesures defaults
