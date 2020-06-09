#!/usr/bin/env bash

rm -rf deps && \
mkdir deps && \
cd deps && \
wget https://github.com/protocolbuffers/protobuf/releases/download/v3.10.0/protoc-3.10.0-linux-x86_64.zip -O protoc.zip && \
unzip protoc.zip -d protoc && \
rm protoc.zip
