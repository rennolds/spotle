<div>
  <h1>Authentication Error</h1>
  <p>An error occurred while authenticating your account.</p>
  <p>This could happen if:</p>
  <ul>
    <li>The magic link has expired (they expire after a few minutes)</li>
    <li>The magic link has already been used</li>
    <li>There was a network issue during authentication</li>
  </ul>
  <p>
    <a href="/login">Please try logging in again</a> to get a new magic link.
  </p>
</div>

<style>
  div {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    text-align: center;
  }

  ul {
    text-align: left;
    margin: 1rem 0;
  }

  a {
    color: #007bff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
