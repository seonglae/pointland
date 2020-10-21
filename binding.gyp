{
  "targets": [
    {
      "target_name": "hw",
      "cflags!": [
        "-fno-exceptions"
      ],
      "cflags_cc": [
        "-std=c++17"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "sources": [
        "addon/convert.cc"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ]
    }
  ]
}