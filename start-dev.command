#!/bin/bash
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 1
cd ~/business-os
npm run dev
