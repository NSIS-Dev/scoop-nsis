# scoop-nsis

> Scoop bucket for versioned NSIS releases

## Prerequisites

With [Scoop installed](https://github.com/ScoopInstaller/Install#readme), make sure to add the Bucket.

```powershell
scoop bucket add nsis https://github.com/NSIS-Dev/scoop-nsis
```

## Usage

### NSIS versions

Install any NSIS version

```powershell
# Install specific version
scoop install nsis/nsis-3.12

# Install latest
scoop install nsis/nsis
```

### Formatter

Install [Ardent](https://github.com/idleberg/ardent), a CLI formatter for NSIS scripts

```powershell
scoop install nsis/ardent
```

### Language Server

Install [nsis-lsp](https://github.com/idleberg/nsis-nsl), a language server for NSIS.

```powershell
scoop install nsis/lsp
```

## Related

The many ways of installing NSIS

- [Debian](https://packages.debian.org/stable/nsis)
- [Homebrew](https://formulae.brew.sh/formula/makensis)
- [MacPorts](https://ports.macports.org/port/nsis/)
- [Nix](https://search.nixos.org/packages?show=nsis&size=1)
- [Winget](https://winget.run/pkg/NSIS/NSIS)
