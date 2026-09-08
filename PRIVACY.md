# Privacy

This document describes how the software is designed to behave. It is a
commitment about the code in this repository.

## The short version

Your financial data stays on your device unless you deliberately move it. There
is no account requirement for analysis, and there is no background upload of
your ledger.

## What stays local

By default, all of it:

- imported raw evidence and the original payloads behind it
- wallet addresses and the mapping from addresses to you or your entities
- reconstructed transactions, events, valuations, lots and positions
- findings, annotations and analysis snapshots
- your participant profile, residency and capacity answers

Local storage means the browser's origin-private filesystem on your own device,
or a project file you export yourself.

## What leaves your device, and only when it must

- **Public knowledge lookups.** Reading jurisdictions, sources and rules fetches
  public data. These requests do not carry your ledger.
- **Chain and price queries.** Reconstructing a wallet's history means asking a
  block explorer about addresses, and asking a price provider about assets and
  timestamps. Those services necessarily see what you ask them. The addresses
  you query are visible to the provider you query; that is a property of using a
  third-party API, and it is why provider choice is configurable and responses
  are cached locally so a rerun needs no network.
- **Anything you explicitly share or export.** A share link, a professional
  export or a bug report contains what you chose to put in it.

Wallet-ownership mappings are never included in a public share URL.

## What we never ask for

Private keys, seed phrases and recovery phrases. The software cannot use them,
never asks for them, and treats any prompt for them as a bug or an attack. Read
a wallet's history by its public address only.

## No account for core analysis

Core analysis works without signing in. Where an account exists for optional
collaboration features, declining it must not remove analytical capability.

## Third parties

Block explorers and price providers have their own privacy practices, which this
project does not control. Where the software can offer a choice of provider, it
does, and it records which one produced a given number.

## Telemetry

No analytics or usage telemetry that includes financial data, addresses or
ledger contents. If optional diagnostics are ever added, they will be off by
default and will state exactly what they send.
