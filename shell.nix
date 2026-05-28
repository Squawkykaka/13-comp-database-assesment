{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  packages = [
    pkgs.temurin-bin-25
    pkgs.firebase-tools
    pkgs.typst
    pkgs.tinymist
    pkgs.pnpm
    pkgs.nodejs
    pkgs.oxlint
    pkgs.oxfmt
  ];

  buildInputs = [
    pkgs.vips
    pkgs.gcc.cc.lib
  ];

  LD_LIBRARY_PATH = "${pkgs.gcc.cc.lib}/lib";
}
