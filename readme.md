# Triva game API

Powered by Express and the [Open Trivia DB](https://opentdb.com/)

See the [repo for the front-end progressive web app](https://github.com/jeremy21212121/trivia-frontend)

Play the game at [JustTrivia.fun](https://justtrivia.fun)

## Status

This server previously made requests to the [Open Trivia DB](https://opentdb.com/) at the beginning of each session, caching each unique questions. All questions are now cached, so performance is much better.

The code needs a refactor and can probably be simplfied. I wrote a thin wrapper that simulates a response from the OTDB but actually queries the local DB. This allowed me to improve performance without significant changes to the code. Now that we don't depend on an external API anymore, the code needs to be refactored.

We handled a surge of about 500 concurrent real users without breaking a sweat, but I still need to do some load testing. I want to be able to support at least 10000 concurrent users, and I'd be really happy if I could handle 100k with 1 vCore/1 GB RAM.

If scaling is required, we can spin up a larger VM and point it at this servers' `memcached` to share a session store. We could use the exisiting server exclusively as a `memcached` server, and spin up a couple application servers, all without losing the current sessions. I don't see significant scaling being required, but it doesn't hurt to have a plan.

## Why

I like to play trivia games on my phone sometimes. I wanted a simple modern trivia web app without ads and crap. It didn't exist, so I made [my first trivia game front end](https://github.com/jeremy21212121/trivia).

It has some flaws, but mostly I just want to be able to select multiple arbitrary categories per game. OpenTrivia DB doesn't support that directly.


## How it works
This simple session-based back-end has two endpoints. They only accept POST requests and expect a JSON-encoded payload.

`/start {categories: [](number string between 9 and 32 or "any")}`
Causes the back-end to fetch questions from the open trivia DB, attach them to the session, and returns the first question to the client. The category numbers refer to the categories provided by the OpenTriviaDB API. Since the API doesn't support multiple categories, multiple API calls may be required.

`/verify {guess: number string between 0 and 3}`
Verifies a guess and returns the next question or game over


## Overview

Session-based, using `memcached` as the session store. Our sessions are quite short, since a game only consists of 10 questions. Unfinished sessions will remain active for up to 24 hours, allowing games to be resumed if the client has preserved its state (ie. browser tab is still open).

The two-endpoint architecture has the benefit of making multiple guesses at the same question impossible. This should make it really hard for clients to cheat, unless they collect the entire open trivia DB.

HTML entities in the questions/answers are decoded with [he](https://github.com/mathiasbynens/he) to prevent a XSS vector. Interpreting questions/answers as html on the client could allow a tainted OpenTriviaDB question to create XSS on the client. Other methods of client side html entity decoding are also less than ideal:
- Use a library: Makes the client app bigger and use more CPU.
- Use DOM API without attaching node to the document: hacky and possibly inconsistent

Upon receiving a valid POST request to `/start`, we request the questions/answers from the OpenTriviaDB API. We store two copies in the session: The questions (without answers) for sending to the client, and answers for verifying the client guesses. As response, we send the first question.

Upon receiving a valid POST to `/verify`, we verify the client's guess. The response includes the correctness of their guess, as well as the next question. This prevents clients from trying to make multiple guesses at the same question. This response does **not** include the correct answer, only whether their guess was correct or not. I have found that returning the correct answer upon an incorrect guess decreases replayability.

Intended to run on linux distros with `systemd`, like Debian or Ubuntu. See `systemd` folder for the service file. This allows systemd to handle starting, stopping, restarting and logging for our server process.

It also expects `memcached` to be running locally on the default port. HTTPS termination and proxying is handled by nginx, which also serves the [web app front-end](https://justtrivia.fun).

## Security

I have covered all the security best practices from [the official docs](https://expressjs.com/en/advanced/best-practice-security.html). Some security headers are added in prod by NGINX, so we don't need to use [helmet](https://www.npmjs.com/package/helmet).

## todo
- ~~~cache responses from [OpenTDB](https://opentdb.com/) to improve `/start` endpoint performance on multi-category games~~~

- Refactor now that we don't depend on an external API
