#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


if [ -z "$1" ]
  then
    echo "No input directory supplied"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "No output directory supplied"
    exit 1
fi

DIR_FILE_PATH=$1
FILE_PATH=("$DIR_FILE_PATH"/*.proto)
OUT_DIR=$2

# Create the generated output dir if it doesn't exist
if [ ! -d "$OUT_DIR" ]; then
  mkdir -p "$OUT_DIR"
fi

# Generate JavaScript
"$DIR"/grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:"$OUT_DIR" \
  --grpc_out="$OUT_DIR" \
  -I "$DIR_FILE_PATH" \
  "${FILE_PATH[@]}"

# Generate TypeScript
"$DIR"/../rabbit-protobuf/deps/protoc/bin/protoc \
  --plugin=protoc-gen-ts="$DIR"/protoc-gen-ts \
  --ts_out="$OUT_DIR" \
  -I "$DIR_FILE_PATH" \
  "${FILE_PATH[@]}"
