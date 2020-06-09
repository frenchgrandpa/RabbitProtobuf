/* eslint-disable */
const fs = require("fs");

const dir = process.argv[2];
const fileInfos = fs
    .readdirSync(dir)
    .filter(f => f.endsWith("_pb.js") && !f.endsWith("_grpc_pb.js"))
    .map(f => ({
        fileName: dir + "/" + f,
        content: fs.readFileSync(dir + "/" + f, "utf-8")
    }));


for (const fileInfo of fileInfos) {
    const names = fileInfo.content
        .match(/goog\.exportSymbol\('proto\..*',/g)
        .map(s => s.split("('")[1].split("',")[0]);
    for (const name of names) {
        fileInfo.content = fileInfo.content += `\n${name}.prototype.name = "${name.split("proto.")[1]}";`;
    }
}

for (const fileInfo of fileInfos) {
    fs.writeFileSync(fileInfo.fileName, fileInfo.content, "utf-8")
}
