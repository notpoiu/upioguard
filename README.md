# upioguard
A open source lua script protection service. This project is under the [GNU General Public License v3.0](license).

## What is this?
This is a lua script protection service. It protects and gives users a key attached to their discord account. The key can be used to access premium features of the script.

## Why?
Simply put, luarmor is expensive.

## Features
- Dashboard with beautiful UI.
  - analytics
  - user management
  - project settings

- Projects/Scripts
  - Permanent Keys
  - Temporary Keys
  - Checkpoint Keysystem
- Discord Webhooks to log events
- REST API, to be used with other services (like a discord bot)

## How to host with no extra cost?
The easiest way to host it with no extra cost is to use vercel's very generous free tier that includes everything you need to run this project (postgres included).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnotpoiu%2Fupioguard.git&env=AUTH_SECRET,AUTH_DISCORD_ID,AUTH_DISCORD_SECRET&envDescription=Auth.js%20required%20secrets%2C%20to%20generate%20AUTH_SECRET%2C%20run%20this%20command%20in%20terminal%3A%20%60openssl%20rand%20-base64%2033%60%20And%20Discord_ID%20and%20Discord_Secret%20are%20from%20a%20oauth%20application%20made%20in%20discord%20developer%20portal&demo-title=upioguard&demo-description=a%20lua%20script%20protection%20service&demo-url=https%3A%2F%2Fupioguard.vercel.app&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)