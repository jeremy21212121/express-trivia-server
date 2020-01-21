# Triva game API

Powered by Express and the Open Trivia DB

## Status

This project is currently MVP. It works and is stable.

## Why

I used the OpenTriviaDB directly from the front-end of an earlier web-based trivia game I made. This makes it very easy to cheat, just by opening the inspector in the browser. This aims to prevent this method of cheating, as well as simplifying the front-end by executing nearly all the logic in the back-end.


## How it works
This simple session-based back-end has two endpoints. They only accept POST requests and expect a JSON-encoded payload.

`/start {categories: [](number string between 9 and 32 or "any")}`
Causes the back-end to fetch questions from the open trivia DB, attach them to the session, and returns the first question to the client. The category numbers refer to the categories provided by the OpenTriviaDB API. Since the API doesn't support multiple categories, multiple API calls may be required.

`/verify {guess: number string between 0 and 3}`
Verifies a correct answer and returns the next question or game over


## Architecture

Session-based, using `memcached` as the session store. Our sessions are quite short, since a game only consists of 10 questions. Unfinished sessions will remain active for up to 24 hours, allowing games to be resumed if the client has preserved its state (ie. browser tab is still open).

Upon receiving a valid POST request to `/start`, we request the questions/answers from the OpenTriviaDB API. We store two copies in the session: The questions (without answers) for sending to the client, and answers for verifying the client guesses. As response, we send the first question.

Upon receiving a valid POST to `/verify`, we verify the client's guess. The response includes the correctness of their guess, as well as the next question. This prevents clients from trying to make multiple guesses at the same question. This response does **not** include the correct answer, only whether their guess was correct or not. I have found that returning the correct answer upon an incorrect guess decreases replayability.

Intended to run on linux distros with `systemd`, like Debian or Ubuntu. It will ultimately include a systemd service file for daemonizing this service, much like the one that is included with my [nodemailer-contact-form](https://github.com/jeremy21212121/nodemailer-contact-form) repo. It also expects `memcached` to be running locally on the default port. HTTPS termination and proxying is handled by nginx, which will also serve the web app front-end, when it is completed.

