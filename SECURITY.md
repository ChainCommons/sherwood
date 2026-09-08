# Security policy

## Reporting a vulnerability

Report privately through GitHub's **Report a vulnerability** button on the
Security tab of this repository. Please do not open a public issue for a
vulnerability.

Include what you did, what happened, and what you expected. A proof of concept
helps. You will get an acknowledgement, and we will tell you when a fix ships.

Please do not test against anyone else's data or systems.

## What we consider especially serious

This project handles reconstructions of people's financial lives. The following
are treated as high severity regardless of technical exploitability:

- Anything that causes private taxpayer data to leave the user's device without
  an explicit, informed action.
- Anything that leaks wallet-to-identity mappings, including through a share
  URL, an error report, a log or a cache.
- Anything that would induce the software to request, accept or store a private
  key, seed phrase or recovery phrase. The project has no feature that needs
  one, so any such path is a bug.
- Tampering with the integrity of evidence, content hashes or analysis
  snapshots, which would let a reconstruction be silently altered.
- Anything that causes a legal conclusion to be displayed without its sources.

## Scope

In scope: this repository and the applications built from it.

Out of scope: vulnerabilities in third-party services the software can talk to
(block explorers, price providers) — report those to their maintainers, though
we would still like to know if our handling of their responses is unsafe.

## Handling untrusted input

Chain data, token metadata and marketplace payloads are attacker-controlled.
They are treated as untrusted throughout, and contributions must keep them that
way: never render token metadata as HTML, never trust `decimals` from metadata
without recording it as an unverified fact, never follow a URL out of a token's
metadata by default.

## No key material

The project does not request, accept, transmit or store private keys, seed
phrases or recovery phrases. There is no legitimate reason for a pull request to
add one, and CI scans for anything shaped like one.
