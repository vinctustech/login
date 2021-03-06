# Secure Login React.js App

This frontend application is intended to be used with `simple-server` as the backend.

This app implements the essentials of a secure authorization scheme where:

- a JWT access token with a short lifetime is stored only in 
  application state in computer memory
- a distinct JWT refresh token with a longer lifetime is stored securely 
  in the browser as an `httpOnly` cookie

The access token authorizes the user to use authenticated API endpoints.
The refresh token just authorizes the user to get a new access token.
