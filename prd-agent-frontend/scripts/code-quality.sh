#!/bin/bash

yarn lint:eslint
yarn format:check
yarn ci
yarn test