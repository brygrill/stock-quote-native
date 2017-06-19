#!/bin/sh

cd /usr/docker-quoteum/services

docker-compose restart gdax

docker-compose restart iex

docker-compose restart coincap
